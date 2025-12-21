---
title: "ASPLOS 2026 Tutorial: Building Efficient Large-Scale Model Systems with DeepSpeed: From Open-Source Foundations to Emerging Research"
layout: default
---

# ASPLOS 2026 Tutorial  
## Building Efficient Large-Scale Model Systems with DeepSpeed: From Open-Source Foundations to Emerging Research

---

## Organizers

- **Olatunji Ruwase**, Snowflake  
- **Minjia Zhang**, University of Illinois Urbana-Champaign  
- **Masahiro Tanaka**, Anyscale  
- **Zhipeng Wang**, LinkedIn  

---

## Overview

Large foundation models such as ChatGPT, Gemini, and DeepSeek have redefined the frontier of AI systems, yet their massive scale exposes significant challenges in distributed pre-training/post-training (e.g. reinforcement learning and supervised fine-tuning), efficiency, and hardware utilization. The community increasingly relies on open-source software to bridge these gaps, which enables researchers and practitioners to experiment, prototype, and optimize at unprecedented scale. Among these, DeepSpeed (https://www.deepspeed.ai) has become one of the most widely adopted open-source frameworks for large-model training, which empowers both academic research and industrial production deployments. 

In this tutorial, we will present the system, compiler, and hardware co-design techniques that extend DeepSpeed into a powerful platform for scalable and efficient training of large foundation models. We will cover how DeepSpeed’s runtime architecture supports new forms of distributed and heterogeneous execution, and how software-hardware co-design drives innovation in parallelism, offloading, and memory optimizations.  Through a series of concrete systems and hands-on system insights, such as DeepSpeed-SuperOffload for training LLMs on emerging GPU-CPU Superchips, combining DeepSpeed’s high-performance training with Ray’s flexibility for complex distributed workloads including RL, DeepCompile for compiler-driven distributed optimizations, and DeepSpeed on TPU for heterogeneous hardware, we will connect core system design principles to real-world system implementation. By the end, participants will leave with both conceptual understanding of large-model system design and concrete techniques to apply in their own research, helping to build the next generation of efficient, scalable, and open AI infrastructures.

---

## Tutorial Content and Tentative Schedule

### 1. Introduction and Motivation (45 minutes)  
**Tunji Ruwase**

- Challenges in scaling large foundation models, including the memory wall, communication bottlenecks, and heterogeneous hardware environments  
- Overview of DeepSpeed, covering core components such as runtime architecture, usability, and key system optimizations  
- Open challenges and future roadmap:
  - Cross-platform runtime design  
  - Energy-efficient training  
  - Fine-grained scheduling  
  - Integration with ML compilers  

---

### 2. Ray + DeepSpeed for LLM Training (45 minutes)  
**Masahiro Tanaka**

- Integrating Ray and DeepSpeed for reinforcement learning:
  - Flexible orchestration of distributed training and inference within a unified controller architecture  
- Disaggregated hybrid parallelism for multimodal models:
  - Applying optimal parallelization strategies to different components (e.g., encoders and LLMs) enabled by the flexible integration of Ray and DeepSpeed  
- Compiler-level optimization with DeepCompile:
  - Automating communication scheduling and sequence parallelism via compiler analysis and distributed graph transformation  
- Live demos and practical examples  

---

### Coffee Break (30 minutes)

---

### 3. DeepSpeed-Based Systems Optimization for LLM Training (45 minutes)  
**Minjia Zhang**

- Hardware–software co-design for emerging architectures:
  - *SuperOffload* — novel offloading and scheduling techniques for superchip platforms  
- Resilience in large-scale training:
  - *Universal Checkpointing* for flexible checkpointing, reconfigurable parallelism, and resilient training under hardware and software failures  
- DeepSpeed for sparse model training (optional):
  - *X-MoE* for fine-grained Mixture-of-Experts training  
- DeepSpeed4Science (optional):
  - *MegaFold* — system-level optimizations for scaling biomolecular modeling workloads  

---

### 4. Training LLMs on Alternative Accelerators and Novel Optimizers (45 minutes)  
**Zhipeng Wang**

- Hardware–software co-design for emerging model architectures on non-GPU accelerators (using TPU as an example)  
- Scaling LLM distributed training on non-GPU accelerators with DeepSpeed  
- DeepSpeed support for scalable LLM training with novel optimizers (e.g., *Muon Optimizer*)  

---

## Target Audience and Prerequisites

**Target Audience**
- Researchers and practitioners working on large-scale LLM training
- Systems and architecture researchers interested in AI workloads
- Engineers building distributed training and serving systems

**Prerequisites**
- Basic familiarity with deep learning and transformer models  
- Working knowledge of PyTorch or similar frameworks  
- Prior experience with distributed training is helpful but not required

---

## Additional Information

This page serves as a placeholder for the ASPLOS 2026 tutorial website.  
**More details will be posted as the program is finalized.**  

The final tutorial program will be available by **February 17, 2026**.
