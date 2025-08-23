---
title: "Revealing the Internal of Agentic Memory: Mem0"
date: 2025-08-14
lastmod: 2025-08-14
draft: false
summary: "Deep dive into Mem0’s indexing, retrieval and generation pipeline with LOCOMO as the benchmark."
categories: ["Gen AI"]
tags: ["agentic-memory", "retrieval", "Mem0", "LOCOMO"]
contributors: []
authors: ["ssail"]          # 对应 data/authors/ssail.yaml（若你已做作者侧栏）
hero: "hero.png"            # 放在同目录即可；没有就删掉
toc: true                   # 如果你想在右侧/左侧显示目录（Doks 支持）
readingTime: true           # 若想显示阅读时长（Doks 参数，可在 params 中启用）
---



* * *

### Why Agentic Memory Matters

Large Language Models (LLMs) revolutionized NLP, but their memory is transient — once the session ends, all context is lost. To build systems capable of sustained interaction, planning, and personalization, we need **agentic memory**.

Agentic memory systems like **Mem0**:

*   Store and manage long-term information.
*   Enable multi-session interactions.
*   Provide personalized experiences through structured memory operations.

This blog dives deep into Mem0’s core pipeline — **Indexing**, **Retrieval**, and **Generation** — using the **LOCOMO dataset** as our benchmark.

### 1\. Indexing: From Message to Persistent Memory

### Turn-by-Turn Memory Insertion

Contrary to what some documentation may imply, **Mem0 inserts memory one message at a time** — not by concatenating a full conversation window.

For example, the following message is individually passed into the memory insertion pipeline:

{"role": "user", "content": "Alice: I like sushi."}

#### Step 1: Message Formatting

The message is first parsed via:

def parse\_messages(messages):
    response = ""
    for msg in messages:
        if msg\["role"\] == "user":
            response += f"user: {msg\['content'\]}\\n"
        if msg\["role"\] == "assistant":
            response += f"assistant: {msg\['content'\]}\\n"
    return response

This will provide clean input to LLM:

user: Alice: I like sushi

#### Step 2: Fact Extraction via LLM

The formatted message is passed to a prompt-based fact extractor:

LLM Prompt :

> _“Extract relevant facts and preferences about the user from the following message…”_

**LLM Output:**

{"facts": \["Likes sushi"\]}

There’s **no hard-coded upper limit** on the number of facts. The LLM may also return an empty list when the message contains no extractable information.

#### Step 3: Embedding

Each fact is embedded using `sentence-transformers/all-MiniLM-L6-v2`, producing a 384-dimensional vector.

embedding = model.encode(fact)

#### Step 4: Storing into Vector Index (FAISS)

All embeddings are stored in a **FAISS FlatL2** index, paired with metadata (`user_id`, `run_id`, timestamps, etc.). This supports **exact nearest-neighbor search**, which is especially helpful for debugging and reproducibility.

### Part 2: Retrieval — Memory Access at QA Time

When answering a question, Mem0 performs memory retrieval through the following pipeline:

#### Step 1: Filter Construction

\_, effective\_filters = \_build\_filters\_and\_metadata(
    user\_id=user\_id, agent\_id=agent\_id, run\_id=run\_id, input\_filters=filters
)

At least one of `user_id`, `agent_id`, or `run_id` must be provided.
 In my setup:

*   During **insertion**, I used both `user_id` and `run_id`
*   During **retrieval**, I used only `run_id` to **simulate noise**

#### Step 2: Parallel Search (Vector + Graph)

with ThreadPoolExecutor() as executor:
    future\_memories = executor.submit(self.\_search\_vector\_store, query, effective\_filters, limit, threshold)
    future\_graph\_entities = (
        executor.submit(self.graph.search, query, effective\_filters, limit) if self.enable\_graph else None
    )

Graph search is optional and disabled in my setup.

#### Step 3: Vector Search

The query is embedded and searched against the index:

embeddings = self.embedding\_model.embed(query, "search")
memories = self.vector\_store.search(query=query, vectors=embeddings, limit=limit, filters=filters)

Supports multiple backends: FAISS, Pinecone, Qdrant, etc.

#### Step 4: Postprocessing Results

Each retrieved memory is formatted into a `MemoryItem`, enhanced with:

*   Promoted metadata (e.g., `user_id`, `timestamp`)
*   Additional metadata fields
*   Similarity score filtering

Only entries exceeding the similarity threshold (if any) are kept.

### Part 3: Generation — Producing Answers with Retrieved Memory

#### Step 1: Memory Preprocessing

Memory entries are timestamped and grouped by speaker:

search\_1\_memory = \[ f" {item\[ 'metadata' \]\[ 'timestamp' \]} : {item\[ 'memory' \]} " 查找speaker\_1\_memories中的项目
search\_2\_memory = \[ f" {item\[ 'metadata' \]\[ 'timestamp' \]} : {item\[ 'memory' \]} " 查找speaker\_2\_memories中的项目

#### Step 2: Prompt Construction

Mem0 uses a templated prompt defined via **Jinja2**, structured to reflect speaker roles and memory groups:

answer\_prompt = template.render(
    speaker\_1\_user\_id=speaker\_a\_user\_id.split("\_")\[0\],
    speaker\_2\_user\_id=speaker\_b\_user\_id.split("\_")\[0\],
    speaker\_1\_memories=json.dumps(search\_1\_memory, indent=4),
    speaker\_2\_memories=json.dumps(search\_2\_memory, indent=4),
    speaker\_1\_graph\_memories=json.dumps(None, indent=4),
    speaker\_2\_graph\_memories=json.dumps(None, indent=4),
    question=question,
)

This ensures all relevant memory chunks are explicitly presented to the LLM alongside the current question.

#### Step 3:LLM-Based Answer Generation

The constructed prompt is passed to **OpenAI’s GPT-4o-mini** model to generate the final answer:

response = client.chat.completions.create(
    model=os.getenv("MODEL", "gpt-4o-mini"),
    messages=\[{"role": "system", "content": answer\_prompt}\],
    temperature=0.0  # Deterministic generation
)

If this fails (e.g., due to API error), a fallback method generates a basic response using simpler heuristics.

* * *

### LOCOMO Evaluation Notes

*   This full memory-to-answer pipeline is evaluated on the **LOCOMO** benchmark, which tests long-term memory usage in multi-turn QA.
*   Answer quality is measured via **F1 score**, comparing generated answers with ground truth.

[View original.](https://medium.com/p/60d8dbf79137)

Exported from [Medium](https://medium.com) on August 14, 2025.
