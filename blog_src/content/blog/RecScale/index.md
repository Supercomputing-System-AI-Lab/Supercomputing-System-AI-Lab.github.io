---
title: "RecScale: System-Aware Scaling Laws for Deep Learning Recommendation Models"
date: 2025-10-12
lastmod: 2025-10-14
draft: false
summary: "This blog presents the motivation, designs, and key results behind Recscale."
categories: []
tags: ["llm-inference", "gpu-optimization", "gpu"]
contributors: []
authors: ["Wangjia_Zhan","Tong_Wei", "Minjia_Zhang","SSAIL"]
time-to-read: 8
---

<div class="voltanallm-content">

Scaling laws have guided the design of increasingly large machine learning models. For example, scaling laws in NLP, established by OpenAI and others, show that model performance improves predictably with increased parameters and training tokens, motivating the exponential growth of large language models (LLMs). So naturally, this made us wonder: can Deep Learning Recommendation Models (DLRMs) benefit from similar scaling laws? While Recent studies have begun characterizing scaling behavior in recommendation systems, they overlook critical system-level constraints—such as communication overhead, memory limitations, and embedding sharding strategies. This is why we built RecScale, a system that extends scaling laws for DLRMs with a system-aware perspective.

At a glance, RecScale achieves up to **16× memory reduction** and **3.31× end-to-end training speedup** on 64 GPUs while preserving both accuracy and scaling-law trends. These results show that DLRMs can continue scaling efficiently once we eliminate memory and communication bottlenecks.

## What makes it so hard to scale DLRMs

Through our investigation, we identified two key challenges while further scaling DLRMs:

### 1. Memory Wall from Embedding Tables

Unlike LLMs, DLRMs are embedding-heavy—embeddings account for 99% of total parameters in industrial-scale cases. Even scaling-law-friendly DLRMs (Wukong model) remain bottlenecked by the embedding memory wall. This motivates us to reduce embedding memory while explicitly preserving scaling-law behavior.

### 2. Communication Wall in Row-wise Parallelism

The large embedding tables require splitting across devices using row-wise parallelism. However, conventional implementations based on bucketization and reduce-scatter introduce significant redundancy and bandwidth limitations during distributed training. This motivates us to optimize communication patterns to enable scalability across multi-node, multi-GPU clusters. (Figure 5, Figure 8)

These two challenges—memory and communication—motivated us to build RecScale.

## The RecScale Design

### 1. Wukong++

1. QR-based Embedding Compression
2. Head Cache Enhancement
3. Memory Reinvestment to Overarch.

### 2. SRP (Figure 9)

**(a) Embedding compaction:** In baseline RP, each GPU pads query buckets to a fixed size, creating large zero-filled buffers as GPU count increases. SRP replaces this with embedding compaction — after local lookups, it extracts only valid embeddings for each peer and packs them contiguously without padding. It also records metadata for communication splits and reconstruction, effectively removing zeros and redundant transfers while preserving correctness.

**(b) Sparse-aware all-to-all:** After compaction, each GPU holds contiguous valid embedding buffers and metadata for its peers. Instead of using fixed-size reduce-scatter and all-gather operations that waste bandwidth on zeros, SRP adopts a variable-sized all-to-all-single exchange based on per-peer split sizes. During the forward pass, metadata guides each GPU to scatter received embeddings into the correct [B,F,D] positions. In the backward pass, the same metadata maps gradients back to their corresponding rows, while non-local positions are zero-filled — ensuring full equivalence to baseline RP semantics without redundant data transfer.

**(c) Result reconstruction and kernel optimization:** While SRP removes redundant communication, it adds extra pre- and post-processing (e.g., extracting non-zero indices, packing, and reconstructing embeddings). In PyTorch, these steps would normally trigger multiple kernels and heavy memory I/O, offsetting communication gains.

To address this, SRP uses fused Triton kernels that combine all stages—nonzero detection, coordinate assignment, packing, and reconstruction—into single, efficient kernels. Each kernel is block-parallel and memory-coalesced, using a Block-Aggregated Atomic scheme: instead of many atomic updates, each block reserves one output segment and assigns offsets via prefix-sums, greatly reducing contention.

In the backward pass, gradient filtering and packing are also fused, ensuring contiguous memory access and eliminating scattered writes. This fused design minimizes kernel launches and atomic overhead, amortizing preprocessing costs and significantly boosting end-to-end throughput.

## Evaluation Highlights

### 1. Main result

### 2. Wukong++

### 3. SRP

**(a) Communication Efficiency (Table 3):** SRP drastically reduces communication volume. At 64 GPUs, total traffic drops from 54.9B → 651M tensor elements, more than an order of magnitude reduction. This is because SRP sends only non-zero embeddings, avoiding the replicated padding seen in traditional reduce-scatter/all-gather.

**(b) Scaling Behavior (Figure 13):**

**Strong Scaling:** With a fixed global batch size, SRP maintains higher throughput as GPU count increases, while the baseline plateaus due to bandwidth limits.

**Weak Scaling:** With fixed per-GPU batch size, SRP sustains near-linear scaling — consistently outperforming the baseline even at large GPU counts.

**(c) Kernel Optimization Speedup (Figure 14)**

SRP's fused Triton kernels cut preprocessing overhead by over 70%, merging multiple stages (nonzero detection, packing, and reconstruction) into single efficient kernels. This ensures that the savings from reduced communication aren't offset by added compute costs.

**(d) Correctness Validation (Figure 15)**

SRP preserves training correctness. Loss curves on the Criteo dataset are identical to the baseline, confirming that SRP's optimizations only reorder data without changing its semantics.




Why is energy-efficient LLM serving important but hard?
-------------------------------------------------------

Large Language Models (LLMs) have become the backbone of modern AI services—chatbots, coding assistants, agent pipelines—but their **energy footprint is massive[[2]](#ref2),[[3]](#ref3)**. Inference alone can account for **90%+ of AI infrastructure utilization**[[1]](#ref1), pushing datacenter power and cooling limits. For context, large datacenters already draw power equivalent to millions of households.

At the same time, LLMs are increasingly used in **latency-sensitive applications**, where violating SLOs like Time-to-First-Token (TTFT) or Inter-Token Latency (ITL) degrades user experience. This creates a difficult tension: **Can we even save energy without harming the SLO guarantees?**

We started by profiling LLM inference on NVIDIA A100s, expecting the usual tradeoff: lower frequency saves energy at the cost of latency. But our experiments told a different story.

* * *

Key observations
----------------

We discuss our key observations here which will build the foundation of our insights and consequently our design. These observations helped us build VoltanaLLM as an efficient and adaptive system.

### 1\. **U-shaped energy-frequency curves**

Instead of energy monotonically dropping with frequency, we saw a **U-shaped relationship**:

*   At **low frequencies**, execution time dominates, so energy-consumption (power x time) rises fast.
*   At **high frequencies**, power dominates as it increases hyper-linearly with frequency, raising the energy consumption again.
*   In the middle lies a **sweet spot**—but its exact location differs for varying hardware, workloads, and even **prefill** (compute-heavy) vs. **decode** (memory-heavy) phases.

![U-shaped energy-frequency curve for prefill and decode](img/u-curve.png)

### 2\. **Temporal variation in prefill vs. decode demand**

Using the Azure LLM Inference Trace 2024, we found that real workloads don’t stay balanced. This is also previously studied for a variety of applications that observe diurnal variation in demand on the internet.

*   **Conversation requests** → stable decode demand.
*   **Code requests** → strong diurnal variation, peaking in afternoons, with shorter decodes.
*   Overall → the **prefill/decode ratio skews dynamically over time**, meaning a one-size-fits-all frequency policy is inefficient.

![Daily variation of prefill/decode demand.](img/temporal.png)

### 3\. **Batch size boundaries create inefficiency**

GPUs do not scale workload efficiency smoothly as batch sizes increase. When a batch crosses certain thresholds (for example, from 128 to 129 requests), the hardware can no longer keep all of its processing units fully occupied. Even though some units sit idle, the GPU still expends a full cycle of computation, which shows up as **staircase-like jumps** in both inter-token latency (ITL) and energy-per-token (EPOT). This is a bit like a bus leaving the station half empty but still burning the same fuel for the trip. The effect is most pronounced during the _decode phase_, where batches are smaller and more frequently hover near these thresholds, making the inefficiency much more visible than in prefill.

![ITL and EPOT staircase pattern.](img/staircase.png)

_Takeaway:_ Energy efficiency in LLM serving isn’t just about lowering GPU frequency. It requires **phase-aware, adaptive control** that can handle workload variation and hardware quirks.

* * *

</div>

The VoltanaLLM design
---------------------

VoltanaLLM is built on top of prefill/decode (P/D) disaggregation architectures (supported in engines like SGLang and vLLM), which naturally separate the two phases onto different GPU instances. This separation is key: it lets us apply **phase-specific optimizations which get surpressed in traditional serving due to distinct and interfering properties of the prefill and decode phases.**.

VoltanaLLM introduces three core components:

### 1\. EcoFreq: **Feedback-driven frequency controller from a control theory perspective**

![EcoFreq loop and latency budgeting.](img/ecofreq1.png)

*   Runs a lightweight control loop inspired from control theory (<4 ms).
*   Adjusts GPU frequency per batch, using load metrics and latency predictions.
*   Selects the lowest safe frequency that satisfies SLOs.
*   Handles prefill differently from decode (accounts for waiting time in queues for TTFT).
*   Uses **pyNVML** instead of **nvidia-smi**, avoiding the usual larger overhead.

![EcoFreq loop and latency budgeting.](img/ecofreq2.png)

### 2\. EcoRoute: **State-space navigation router**

![EcoRoute asymmetric routing vs. round-robin.](img/ecoroute1.png)

*   Instead of round-robin, EcoRoute runs “what-if” analyses in the **state space** of decode instances.
*   Routes asymmetrically to avoid batch-size boundaries, keeping one instance in low-frequency regime instead of both in higher frequency regimes.
*   Falls back gracefully to round-robin when boundaries aren’t in play.

![EcoRoute asymmetric routing vs. round-robin.](img/ecoroute2.png)

### 3\. EcoPred: **Load-aware latency predictor**

*   Simple linear regression model.
*   Prefill latency ~ batch token count.
*   Decode latency ~ requests + KV cache tokens.
*   Accuracy: ~7–14 ms MAE for TTFT, ~2–3 ms MAE for ITL.
*   Overhead: negligible (<0.1 ms).

![EcoPred regression fits.](img/ecopred.png)

* * *

Evaluation highlights
---------------------

We implemented VoltanaLLM on **SGLang (v0.4.7)** and tested on **A100 GPUs** with three models (Ministral-3B, LLaMA-3.1-8B, Qwen3-32B) and two datasets (ShareGPT, LMSYS-Chat-1M).

**Main results (2 prefill, 2 decode instances):**

*   **Energy savings:** Up to **36.3%** vs. static max-frequency baseline.
*   **SLO attainment:** Comparable to always running at 1410 MHz (max-frequency).
*   **Workload robustness:** Benefits held across request rates, workloads, and SLO profiles.

![Energy and SLO attainment comparison.](img/main-result.png)

### Module-level breakdown

*   **EcoFreq only:** major energy savings by adaptive frequency scaling.
*   **EcoRoute added:** extra savings in decode by avoiding batch-size boundary inefficiencies.

![EcoFreq vs. EcoFreq+EcoRoute.](img/modulewise.png)

### Per-iteration responsiveness matters

Compared to window-based frequency control (e.g., 5s intervals in DynamoLLM):

*   **Window-based:** degrades SLOs, especially in prefill (batch sizes fluctuate rapidly).
*   **VoltanaLLM per-iteration:** adapts instantly, maintaining energy savings and latency targets.

![Latency attainment vs. control interval.](img/iterationmatters.png)

### Flexible SLO trade-offs

By tuning SLO thresholds:

*   **Tight SLOs:** VoltanaLLM behaves closer to max frequency.
*   **Relaxed SLOs:** Operates more at low frequency, increasing energy savings.

![Latency/energy tradeoffs under different SLO profiles.](img/slo-flex.png)

* * *

Practical lessons from building VoltanaLLM
------------------------------------------

1.  **Frequency switching overhead is real.** Calling **nvidia-smi** was too slow (~50 ms). Using **pyNVML** in a separate process brought it down to ~3 ms, enabling per-iteration responsiveness.
2.  **Prefill vs. decode control loops must be distinct.** Prefill TTFT includes both waiting and execution time; decode ITL does not. Mixing them breaks guarantees.
3.  **Batch boundaries dominate decode inefficiency.** EcoRoute’s boundary-aware routing avoided forcing _both_ instances into high frequency—an insight that wouldn’t emerge without fine-grained profiling.
4.  **Simple models beat complex ones.** Linear regression was fast, interpretable, and accurate enough. More complex ML models would have added overhead with little benefit.
5.  **Granularity tradeoffs matter.** More frequency levels gave slight energy improvements but slightly lower SLO attainment. Two levels (\[1005, 1410\] MHz) hit a good balance.

Closing thoughts
----------------

VoltanaLLM shows that **energy-efficient LLM serving isn’t just about hardware knobs**; it’s a systems problem. By combining **control theory insights**, **phase-specific frequency scaling**, and **routing-aware scheduling**, VoltanaLLM achieves double-digit energy savings without compromising user-facing performance.

As LLM deployment scales further, we believe these ideas—**fine-grained, feedback-driven, and phase-aware control**—will be critical for sustainable AI infrastructure.

* * *

<div class="references">
<div id="ref1">[1] Radosvet Desislavov, Fernando Martínez-Plumed, José Hernández-Orallo, "Trends in AI inference energy consumption: Beyond the performance-vs-parameter laws of deep learning," Sustainable Computing: Informatics and Systems, Volume 38, 2023. <a href="https://doi.org/10.1016/j.suscom.2023.100857" target="_blank" rel="noopener">DOI: 10.1016/j.suscom.2023.100857</a> [↩](#ref1)</div>

<div id="ref2">[2] Esha Choukse et al., "Power Stabilization for AI Training Datacenters," 2025. <a href="https://arxiv.org/abs/2508.14318" target="_blank" rel="noopener">arXiv:2508.14318</a> [↩](#ref2)</div>

<div id="ref3">[3] Cooper Elsworth et al., "Measuring the environmental impact of delivering AI at Google Scale," 2025. <a href="https://arxiv.org/abs/2508.15734" target="_blank" rel="noopener">arXiv:2508.15734</a> [↩](#ref3)</div>
</div>

* * *

