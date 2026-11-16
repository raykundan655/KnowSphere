# Part 1 – KnowSphere: Knowledge Base AI Platform

## Project 1
### Deep technical preparation

Based on the KnowSphere section of your uploaded resume. kundan resume current_v6(3).pdf

codelabs.developers.google.com

---

## 1. Understand your project completely

Before learning individual technologies, you must be able to explain what you built and why it is useful.

### Q1. Explain your KnowSphere project in detail.

**Answer:**

KnowSphere is a multi-tenant, Retrieval-Augmented Generation (RAG)-based knowledge platform that allows users to interact with their documents through an AI-powered conversational interface.

The main problem I wanted to solve was that users often have large amounts of information stored in documents, and finding specific information manually can be time-consuming. Traditional keyword-based searching may also fail when a user asks a question using different words from the document.

To solve this problem, I built a system that processes documents, converts their content into numerical embeddings, stores those embeddings in a vector database, and retrieves relevant information when a user asks a question.

The platform uses SentenceTransformers to generate embeddings and Qdrant Cloud to perform semantic vector search. When a user asks a question, the system searches for relevant document chunks and uses Google Gemini to generate a response based on the retrieved information.

I used FastAPI for the backend API and MongoDB Atlas and Supabase for knowledge-base management and supporting data or storage operations.

Another important feature is multi-tenancy. The platform is designed to support multiple users or tenants while keeping their knowledge-base data isolated.

Overall, the goal of KnowSphere is to make document-based information retrieval more intelligent, contextual, and convenient.

**What the interviewer expects you to explain:**
- What problem the project solves.
- Why you selected RAG.
- How documents are processed.
- How embeddings are generated.
- Why you used Qdrant.
- How Gemini generates the final answer.
- How FastAPI connects the components.
- What multi-tenancy means in your project.

### Q2. What problem does KnowSphere solve?

**Answer:**

Imagine a company has hundreds of PDF documents containing employee policies, technical documentation, product information, and internal guidelines.

If an employee wants to find a particular policy, they may have to open several documents and manually search through them.

KnowSphere simplifies this process.

Instead of manually searching documents, a user can ask a natural-language question such as:
- What is the company's leave policy?
- Explain the refund process.
- What are the main requirements mentioned in this document?

The system retrieves relevant information from the uploaded documents and provides a contextual answer using an LLM.

The important point is that the AI response is supported by information retrieved from the user's knowledge base rather than relying only on the model's general training knowledge.

### Q3. Why did you build this project?

**Answer:**

I wanted to understand how modern Generative AI applications work beyond simply calling an LLM API.

I was particularly interested in how we can connect an LLM with external knowledge sources and allow it to answer questions using private or domain-specific information.

While learning about embeddings, vector databases, semantic search, and LLMs, I identified RAG as a practical way to combine these technologies.

So I built KnowSphere to understand the complete workflow, from document ingestion and embedding generation to retrieval and answer generation.

It also helped me understand backend development, API integration, database management, and multi-tenant application design.

### Q4. What are the major components of KnowSphere?

**Answer:**

The project can be understood through these major components:
1. Document ingestion: Accepts documents and prepares their content for processing.
2. Text processing and chunking: Divides document content into smaller, manageable pieces.
3. Embedding generation: Uses SentenceTransformers to convert text chunks into numerical vector representations.
4. Vector storage: Stores embeddings and associated information in Qdrant Cloud.
5. Question processing: Receives the user's question through the backend.
6. Semantic retrieval: Searches Qdrant for relevant document chunks.
7. Answer generation: Uses Google Gemini to generate a response based on the retrieved information.
8. Backend APIs: FastAPI connects the application components.
9. Knowledge-base management: MongoDB Atlas and Supabase support the platform's data and storage requirements.
10. Authentication and tenant isolation: JWT is included in the technology stack and supports the authentication design.

Be ready to explain the exact responsibilities of MongoDB Atlas and Supabase from your implementation. Your resume names both but does not specify precisely which records or files each one stores.

---

## 2. RAG – Retrieval-Augmented Generation

This is one of the most important areas of KnowSphere. An interviewer can spend a significant amount of time questioning you about RAG.

### Q5. What is RAG?

**Answer:**

RAG stands for Retrieval-Augmented Generation. It is an approach that combines information retrieval with Large Language Model generation.

A normal LLM generates responses based on the knowledge it learned during training. However, it may not know about private documents, recently updated information, or specific company data.

RAG solves this problem by retrieving relevant information from an external knowledge source before generating an answer.

It generally works in three stages:

1. Retrieval

When a user asks a question, the system searches the external knowledge base and retrieves relevant information.

2. Augmentation

The retrieved information is added to the prompt as additional context.

3. Generation

The LLM uses the question and retrieved context to generate a response.

For example, if a user asks, "What is the refund policy mentioned in my document?", the system first retrieves the relevant refund-policy content and then provides that content to the LLM.

This allows the model to answer questions using information that may not be present in its original training data.

### Q6. Why did you use RAG instead of directly using Gemini?

**Answer:**

Using Gemini directly would mean that the model generates answers primarily from its pretrained knowledge and the information included in the current prompt.

However, my application is designed to answer questions based on user-provided documents.

Gemini does not automatically know the contents of every document uploaded to my application.

RAG provides a way to connect Gemini with external knowledge.

The application retrieves relevant document content and passes it to Gemini as context. This helps the model generate answers that are more relevant to the user's documents.

Another advantage is that I can update the knowledge base by processing new documents without having to retrain or fine-tune the LLM every time the document collection changes.

### Q7. Explain the complete RAG workflow in KnowSphere.

**Answer:**

The RAG workflow can be divided into two major phases: document ingestion and question answering.

**Phase 1: Document ingestion**
1. A user provides a document to the platform.
2. The application extracts the document's text.
3. The extracted content is divided into smaller chunks.
4. SentenceTransformers converts each chunk into a numerical embedding.
5. The embedding and its associated information are stored in Qdrant Cloud.

**Phase 2: Question answering**
1. The user submits a question.
2. The application converts the question into an embedding using the embedding model.
3. Qdrant searches for document vectors that are semantically similar to the question vector.
4. The system retrieves the most relevant document chunks.
5. Those chunks are included in the context provided to Google Gemini.
6. Gemini generates a natural-language answer.
7. The backend returns the generated response to the user.

The important distinction is that document processing happens before the question-answering stage. We do not need to regenerate all document embeddings every time a user asks a question.

### Q8. What is the difference between the ingestion pipeline and the retrieval pipeline?

**Answer:**

The ingestion pipeline prepares information so that it can be searched later.

It involves document extraction, text cleaning where required, chunking, embedding generation, and vector storage.

The retrieval pipeline runs when a user asks a question.

It involves converting the query into an embedding, searching the vector database, retrieving relevant chunks, and providing them to the LLM for answer generation.

The ingestion pipeline prepares the knowledge base, while the retrieval pipeline uses that knowledge base to answer questions.

### Q9. Is RAG a machine-learning model?

**Answer:**

No. RAG itself is not a single machine-learning model.

It is an architecture or application pattern that combines multiple components.

For example, a RAG system can use:
- An embedding model for converting text into vectors.
- A vector database for similarity search.
- A retrieval mechanism for finding relevant information.
- An LLM for generating the final response.

In KnowSphere, SentenceTransformers is used for embeddings, Qdrant Cloud for vector search, and Google Gemini for response generation.

### Q10. What is the difference between RAG and fine-tuning?

**Answer:**

RAG and fine-tuning solve different problems.

RAG provides external information to an LLM at inference time. It is useful when the model needs to answer questions using private, frequently changing, or domain-specific documents.

Fine-tuning involves further training a pretrained model on a specific dataset so that its behaviour, response style, or task performance can be adapted.

For example, if a company frequently updates its policy documents, RAG is useful because the application can process updated documents and retrieve the latest available information.

If a company wants a model to consistently follow a particular response format or perform a specialized task, fine-tuning may be useful.

In my project, RAG was suitable because the primary requirement was retrieving information from user-provided documents rather than changing the underlying model's parameters.

### Q11. Does RAG completely eliminate hallucinations?

**Answer:**

No. RAG can reduce hallucinations, but it cannot guarantee that every answer will be correct.

The system depends on the quality of the retrieved information and the LLM's ability to interpret that information correctly.

Hallucinations can still occur if:
- The relevant information is not retrieved.
- The retrieved chunks are incomplete.
- The documents contain incorrect information.
- The context is ambiguous.
- The LLM generates information that is not supported by the retrieved content.

To reduce hallucinations, a RAG application should retrieve relevant chunks, provide clear instructions to the LLM, and encourage it to answer only from the supplied context when that is the desired behaviour.

### Q12. What happens if the answer is not available in the uploaded documents?

**Answer:**

If the retrieval system does not find relevant information, the application should avoid generating an unsupported answer.

A better approach is to use a relevance threshold or another retrieval-quality check and instruct the LLM to say that the information is not available in the provided documents.

This is important because a RAG system should not pretend that it has found information when the knowledge base does not contain it.

Be prepared to explain whether your actual implementation includes a similarity threshold or an explicit fallback response.

### Q13. Can RAG work without a vector database?

**Answer:**

Yes. A vector database is a common choice, but it is not a mandatory requirement for RAG.

For example, retrieval can be performed using:
- Traditional keyword search.
- BM25-based search.
- An in-memory vector index.
- A relational database with vector-search support.
- A dedicated vector database.

However, vector databases are useful when we want to perform semantic similarity searches over large collections of embeddings.

I used Qdrant Cloud in KnowSphere for vector storage and semantic retrieval.

### Q14. What is the difference between RAG and a normal chatbot?

**Answer:**

A normal chatbot may generate responses using only the LLM's pretrained knowledge and the conversation context.

A RAG-based chatbot retrieves relevant external information before generating a response.

For example, a general chatbot may explain a standard company leave policy based on its general knowledge, but it may not know the exact policy of a particular organization.

A RAG-based chatbot can retrieve that organization's uploaded leave-policy document and use it to generate an answer.

The key difference is the connection to an external knowledge source.

---

## 3. Document ingestion, text extraction, and chunking

### Q15. What is document ingestion?

**Answer:**

Document ingestion is the process of bringing external documents into the application and preparing their content for retrieval.

In a RAG application, document ingestion generally involves accepting the document, extracting its text, processing the content, dividing it into chunks, generating embeddings, and storing the resulting vectors.

The objective is to convert unstructured document content into a format that can be searched efficiently.

### Q16. Why can't we directly send an entire document to an LLM?

**Answer:**

There are several reasons.

First, documents can be very large, and sending the complete document with every question can exceed the model's context-window limit.

Second, sending unnecessary content increases token consumption and can increase response latency and cost.

Third, a large amount of irrelevant information can make it harder for the model to identify the specific information required to answer the question.

Chunking solves this problem by dividing the document into smaller pieces. The retrieval system can then select only the relevant chunks and provide them to the LLM.

### Q17. What is text chunking?

**Answer:**

Text chunking is the process of dividing a large document into smaller sections called chunks.

For example, imagine a document containing 10,000 words. Instead of treating it as one large piece of text, we divide it into smaller sections.

Each chunk is processed independently and converted into an embedding.

When a user asks a question, the retrieval system searches these chunks and returns the ones that are most relevant to the question.

This makes retrieval more focused and reduces the amount of information that needs to be passed to the LLM.

### Q18. Why is chunking important in RAG?

**Answer:**

Chunking is important because retrieval works better when the system can identify smaller, meaningful sections of a document.

If we embed an entire document as one vector, that vector may represent multiple topics. A question about one specific topic may therefore retrieve the document without identifying the most relevant passage.

By dividing the document into smaller chunks, each embedding represents a more focused section of information.

It also allows the system to send only relevant content to the LLM, which can reduce token usage and improve answer relevance.

### Q19. What is chunk size?

**Answer:**

Chunk size refers to the amount of text included in one chunk.

It can be measured using characters, words, or tokens, depending on the chunking method.

A small chunk size produces more focused pieces of information, but it may separate related sentences or remove important context.

A large chunk size preserves more context, but it may contain unrelated information and make retrieval less precise.

Therefore, chunk size needs to be selected according to the type of documents and the questions users are likely to ask.

### Q20. What is chunk overlap?

**Answer:**

Chunk overlap means keeping a portion of the previous chunk in the next chunk.

For example, suppose a document is divided into chunks of 500 tokens with an overlap of 50 tokens.

The first chunk contains tokens 1–500, and the next chunk begins at token 451.

This means the two chunks share 50 tokens.

Overlap helps preserve context when an important sentence or explanation is split across two chunks.

Without overlap, a chunk may contain only the second half of an explanation, making it difficult for the retrieval system or LLM to understand its meaning.

### Q21. What happens if the chunk size is too small?

**Answer:**

If chunks are too small, they may lose important context.

For example, one chunk might contain a statement such as "The payment must be completed within 30 days," while the previous chunk explains which type of payment the statement refers to.

If the two sections are separated, the retrieved chunk may not contain enough information to answer the question correctly.

Very small chunks can also increase the total number of embeddings, which increases storage and retrieval workload.

### Q22. What happens if the chunk size is too large?

**Answer:**

If chunks are too large, each embedding may represent several different topics.

This can reduce retrieval precision because a query about one specific topic may retrieve a chunk containing a lot of unrelated information.

Large chunks can also increase the amount of context passed to the LLM, increasing token consumption and potentially making the answer less focused.

### Q23. How would you select an appropriate chunk size?

**Answer:**

I would begin with a reasonable chunk size based on the document type and then evaluate retrieval quality using representative questions.

I would compare different chunk sizes and overlap settings by checking whether the retrieved chunks contain the information needed to answer each question.

I would also consider:
- Document structure.
- Sentence and paragraph boundaries.
- The average length of relevant passages.
- The LLM's context-window limit.
- Retrieval latency and token consumption.

The final choice should be based on retrieval quality rather than selecting a chunk size arbitrarily.

### Q24. Why is document structure important during chunking?

**Answer:**

Documents often contain headings, paragraphs, tables, sections, and lists.

If we divide a document without considering its structure, we may separate a heading from its explanation or split a table from its associated description.

A structure-aware chunking strategy tries to preserve logical boundaries.

This can make the retrieved information more understandable and help the LLM interpret the content correctly.

### Q25. What is metadata in document processing?

**Answer:**

Metadata is additional information associated with a document or a chunk.

Examples include:
- Document ID.
- File name.
- Page number.
- Tenant or user identifier.
- Document type.
- Chunk number.
- Upload information.

Metadata helps the system identify where a retrieved chunk came from and filter search results.

For a multi-tenant RAG platform, tenant-related metadata is particularly important because retrieval must be restricted to the appropriate tenant's knowledge base.

Your resume confirms the multi-tenant design, but the exact metadata fields and filtering implementation should be verified against your code.

---

## 4. Embeddings and SentenceTransformers

unrag.dev

### Q26. What are embeddings?

**Answer:**

Embeddings are numerical representations of data.

In Natural Language Processing, text embeddings represent words, sentences, or larger pieces of text as vectors of numbers.

The purpose is to represent the semantic meaning of text in a mathematical form so that computers can compare different pieces of text based on their meaning.

For example:
- "How can I reset my password?"
- "What should I do if I forget my login credentials?"

These sentences use different words, but their meanings are similar.

A suitable embedding model can generate vectors that are relatively close to each other in vector space.

This allows a semantic search system to retrieve relevant content even when the exact keywords do not match.

### Q27. Why do we need embeddings in KnowSphere?

**Answer:**

KnowSphere needs to retrieve information based on the meaning of a user's question, not just exact keyword matching.

Embeddings convert both document chunks and user queries into numerical vectors.

The vector database can then compare the query vector with stored document vectors and retrieve semantically similar content.

Without embeddings, the system would need another retrieval method, such as keyword search or BM25.

### Q28. What is SentenceTransformers?

**Answer:**

SentenceTransformers is a Python library used to generate meaningful embeddings for sentences and larger text passages.

It provides pretrained transformer-based models that convert text into dense numerical vectors.

For example, we can provide a sentence to a SentenceTransformer model and receive an embedding vector.

The resulting vector can be stored in a vector database and later compared with the embedding of a user query.

In KnowSphere, SentenceTransformers is used to generate embeddings for document chunks so that they can be retrieved through semantic vector search.

### Q29. Is SentenceTransformers a database?

**Answer:**

No. SentenceTransformers is an embedding-generation library, not a database.

It converts text into numerical vectors.

Qdrant Cloud is the component used for storing and searching those vectors.

The distinction is:
- SentenceTransformers: generates embeddings.
- Qdrant: stores and searches embeddings.
- Gemini: generates the natural-language response.

### Q30. What happens internally when SentenceTransformers generates an embedding?

**Answer:**

At a high level, the process involves several stages.

First, the input text is tokenized into tokens that the model can process.

These tokens are converted into token IDs and passed through a pretrained transformer-based neural network.

The model generates contextual representations for the tokens.

A pooling operation is then used to create a fixed-size vector representing the sentence or text passage.

The resulting vector is the embedding.

The exact pooling strategy and embedding dimensions depend on the particular pretrained model being used.

### Q31. What is tokenization?

**Answer:**

Tokenization is the process of dividing text into smaller units called tokens.

Depending on the tokenizer, a token may represent a complete word, part of a word, or punctuation.

For example, a sentence such as "KnowSphere retrieves information" is converted into a sequence of tokens that the transformer model can process.

Tokenization is necessary because transformer models operate on numerical token representations rather than raw text directly.

### Q32. What is the difference between word embeddings and sentence embeddings?

**Answer:**

Word embeddings represent individual words as vectors, while sentence embeddings represent the meaning of an entire sentence or text passage as a vector.

Word embeddings are useful when we want to represent individual words and their relationships.

Sentence embeddings are more suitable for semantic search because the system often needs to compare complete questions with complete document passages.

In KnowSphere, SentenceTransformers is used because the retrieval system needs to compare document chunks with user queries.

### Q33. What is semantic similarity?

**Answer:**

Semantic similarity measures how close two pieces of text are in meaning.

For example:
- "The employee can take paid leave."
- "Workers are eligible for paid time off."

The words are different, but the meaning is similar.

When both sentences are converted into embeddings, a similarity function can measure how close their vectors are.

This is useful in RAG because a user may ask a question using words that are different from the wording in the original document.

### Q34. What is cosine similarity?

**Answer:**

Cosine similarity measures the cosine of the angle between two vectors.

It is commonly used to compare text embeddings.

Its formula is:
\[
\text{Cosine Similarity}(A,B)=
\frac{A\cdot B}{\|A\|\|B\|}
\]

Here:
- \(A\) and \(B\) are two embedding vectors.
- \(A\cdot B\) is their dot product.
- \(\|A\|\) and \(\|B\|\) are their magnitudes.

A higher cosine similarity generally indicates that the vectors point in a more similar direction.

For normalized vectors, cosine similarity is equivalent to their dot product.

The exact scoring and distance configuration used in your Qdrant collection should be checked in your implementation.

### Q35. Does a higher similarity score always mean the answer is correct?

**Answer:**

No. A high similarity score indicates that the retrieved text is mathematically similar to the query according to the embedding model and selected metric.

It does not guarantee that the retrieved passage contains the correct answer.

For example, two passages may discuss the same topic but provide different or contradictory details.

Therefore, retrieval quality also depends on the embedding model, chunking strategy, metadata filtering, document quality, and query formulation.

### Q36. What is the difference between sparse and dense embeddings?

**Answer:**

Dense embeddings are vectors in which most dimensions contain numerical values. They represent semantic information and are commonly generated using neural networks.

Sparse representations contain mostly zero values and are often associated with keyword-based representations such as traditional TF-IDF.

Dense retrieval is useful when the query and document use different words but express similar meanings.

Sparse retrieval is useful when exact terms, names, or technical keywords are important.

A hybrid search system can combine both approaches.

### Q37. Why should the same embedding model be used for documents and queries?

**Answer:**

The document chunks and user queries must be represented in compatible vector spaces so that their similarity can be compared meaningfully.

If we generate document embeddings using one model and query embeddings using an unrelated model, their vector representations may not be compatible.

Using the same embedding model and configuration for both sides helps ensure that the vectors can be compared correctly.

---

## 5. Qdrant Cloud and vector databases

qdrant.tech

### Q38. What is a vector database?

**Answer:**

A vector database is a database designed to store, index, and search numerical vectors efficiently.

In machine-learning applications, embeddings are stored as vectors. When a user submits a query, the system generates a query embedding and searches for stored vectors that are similar to it.

A traditional relational database is mainly designed for structured data and exact conditions, such as finding a user with a particular ID or retrieving records where a column matches a value.

A vector database is designed for similarity-based retrieval.

In KnowSphere, Qdrant Cloud stores the embeddings generated from document chunks and helps retrieve relevant content when a user asks a question.

### Q39. Why did you choose Qdrant?

**Answer:**

I selected Qdrant because the project required efficient storage and similarity-based retrieval of document embeddings.

Qdrant is designed specifically for vector search. It supports collections, vector indexing, similarity search, and payload metadata.

It allows the application to search for vectors that are closest to a user's query embedding and retrieve the associated document information.

Another reason is that Qdrant provides a managed cloud service, Qdrant Cloud, which avoids the need to manage the complete vector database infrastructure myself.

### Q40. What is Qdrant Cloud?

**Answer:**

Qdrant Cloud is the managed cloud offering of Qdrant.

Instead of installing and maintaining the vector database infrastructure locally, developers can create a cloud deployment and connect their applications to it through the Qdrant client or API.

In KnowSphere, Qdrant Cloud is used to store and retrieve document embeddings.

### Q41. What is a collection in Qdrant?

**Answer:**

A collection in Qdrant is a logical group of points.

A point generally contains:
- A unique point ID.
- A vector.
- Optional payload data.

For example, a knowledge base can contain multiple document chunks. Each chunk can be represented by a point containing its embedding and associated metadata.

The collection also has vector configuration, such as vector dimensions and distance metric.

### Q42. What is a point in Qdrant?

**Answer:**

A point is an individual record stored in a Qdrant collection.

It normally consists of a unique ID, one or more vectors, and optional payload information.

For a document-based RAG application, a point can represent a document chunk.

The vector stores its numerical embedding, while the payload can contain information such as the text, document ID, file name, or tenant identifier.

The exact payload fields depend on the application's implementation.

### Q43. What is payload in Qdrant?

**Answer:**

Payload is additional structured information stored alongside a vector.

For example, when storing a document chunk, we may store the original text, document identifier, page number, file name, or tenant identifier in its payload.

The vector is used for similarity search, while the payload provides the information needed to understand and filter the retrieved result.

For example, if we want to search only within a particular tenant's documents, we can use a tenant-related payload field as a filter.

### Q44. Explain how semantic search works in Qdrant.

**Answer:**

First, the user's question is converted into an embedding using the embedding model.

The application sends this vector to Qdrant.

Qdrant compares the query vector with the vectors stored in the selected collection using the configured similarity or distance metric.

It then returns the nearest matching points.

The application can use the payload associated with those points to obtain the original document chunks and other metadata.

These retrieved chunks are then used as context for answer generation.

### Q45. What is top-K retrieval?

**Answer:**

Top-K retrieval means selecting the K most relevant results from a search.

For example, if K is set to 5, the retrieval system attempts to return the five closest matching document chunks.

The value of K affects how much information is passed to the LLM.

If K is too small, the system may miss important information.

If K is too large, the context may contain irrelevant passages, increasing token usage and potentially confusing the LLM.

The appropriate K value should be selected through testing.

Do not claim a specific K value in your interview unless you have verified it in your code.

### Q46. What is an index in a vector database?

**Answer:**

An index is a data structure that helps a database find relevant records more efficiently.

Without an appropriate search index, a system may need to compare a query against a very large number of stored vectors.

Vector databases use specialized indexing approaches to improve approximate nearest-neighbour search.

Qdrant supports vector indexing methods such as HNSW.

### Q47. What is HNSW?

**Answer:**

HNSW stands for Hierarchical Navigable Small World.

It is a graph-based approximate nearest-neighbour search algorithm.

It organizes vectors into a multi-layer graph. The upper layers contain fewer connections and help the search move quickly across the vector space. The lower layers provide more detailed navigation.

During search, the algorithm navigates through the graph to identify vectors close to the query vector without necessarily comparing it with every stored vector.

HNSW is useful for large-scale vector search because it can provide a good balance between search speed, recall, and memory usage.

Important: Qdrant supports HNSW, but your resume does not establish which indexing configuration you selected. Explain HNSW as a technology concept, not as a confirmed custom implementation decision.

### Q48. What is the difference between exact and approximate nearest-neighbour search?

**Answer:**

Exact nearest-neighbour search calculates distances against all relevant vectors and returns the mathematically closest results.

Approximate nearest-neighbour search uses indexing or other optimization techniques to find very close results without examining every vector.

Exact search can provide more accurate nearest neighbours, but it may become expensive for large datasets.

Approximate search is generally faster and more scalable, although it may occasionally miss the exact closest vector.

### Q49. What happens if the vector dimensions do not match?

**Answer:**

The vector dimensions must match the configuration of the Qdrant collection.

For example, if a collection expects vectors of dimension 384 but the application sends a vector with 768 dimensions, the operation will fail.

This can happen if the application changes its embedding model but continues using a collection configured for the previous model.

To prevent this, the application should use consistent embedding-model configurations and ensure that the collection's vector size matches the generated embeddings.

### Q50. What happens when a document is updated or deleted?

**Answer:**

A robust RAG application should keep the vector database synchronized with the source documents.

When a document is updated, its old chunks and embeddings should be removed or replaced, and the updated document should go through the ingestion pipeline again.

When a document is deleted, the associated vectors and payloads should also be deleted.

Otherwise, the application might retrieve information from an outdated or deleted document.

For an interview, explain how your implementation handles document updates and deletions. Your resume does not specify that behaviour.

---

## 6. Google Gemini and LLM integration

psitrontech.com

### Q51. What is an LLM?

**Answer:**

LLM stands for Large Language Model.

It is a deep-learning model trained on large amounts of text data to understand and generate human-like language.

LLMs can perform tasks such as answering questions, summarizing content, explaining concepts, translating text, and generating code.

They learn patterns and relationships in language during training and use those learned patterns to generate responses.

In KnowSphere, Google Gemini is used as the LLM for generating answers based on retrieved document context.

### Q52. What is Google Gemini?

**Answer:**

Google Gemini is a family of generative AI models developed by Google.

It can process prompts and generate natural-language responses, and different Gemini models support different capabilities.

In KnowSphere, Gemini acts as the generation component of the RAG pipeline.

The application retrieves relevant document chunks from Qdrant and provides them to Gemini along with the user's question.

Gemini then generates a response using the supplied context.

### Q53. What is the difference between an embedding model and an LLM?

**Answer:**

An embedding model converts text into numerical vectors that represent semantic information.

An LLM generates or understands natural-language content and can produce responses based on a prompt.

For example, SentenceTransformers converts a user's question into an embedding so that it can be compared with document embeddings.

Gemini receives the retrieved document content and the question and generates a human-readable answer.

So, in KnowSphere, the embedding model is responsible for semantic representation and retrieval, while Gemini is responsible for answer generation.

### Q54. What is a prompt?

**Answer:**

A prompt is the input or instruction provided to a generative AI model.

In a RAG system, the prompt can contain the user's question, retrieved document context, and instructions describing how the model should answer.

For example, the prompt may instruct the model to answer using only the supplied document context and to indicate when the answer is not available.

A well-designed prompt helps guide the model's response, although it cannot guarantee correctness.

### Q55. What is prompt engineering?

**Answer:**

Prompt engineering is the process of designing and improving instructions provided to an LLM to obtain more useful and reliable responses.

It includes defining the model's role, providing context, specifying the expected output format, setting restrictions, and giving examples where necessary.

In a RAG application, prompt engineering is important because the model should use the retrieved context appropriately rather than generating unrelated information.

### Q56. What is context in an LLM?

**Answer:**

Context is the information available to the LLM while generating a response.

It may include the current question, previous conversation messages, system instructions, and retrieved document content.

In KnowSphere, retrieved document chunks act as external context that helps Gemini answer questions based on the user's knowledge base.

### Q57. What is a context window?

**Answer:**

A context window is the maximum amount of input and output information a model can handle in a particular request, measured in tokens.

If the combined prompt, conversation history, retrieved documents, and generated response exceed the model's context limit, the request may fail or require reducing the context.

This is one reason chunking and retrieval are important in RAG applications: instead of passing an entire document, the application selects only relevant chunks.

### Q58. What are tokens in an LLM?

**Answer:**

Tokens are the units of text processed by a language model.

A token can represent a word, part of a word, or punctuation.

Models process token IDs rather than directly processing raw text.

Token usage matters because API providers commonly use tokens to calculate input and output consumption, and the context window is also measured in tokens.

### Q59. Why might Gemini generate an incorrect answer even when the correct chunk was retrieved?

**Answer:**

Retrieving the correct information does not automatically guarantee that the LLM will interpret it correctly.

The model may misunderstand the context, ignore an important detail, combine multiple pieces of information incorrectly, or generate additional information based on its learned patterns.

The prompt may also be unclear, or the retrieved context may be too large.

To improve reliability, we can provide focused context, use clear instructions, reduce irrelevant chunks, and evaluate the generated answers against the source documents.

### Q60. What is temperature in an LLM?

**Answer:**

Temperature is a generation parameter that controls the randomness of token selection.

A lower temperature generally makes responses more predictable and consistent.

A higher temperature generally allows more variation and creativity in the generated output.

For a document question-answering system, a relatively low temperature is often preferable because the goal is to provide factual and consistent answers rather than highly creative responses.

The actual temperature used in KnowSphere should be confirmed from your Gemini configuration.

### Q61. What happens if the Gemini API fails?

**Answer:**

The application should handle API failures gracefully.

Possible causes include:
- Network connectivity problems.
- API rate limits.
- Invalid API credentials.
- Service unavailability.
- Invalid request parameters.
- Token or quota limits.

The backend should catch relevant errors, log enough information for debugging, and return a meaningful error response to the frontend instead of crashing.

Depending on the failure, it may also be appropriate to retry the request with controlled backoff.

### Q62. Why did you use Gemini instead of training your own LLM?

**Answer:**

Training a large language model from scratch requires substantial computing resources, large datasets, time, and infrastructure.

My project did not require creating a new foundation model. The main objective was to build a platform that retrieves knowledge from user documents and generates contextual answers.

Using an existing LLM API allowed me to focus on the RAG architecture, embedding generation, retrieval, backend integration, and application functionality.

---

## 7. FastAPI and backend architecture

### Q63. What is FastAPI?

**Answer:**

FastAPI is a Python web framework used to build APIs.

It supports asynchronous programming, request validation, type hints, and automatic API documentation through OpenAPI and Swagger UI.

I used FastAPI in KnowSphere as the backend layer that connects the different components of the application.

It receives requests from the frontend, processes application logic, interacts with the required services, and returns responses.

### Q64. Why did you choose FastAPI instead of Flask?

**Answer:**

Both FastAPI and Flask are Python frameworks that can be used to build web applications and APIs.

FastAPI provides built-in request validation using Python type hints and integrates with Pydantic for data validation.

It also supports asynchronous endpoints, which can be useful when an application needs to communicate with external services such as vector databases and LLM APIs.

FastAPI also generates interactive API documentation automatically.

For KnowSphere, I chose FastAPI because the project involves connecting multiple services and exposing backend APIs for the RAG workflow.

### Q65. What is an API?

**Answer:**

API stands for Application Programming Interface.

It defines how different software components communicate with one another.

In KnowSphere, the frontend communicates with the backend through API endpoints.

The backend then performs operations such as processing requests, retrieving document information, interacting with databases, and generating responses using the AI services.

### Q66. What is REST API?

**Answer:**

REST stands for Representational State Transfer.

REST is an architectural style used to design web APIs around resources.

REST APIs commonly use HTTP methods such as:
- GET – retrieve data.
- POST – create a resource or submit data for processing.
- PUT – replace or update a resource.
- PATCH – partially update a resource.
- DELETE – remove a resource.

For example, a RAG application may expose an endpoint that accepts a user's question through a POST request and returns the generated answer.

### Q67. What is the difference between GET and POST?

**Answer:**

GET is generally used to retrieve information from a server.

POST is generally used to submit information to a server or request the creation of a resource.

For example, retrieving a list of available knowledge bases may use GET, while submitting a document or asking a question may use POST.

The choice of HTTP method should reflect the purpose of the operation.

### Q68. What is asynchronous programming in FastAPI?

**Answer:**

Asynchronous programming allows an application to perform other work while waiting for an I/O operation to complete.

For example, a backend may send a request to an external API and need to wait for its response.

With asynchronous programming, the application can yield control while waiting instead of blocking the execution thread in the same way as synchronous code.

This can improve concurrency for I/O-bound operations.

However, asynchronous programming does not automatically make every operation faster. CPU-intensive work and blocking libraries still need appropriate handling.

### Q69. What is the difference between synchronous and asynchronous functions?

**Answer:**

A synchronous function executes its operations in sequence and generally blocks its caller until it finishes.

An asynchronous function, declared using async def in Python, can pause at an await expression while waiting for an asynchronous operation to complete.

For example:

```python
async def get_data():
    result = await some_api_call()
    return result
```

The await expression allows the event loop to run other eligible tasks while the API call is waiting.

### Q70. Does using async def automatically make code asynchronous?

**Answer:**

No.

Declaring a function with async def makes it a coroutine function, but it does not automatically make every operation inside it non-blocking.

For example, calling a blocking function inside an asynchronous endpoint can still block the event loop.

To benefit from asynchronous programming, we should use compatible asynchronous libraries or move blocking operations to an appropriate thread or process.

### Q71. What is Pydantic?

**Answer:**

Pydantic is a Python library used for data validation and settings management.

It allows developers to define data models using Python type annotations.

FastAPI integrates with Pydantic to validate incoming request bodies and serialize response data.

For example, we can define a request model that requires a question field to be a string.

If the request does not match the expected structure, FastAPI can return a validation error.

### Q72. How does the frontend communicate with FastAPI?

**Answer:**

The frontend sends HTTP requests to the backend API.

For example, when a user submits a question, the frontend sends the question and any required identifiers to the appropriate backend endpoint.

FastAPI receives the request, validates its data, performs the necessary processing, communicates with the retrieval and generation components, and returns the result.

The frontend then displays the returned answer to the user.

### Q73. What is CORS?

**Answer:**

CORS stands for Cross-Origin Resource Sharing.

It is a browser security mechanism that controls whether a web page from one origin can make requests to a server on another origin.

An origin is determined by the combination of scheme, domain, and port.

For example, a frontend hosted on one domain may need to communicate with a backend hosted on another domain.

The backend must configure appropriate CORS policies to allow the required frontend origin.

CORS should not be disabled for every origin in production without a clear reason.

---

## 8. MongoDB Atlas, Supabase, and data management

### Q74. What is MongoDB?

**Answer:**

MongoDB is a NoSQL document-oriented database.

Unlike relational databases, which organize data into tables with rows and columns, MongoDB stores data in BSON documents grouped into collections.

A document can contain fields, nested objects, and arrays.

MongoDB is useful when application data has a flexible or evolving structure.

In KnowSphere, MongoDB Atlas is included in the technology stack for knowledge-base management and supporting application data.

### Q75. What is MongoDB Atlas?

**Answer:**

MongoDB Atlas is the cloud database service provided by MongoDB.

It allows developers to create and manage MongoDB database deployments without manually managing the entire database infrastructure.

It provides features for database hosting, backups, monitoring, scaling, and access management.

In KnowSphere, I used MongoDB Atlas as part of the application's data-management layer.

### Q76. What is the difference between SQL and NoSQL databases?

**Answer:**

SQL databases are generally relational databases that organize information into tables with predefined schemas and relationships.

NoSQL databases support different data models, including document, key-value, column-family, and graph models.

For example, MySQL is a relational SQL database, while MongoDB is a document-oriented NoSQL database.

SQL databases are useful when structured relationships and transactional consistency are important.

Document databases can be useful when application records have flexible or nested structures.

### Q77. What is a MongoDB document?

**Answer:**

A document is an individual record in MongoDB.

It contains key-value pairs and is stored in BSON format.

For example, a document might contain a knowledge-base ID, its name, an owner ID, and creation information.

Documents in the same collection do not necessarily have to contain exactly the same fields, although applications usually enforce their own data structure.

### Q78. What is Supabase?

**Answer:**

Supabase is an open-source backend platform that provides services such as a managed PostgreSQL database, authentication, storage, and APIs.

It helps developers build application backends without having to implement every supporting service from scratch.

Supabase is included in KnowSphere's technology stack alongside MongoDB Atlas.

For your interview, be clear about exactly which Supabase features you used. Your resume does not identify whether it was used for file storage, authentication, database operations, or another responsibility.

### Q79. Why might a project use both MongoDB and Supabase?

**Answer:**

A project can use multiple databases or backend services when they serve different purposes.

For example, one service might manage application metadata while another handles file storage or relational data.

However, using two databases also introduces additional complexity.

We need to manage credentials, data consistency, access permissions, backups, and communication between the services.

In KnowSphere, both MongoDB Atlas and Supabase appear in the technology stack, so I would explain their actual responsibilities separately rather than claiming that they perform the same operation.

### Q80. Why not store everything in Qdrant?

**Answer:**

Qdrant is designed primarily for vector storage and similarity search.

A complete application also needs to manage other types of information, such as user accounts, knowledge-base details, document metadata, permissions, and application records.

A vector database is not automatically a replacement for every application database.

Separating application data management from vector retrieval can make the architecture easier to organize.

### Q81. Why not store all document content in MongoDB and search it there?

**Answer:**

MongoDB can store document content and metadata, but semantic similarity search requires an appropriate search mechanism.

A vector database is specifically designed for storing and searching embedding vectors.

The two systems can therefore serve different purposes: an application database can manage structured application records, while a vector database can support semantic retrieval.

The actual division of responsibilities in KnowSphere should match the implementation.

### Q82. What is database indexing?

**Answer:**

An index is a data structure that improves the speed of database queries.

Without an index, the database may need to examine many records to find matching information.

For example, if an application frequently searches for records using a tenant ID, an index on that field may improve query performance.

Indexes can improve read performance, but they also require storage and can add overhead to insert, update, and delete operations.

### Q83. What is database normalization?

**Answer:**

Database normalization is the process of organizing relational data to reduce unnecessary duplication and improve consistency.

It involves structuring tables and relationships according to normal forms.

For example, instead of repeatedly storing the same customer details in every order record, we can store customer details separately and reference them using a customer ID.

Normalization is mainly a relational database design concept. Document databases may use different trade-offs, such as embedding related information or referencing separate documents.

---

## 9. JWT, authentication, authorization, and multi-tenancy

This is a particularly important interview area because your resume explicitly mentions that KnowSphere is multi-tenant and lists JWT in its technology stack.

### Q84. What is authentication?

**Answer:**

Authentication is the process of verifying the identity of a user.

For example, when a user logs in using an email address and password, the application verifies whether those credentials are valid.

After successful authentication, the application can establish a way to recognize the user in subsequent requests.

### Q85. What is authorization?

**Answer:**

Authorization determines what an authenticated user is allowed to access or perform.

For example, a user may be allowed to view their own knowledge base but not delete another user's knowledge base.

Authentication answers the question, "Who are you?"

Authorization answers the question, "What are you allowed to do?"

### Q86. What is JWT?

**Answer:**

JWT stands for JSON Web Token.

It is a compact token format commonly used to transfer claims between parties.

A JWT generally consists of three parts:
1. Header.
2. Payload.
3. Signature.

The header contains information about the token type and signing algorithm.

The payload contains claims, such as a subject identifier or expiration time.

The signature helps verify that the token has not been modified and was signed using the expected key.

In a web application, a server can issue a JWT after successful authentication. The client can then include that token in subsequent requests.

### Q87. Explain the three parts of a JWT.

**Answer:**

Header: Contains metadata about the token, including its type and signing algorithm.

Payload: Contains claims, which are pieces of information about the token's subject and other properties.

Signature: Is generated using the encoded header and payload together with the signing key and algorithm. It allows the receiving system to verify the token's integrity.

A JWT is usually represented as three Base64URL-encoded sections separated by dots.

### Q88. Is JWT encrypted?

**Answer:**

Not necessarily.

A typical signed JWT is encoded and digitally signed, but its payload is not automatically encrypted.

This means someone who obtains a normal signed JWT may be able to decode and read its payload.

Therefore, passwords, API secrets, and other sensitive information should not be placed in an ordinary JWT payload.

If confidentiality is required, an encrypted token format or another secure mechanism must be used.

### Q89. What is the difference between access tokens and refresh tokens?

**Answer:**

An access token is used to authorize access to protected resources.

It generally has a relatively short lifetime.

A refresh token is used to obtain a new access token without requiring the user to enter their credentials again.

Refresh tokens usually have a longer lifetime and need particularly careful protection.

Whether KnowSphere implements refresh tokens is something to verify in the code.

### Q90. Where should a JWT be stored on the frontend?

**Answer:**

The storage decision depends on the application's security architecture.

Storing tokens in browser local storage is convenient, but JavaScript running in the page can access them. This makes them vulnerable to theft through cross-site scripting if the application has an XSS vulnerability.

Secure, HttpOnly cookies can reduce direct JavaScript access to the token, although cookie-based authentication requires appropriate CSRF protections and cookie settings.

A production application should consider token lifetime, XSS, CSRF, HTTPS, and the overall authentication design.

### Q91. What happens when a JWT expires?

**Answer:**

When the token expires, the backend should reject requests that require that token.

If the application supports refresh tokens, the frontend may request a new access token.

Otherwise, the user may need to authenticate again.

The backend must validate the expiration claim rather than trusting a token simply because it has the correct format.

### Q92. What is multi-tenancy?

**Answer:**

Multi-tenancy is a software architecture in which a single application serves multiple independent users, organizations, or customers, known as tenants.

Each tenant uses the same overall application infrastructure, but its data and resources are logically separated.

For example, imagine KnowSphere is used by two companies:
- Company A uploads its internal policy documents.
- Company B uploads its product documentation.

Company A should be able to search its own documents, but it should not be able to retrieve Company B's private information.

This separation is the central purpose of multi-tenancy.

### Q93. Why did you make KnowSphere multi-tenant?

**Answer:**

The idea behind KnowSphere is to provide a knowledge platform that can support multiple independent users or organizations.

If the application only supported one user, it would be limited to a single knowledge environment.

A multi-tenant design makes it possible to serve multiple customers through one platform while keeping their data logically separated.

It also makes the application more suitable for a SaaS-style product.

### Q94. How can you isolate tenant data in a RAG application?

**Answer:**

Tenant isolation must be enforced throughout the application, not just in the frontend.

A typical approach involves:
1. Authenticating the user.
2. Identifying the tenant associated with that user.
3. Verifying that the user has permission to access the requested knowledge base.
4. Storing tenant-related metadata with document records and vector points.
5. Applying tenant filters during retrieval.
6. Restricting document uploads, updates, and deletions to authorized tenants.

For example, if the authenticated user belongs to Tenant A, the retrieval operation should include a filter that restricts results to Tenant A's data.

This helps prevent one tenant from accessing another tenant's documents.

Important: This is the design principle you should understand. Do not claim every step is implemented in your project unless you have checked the actual code.

### Q95. What could happen if you forget tenant filtering in Qdrant?

**Answer:**

This could create a serious data-isolation vulnerability.

Suppose Tenant A asks a question and the application performs a vector search without filtering by tenant.

Qdrant may return relevant chunks belonging to Tenant B if they are semantically similar to the query.

The application could then include another tenant's private document content in the LLM prompt and potentially expose it in the response.

Therefore, tenant filtering is not just a search optimization. It is an important security requirement.

### Q96. Is hiding another tenant's data in the frontend enough?

**Answer:**

No.

Frontend restrictions are not sufficient because users can interact directly with backend APIs.

A user may modify request parameters or send custom API requests.

The backend must independently authenticate the user and verify authorization for every protected operation.

Tenant isolation should be enforced at the backend and data-access layers.

### Q97. What is the difference between logical and physical tenant isolation?

**Answer:**

Logical isolation means tenants share infrastructure, but their data is separated through identifiers, access controls, and query filters.

Physical isolation means tenants have separate infrastructure or storage resources, such as dedicated databases or deployments.

Logical isolation can reduce infrastructure costs and simplify management.

Physical isolation can provide stronger separation and may be appropriate for customers with strict security or compliance requirements.

The right choice depends on the application's scale, security requirements, and operating cost.

### Q98. What security risks should a multi-tenant RAG system consider?

**Answer:**

A multi-tenant RAG system should consider several risks:
- Unauthorized access to another tenant's documents.
- Missing tenant filters in vector searches.
- Incorrect permission checks on document operations.
- Exposure of API keys or database credentials.
- Token theft or weak authentication.
- Malicious documents containing prompt-injection instructions.
- Sensitive information being included in logs.
- Insecure file uploads.

Security needs to be applied across authentication, backend authorization, document storage, vector retrieval, and LLM interaction.

### Q99. What is prompt injection in RAG?

**Answer:**

Prompt injection occurs when malicious instructions are included in input content and attempt to influence the LLM's behaviour.

In a RAG application, the malicious instructions might be hidden inside an uploaded document.

For example, a document might contain text telling the model to ignore its previous instructions and reveal confidential information.

A RAG application should treat retrieved document content as untrusted data rather than instructions that override the application's system rules.

It should also enforce permissions outside the LLM. The LLM should never be trusted to decide whether a user is allowed to access a document.

### Q100. How would you protect API keys?

**Answer:**

API keys should not be hardcoded in source code or exposed in frontend JavaScript.

They should be stored in environment variables or a dedicated secret-management service.

The backend should read the required credentials securely when it starts.

We should also:
- Restrict API-key permissions where possible.
- Rotate exposed keys.
- Avoid printing secrets in logs.
- Use HTTPS.
- Avoid committing .env files to GitHub.

---

## 10. LangChain and application orchestration

### Q101. What is LangChain?

**Answer:**

LangChain is a framework for building applications powered by LLMs.

It provides reusable components and abstractions for connecting language models with prompts, document loaders, text splitters, retrievers, tools, and other services.

In a RAG application, LangChain can help organize the document-processing and retrieval workflow and connect the LLM with the retrieved context.

Your KnowSphere technology stack includes LangChain. Be ready to identify exactly which LangChain components you used, rather than saying that you used every feature of the framework.

### Q102. Why use LangChain instead of writing everything manually?

**Answer:**

We can build a RAG pipeline manually using Python libraries and direct API calls.

However, LangChain provides reusable components for common LLM application tasks.

For example, it can help with document loading, text splitting, embedding integration, retriever interfaces, and prompt construction.

This can reduce repetitive integration code and make the application easier to organize.

However, it is not mandatory. For simple applications, direct Python code may be easier to understand and maintain.

### Q103. What is a document loader?

**Answer:**

A document loader is a component that reads data from a source and converts it into a format that can be processed by the application.

For example, a loader may read a PDF, text file, or other supported document type and return its content along with metadata.

The resulting documents can then be passed to a text splitter and embedding model.

### Q104. What is a retriever?

**Answer:**

A retriever is a component responsible for retrieving relevant documents or document chunks based on a query.

In a vector-based RAG application, it typically converts the query into an embedding, searches the vector store, and returns relevant results.

The retrieved results are then provided to the LLM as context.

### Q105. What is a vector store in LangChain?

**Answer:**

A vector store is an abstraction for working with vector databases.

It provides a common interface for operations such as adding documents, generating or storing embeddings, and performing similarity searches.

LangChain supports integration with vector databases such as Qdrant.

This allows developers to work with the vector database through a consistent interface rather than writing every integration detail themselves.

### Q106. What is a chain in LangChain?

**Answer:**

A chain represents a sequence of operations that are connected together to complete a task.

For example, a RAG chain might take a question, retrieve relevant documents, combine those documents with a prompt, send the prompt to an LLM, and return the response.

Chains help organize the steps of an LLM application into a reusable workflow.

### Q107. What is the difference between LangChain and Gemini?

**Answer:**

They serve different purposes.

LangChain is a framework used to organize and connect components in an LLM application.

Gemini is the actual language model that generates responses.

For example, LangChain can help retrieve relevant document chunks and construct a prompt, while Gemini processes that prompt and generates the answer.

### Q108. Can we build KnowSphere without LangChain?

**Answer:**

Yes.

LangChain is not a mandatory requirement for RAG.

We can implement document processing, chunking, embedding generation, Qdrant retrieval, prompt construction, and Gemini API integration directly using Python and the respective client libraries.

LangChain mainly provides abstractions and reusable components that can make the development process more convenient.

---

## 11. Performance, evaluation, and reliability

### Q109. How would you measure the performance of a RAG application?

**Answer:**

I would evaluate the system at multiple stages rather than judging it only by how fluent the generated answer sounds.

First, I would evaluate retrieval quality by checking whether the correct document chunks are being retrieved.

Then, I would evaluate answer quality by checking whether the generated answer is relevant, accurate, and supported by the retrieved context.

I would also measure technical performance, including response latency, token consumption, error rate, and the number of successful requests.

A good RAG system needs both reliable retrieval and reliable answer generation.

### Q110. What is retrieval precision?

**Answer:**

Retrieval precision measures how many of the retrieved results are relevant.
\[
\text{Precision@K} =
\frac{\text{Relevant retrieved results}}
{\text{Total retrieved results}}
\]

For example, suppose the system retrieves 5 document chunks, and 4 are relevant.

Then:
\[
\text{Precision@5} = \frac{4}{5}=0.8
\]

This means 80% of the retrieved chunks were relevant.

### Q111. What is retrieval recall?

**Answer:**

Retrieval recall measures how many of the relevant available results were successfully retrieved.
\[
\text{Recall@K} =
\frac{\text{Relevant retrieved results}}
{\text{Total relevant results}}
\]

For example, suppose a question has 10 relevant chunks in the knowledge base, but the system retrieves only 6 of them.

Then:
\[
\text{Recall@K}=\frac{6}{10}=0.6
\]

This means the retrieval process found 60% of the relevant chunks.

### Q112. What is the difference between precision and recall in RAG?

**Answer:**

Precision focuses on avoiding irrelevant retrieved chunks.

Recall focuses on finding as many relevant chunks as possible.

If precision is low, the LLM may receive unnecessary information.

If recall is low, the LLM may not receive important information required to answer the question.

A good retrieval system needs an appropriate balance between both.

### Q113. What is MRR?

**Answer:**

MRR stands for Mean Reciprocal Rank.

It evaluates how highly the first relevant result appears in the retrieved ranking.

For a query, reciprocal rank is the inverse of the rank of the first relevant result.

For example, if the first relevant result appears at position 2, the reciprocal rank is:
\[
RR=\frac{1}{2}=0.5
\]

MRR is the average reciprocal rank across multiple queries.

It is useful when retrieving the most relevant result early is important.

### Q114. What is answer faithfulness?

**Answer:**

Answer faithfulness measures whether the generated answer is supported by the retrieved context.

For example, if the retrieved document states that employees receive 20 days of annual leave, but the LLM answers 30 days, the answer is not faithful to the source.

A faithful answer should not introduce unsupported claims.

This is particularly important in a document-based knowledge platform.

### Q115. What is answer relevance?

**Answer:**

Answer relevance measures whether the generated response actually addresses the user's question.

An answer may contain correct information but still be irrelevant if it does not answer what the user asked.

For example, if the user asks about a refund deadline, a response explaining the entire refund process without mentioning the deadline is not sufficiently relevant.

### Q116. How would you improve poor retrieval quality?

**Answer:**

I would first inspect the retrieved chunks and identify why they are not relevant.

Possible improvements include:
1. Reviewing the document extraction process.
2. Improving chunk size and overlap.
3. Trying a different embedding model.
4. Checking that query and document embeddings use the same model.
5. Applying suitable metadata filters.
6. Adjusting the number of retrieved results.
7. Evaluating a hybrid search approach.
8. Adding a reranking stage if needed.

I would test each change using a fixed set of representative questions so that I could compare retrieval performance consistently.

### Q117. What is reranking?

**Answer:**

Reranking is an additional step that reorders initially retrieved results based on their relevance to the query.

A vector database may quickly retrieve a group of candidate chunks.

A reranker can then evaluate the query and each candidate more deeply and place the most relevant chunks higher in the final ranking.

This can improve retrieval quality, although it adds computational cost and latency.

### Q118. What is hybrid search?

**Answer:**

Hybrid search combines different retrieval methods, commonly dense vector search and sparse keyword search.

Dense vector search helps identify semantically similar content, even when the exact words differ.

Sparse search helps identify content containing specific keywords, names, codes, or technical terms.

Combining both can improve retrieval in cases where semantic meaning and exact keyword matching are both important.

### Q119. How would you reduce the response time of KnowSphere?

**Answer:**

I would first measure the time taken by each stage to identify the main bottleneck.

Possible improvements include:
- Reducing unnecessary document processing.
- Reusing document embeddings instead of generating them repeatedly.
- Optimizing vector retrieval.
- Limiting the number and size of retrieved chunks.
- Using efficient asynchronous I/O for external API calls.
- Reducing unnecessary prompt context.
- Caching repeated queries where appropriate.
- Selecting an LLM model that meets the application's latency requirements.

I would measure the effect of each optimization rather than assuming that a particular change automatically improves performance.

### Q120. How would you handle duplicate document uploads?

**Answer:**

A useful approach is to calculate a file hash when a document is uploaded.

The application can compare the hash with previously uploaded documents in the relevant tenant or knowledge base.

If the same file has already been processed, the system can avoid unnecessary reprocessing.

The application should also consider whether a file with the same name has different content. A file name alone is not a reliable way to identify duplicates.

### Q121. How would you handle very large documents?

**Answer:**

I would process large documents in a controlled manner instead of loading and processing everything in one operation.

Possible improvements include:
- Extracting content page by page or in batches.
- Processing chunks incrementally.
- Generating embeddings in batches.
- Using background jobs for long-running ingestion.
- Tracking processing status.
- Handling failures so that the whole document does not need to be restarted unnecessarily.

The goal is to control memory usage, avoid request timeouts, and make ingestion more reliable.

### Q122. What is caching, and how could it help KnowSphere?

**Answer:**

Caching means temporarily storing the result of an expensive operation so that it can be reused.

For example, if users repeatedly ask the same question against an unchanged knowledge base, the application may reuse a previously generated result if the cache key and access rules make that safe.

Caching can reduce repeated API calls, latency, and cost.

However, the cache must include relevant tenant and knowledge-base information so that one tenant never receives another tenant's cached answer.

---

## 12. Error handling, testing, and debugging

### Q123. What are the common errors you might face in a RAG application?

**Answer:**

There are different types of errors at different stages.

Document-processing errors:
- Unsupported file formats.
- Failed text extraction.
- Empty documents.
- Corrupted files.
- Incorrect chunking.

Embedding errors:
- Missing or invalid model configuration.
- Incorrect vector dimensions.
- Embedding-generation failures.

Vector database errors:
- Incorrect collection configuration.
- Connection failures.
- Invalid API credentials.
- Incorrect metadata filters.

LLM errors:
- API rate limits.
- Invalid API requests.
- Service failures.
- Context-window limitations.

Backend errors:
- Request validation failures.
- Authentication failures.
- Database connection problems.
- Unexpected exceptions.

A good application should handle these errors at the appropriate layer and return understandable responses to the frontend.

### Q124. How would you debug a situation where the chatbot gives no answer?

**Answer:**

I would debug the complete pipeline step by step.

First, I would check whether the frontend is successfully sending the question to the backend.

Second, I would check whether FastAPI is receiving and validating the request correctly.

Third, I would verify whether the query embedding is generated successfully.

Fourth, I would inspect the Qdrant search result to see whether relevant chunks are being returned.

Fifth, I would verify that the retrieved content is being included in the prompt.

Finally, I would inspect the Gemini API response and backend logs.

This step-by-step approach helps identify the exact stage where the problem occurs instead of randomly changing the code.

### Q125. How would you test the document ingestion pipeline?

**Answer:**

I would test each stage independently.

For document upload, I would check whether supported files are accepted and invalid files are rejected.

For text extraction, I would check whether the extracted content matches the original document.

For chunking, I would verify that the content is divided correctly and that important context is preserved.

For embedding generation, I would verify that the vectors are generated successfully and have the expected dimensions.

Finally, I would check whether the vectors and associated metadata are stored correctly in Qdrant.

I would also test edge cases such as empty files, very large files, and documents with unusual formatting.

### Q126. What is integration testing?

**Answer:**

Integration testing checks whether multiple components work correctly together.

For KnowSphere, an integration test could verify the flow from receiving a document to storing its embeddings in Qdrant.

Another integration test could verify that a question is received by FastAPI, retrieved through Qdrant, passed to Gemini, and returned to the frontend.

This helps identify problems that may not appear when testing individual components independently.

### Q127. What is logging, and why is it important?

**Answer:**

Logging means recording important events and errors during application execution.

For example, a RAG application may log:
- Document-processing failures.
- Database connection errors.
- Retrieval failures.
- LLM API errors.
- Request processing times.

Logs help developers identify what happened when an application fails.

However, logs should not contain sensitive information such as passwords, access tokens, API keys, or unnecessary private document content.

### Q128. What would you do if Qdrant is unavailable?

**Answer:**

I would handle the database connection error gracefully.

The application should not continue as if retrieval succeeded.

It should log the failure, return a meaningful error response, and avoid sending an empty or misleading context to Gemini.

Depending on the application requirements, a retry with controlled backoff or a temporary service-unavailable response may be appropriate.

---

## 13. Deployment and production-level questions

### Q129. Why should we use environment variables?

**Answer:**

Environment variables allow an application to access configuration values without hardcoding them in the source code.

Examples include:
- Gemini API key.
- Qdrant API key.
- Database connection strings.
- JWT signing secret.
- Backend configuration.

This makes it easier to use different configurations in development and production and reduces the risk of exposing credentials in source control.

### Q130. What is Docker?

**Answer:**

Docker is a platform used to package and run applications inside containers.

A container includes the application and its required dependencies, which helps maintain a consistent runtime environment.

Docker can make deployment easier because the application can run in a similar environment across development, testing, and production.

Your resume lists Docker as a skill, but it does not explicitly say that KnowSphere was deployed using Docker. If you are asked about its use in this project, distinguish your Docker knowledge from what you actually used.

### Q131. What is the difference between Docker and a virtual machine?

**Answer:**

A virtual machine runs a complete guest operating system on virtualized hardware.

A Docker container shares the host operating system's kernel while isolating the application's processes and dependencies.

Containers are generally lighter and faster to start than full virtual machines because they do not need to run a separate operating-system kernel for each container.

### Q132. What is scalability?

**Answer:**

Scalability is the ability of an application to handle increased workload as the number of users, requests, or stored documents grows.

For KnowSphere, scalability could involve handling more users, processing larger document collections, and serving more simultaneous questions.

We could improve scalability through efficient vector indexing, optimized backend services, batching, caching, background processing, and appropriate infrastructure scaling.

### Q133. What is horizontal scaling?

**Answer:**

Horizontal scaling means increasing capacity by adding more application instances or machines.

For example, if a single backend instance cannot handle the incoming requests, we may run multiple backend instances behind a load balancer.

### Q134. What is vertical scaling?

**Answer:**

Vertical scaling means increasing the resources of an existing machine, such as adding more CPU, RAM, or storage.

Horizontal scaling adds more instances, while vertical scaling increases the capacity of an individual instance.

### Q135. What is a background task, and why might KnowSphere need one?

**Answer:**

A background task is work performed outside the immediate request-response interaction.

Document ingestion can take time because it may involve text extraction, chunking, embedding generation, and vector storage.

If all of this is performed synchronously during a user's upload request, the request may take too long and could time out.

A background-processing system can accept the upload, create an ingestion job, and process the document separately.

The frontend can then display the processing status.

---

## 14. Difficult project-based cross-questions

These questions test whether you genuinely understand the system rather than just knowing the definitions of RAG, embeddings, and vector databases.

### Q136. Why is KnowSphere better than simply using ChatGPT or Gemini to read a document?

**Answer:**

A user can certainly upload a document directly to a general-purpose AI assistant and ask questions about it.

However, KnowSphere is designed as a knowledge-base platform where documents can be organized and processed for repeated retrieval.

The RAG architecture allows the application to store document embeddings and retrieve relevant information when questions are asked.

This can be useful when managing multiple documents, maintaining separate knowledge bases, supporting multiple tenants, and building a dedicated application around document-based conversations.

It also provides more control over how document retrieval and data access are handled.

### Q137. Suppose a user uploads 100 documents. How does the system handle them?

**Answer:**

The documents need to be processed through the ingestion pipeline.

The application accepts the documents, extracts their text, divides the content into chunks, generates embeddings, and stores the resulting vectors with associated metadata.

When the user asks a question, the application searches the stored embeddings rather than reprocessing all 100 documents from the beginning.

This separation between ingestion and retrieval is important for efficiency.

### Q138. Suppose two documents contain contradictory information. What happens?

**Answer:**

The retrieval system may retrieve chunks from both documents if they are relevant to the question.

The LLM may then generate a response using both pieces of information.

However, this can create ambiguity if the documents disagree.

A more reliable system should preserve document metadata, such as document version, date, or source, and use an appropriate rule to prioritize information.

The prompt can also instruct the model to identify conflicting information rather than silently choosing one version.

### Q139. Suppose the user asks a question using completely different words from the document. Can RAG still find the answer?

**Answer:**

Yes, this is one of the main advantages of semantic retrieval.

The embedding model represents the meaning of text rather than relying only on exact keyword matching.

For example, the document might say "Employees are eligible for annual paid leave," while the user asks, "How many vacation days can a worker take?"

A suitable embedding model may identify these sentences as semantically related even though they use different words.

However, the success of this retrieval depends on the embedding model and the quality of the document chunks.

### Q140. Suppose the user asks a very broad question. What should the system do?

**Answer:**

A broad question may match many document chunks.

The application can retrieve the most relevant chunks, but the selected results may not cover every aspect of the question.

One approach is to improve query formulation or split a broad question into more focused sub-questions.

The system can also use a larger retrieval set where appropriate, while remaining within the LLM's context limit.

The goal is to provide enough useful information without including excessive irrelevant content.

### Q141. What happens if a document contains images or tables?

**Answer:**

The result depends on the document extraction process.

A basic text extraction process may not correctly capture information from images, scanned pages, or complex tables.

For scanned documents, OCR may be needed to extract text.

For tables, a structure-aware extraction approach can help preserve the relationship between column headings and cell values.

If the system needs to understand charts or images, a multimodal processing pipeline may be required.

Do not claim that KnowSphere currently supports OCR or multimodal document processing unless you have verified it.

### Q142. What if the same document chunk is retrieved repeatedly?

**Answer:**

Repeated retrieval is not necessarily a problem. If a chunk is relevant to multiple questions, it may correctly appear repeatedly.

However, the application should avoid storing unnecessary duplicate chunks during ingestion.

It can use document identifiers, chunk identifiers, or content hashes to identify duplicates.

If multiple retrieved chunks contain nearly identical information, deduplication or result filtering can help reduce unnecessary context.

### Q143. What is the biggest technical challenge in a RAG application?

**Answer:**

One of the biggest challenges is maintaining retrieval quality.

Even if the LLM is powerful, it cannot reliably answer a document-specific question when the correct information is not retrieved or the context is incomplete.

The quality of the complete system depends on several connected components:
- Document extraction.
- Chunking.
- Embedding generation.
- Vector search.
- Context construction.
- LLM generation.

A weakness in any of these stages can affect the final answer.

### Q144. What would you improve in KnowSphere if you had more time?

**Answer:**

I would focus on improving retrieval quality, security, and production readiness.

Some possible improvements would be:
1. Add hybrid retrieval combining dense and keyword search.
2. Add a reranking stage to improve the order of retrieved chunks.
3. Introduce better document-version management.
4. Improve handling of tables and scanned documents.
5. Add detailed evaluation datasets for retrieval and answer quality.
6. Improve ingestion through background processing and status tracking.
7. Add stronger tenant-isolation tests.
8. Improve monitoring, caching, and error handling.

I would prioritize these improvements based on actual user requirements and measured system weaknesses.

### Q145. What was your individual contribution to KnowSphere?

**Answer:**

This answer should describe only the work you personally performed.

A suitable structure is:

"I worked on building KnowSphere as a document-based RAG platform. My work involved connecting the document-processing workflow with embedding generation and vector search. I used SentenceTransformers to generate embeddings, Qdrant Cloud for semantic retrieval, and Google Gemini for response generation. I also worked with FastAPI and the application's data-management components to connect these services into a working platform."

Add specific details about authentication, multi-tenancy, frontend integration, and deployment only if you personally implemented them.

### Q146. How would you explain KnowSphere to a non-technical interviewer?

**Answer:**

KnowSphere is an AI-powered platform that allows users to ask questions about their own documents.

Instead of opening documents and searching manually, users can upload their information and interact with it through a conversational interface.

The system finds the relevant information from the uploaded documents and uses AI to explain it in a natural way.

It is designed to support multiple users or organizations while keeping their information separated.

---

## 15. Challenges and problem-solving

### Q147. What was the biggest challenge in your project?

**Answer:**

One of the biggest challenges was understanding and implementing the complete document retrieval workflow.

Generating embeddings alone is not enough to build a RAG application. The system also needs to process documents correctly, divide them into meaningful chunks, store their embeddings, retrieve relevant information, and pass the retrieved context to the LLM.

I had to understand how every stage depends on the previous stage.

For example, if document chunking is not appropriate, the retrieved information may lack context. Similarly, if retrieval does not return relevant chunks, even a powerful LLM may generate an incorrect answer.

This helped me understand that the quality of a RAG application depends on the complete pipeline rather than just the LLM.

### Q148. How did you overcome the challenges you faced?

**Answer:**

I approached the problems step by step instead of trying to build the entire system at once.

First, I understood the purpose of each technology independently. I learned how embeddings represent text, how vector databases store and retrieve embeddings, and how an LLM uses context to generate responses.

After understanding the individual components, I connected them gradually.

I also tested the individual stages of the pipeline to identify where problems were occurring. For example, I would check whether document text was extracted correctly, whether embeddings were generated, whether Qdrant returned relevant results, and whether the retrieved content was passed correctly to Gemini.

This step-by-step approach made debugging easier and helped me understand the overall architecture.

### Q149. What integration challenges can occur when connecting multiple services?

**Answer:**

When multiple services are connected, each component has its own configuration, API requirements, and possible failure points.

For example, the backend needs valid credentials and correct configurations to communicate with Qdrant and Gemini.

A failure in any external service can affect the overall request.

To handle this, I would validate the configuration of each service, test integrations independently, use appropriate exception handling, and maintain useful logs.

I also learned that integrating multiple technologies requires understanding their inputs, outputs, and responsibilities rather than simply connecting their APIs.

### Q150. If you had to develop KnowSphere again, what would you do differently?

**Answer:**

If I developed KnowSphere again, I would spend more time planning and evaluating the architecture before implementing all the components.

I would establish a test dataset containing documents and questions with known answers so that I could measure retrieval quality from the beginning.

I would also focus earlier on document-version management, background ingestion, tenant-isolation testing, and error handling.

Another improvement would be to evaluate different retrieval strategies, such as hybrid search and reranking, to understand whether they improve the quality of retrieved information.

This experience taught me that building a working application is important, but designing it for reliability, security, and maintainability is equally important.

---

## 16. Learning and experience gained from KnowSphere

### Q151. What did you learn from developing KnowSphere?

**Answer:**

Developing KnowSphere helped me gain practical understanding of how Generative AI applications are built and how different technologies work together.

Before working on this project, I had studied concepts such as embeddings, LLMs, vector databases, and RAG separately. Through this project, I understood how these concepts connect to form a complete application.

Technically, I improved my understanding of document processing, text chunking, embedding generation using SentenceTransformers, semantic search using Qdrant, and response generation using Google Gemini.

I also gained practical experience with backend development using FastAPI and learned how to integrate multiple external services into one application.

Another important learning was understanding multi-tenant architecture and why authentication, authorization, and data isolation are important in applications that support multiple users.

Overall, the project improved both my AI/ML knowledge and my backend development skills.

### Q152. How did this project improve your problem-solving skills?

**Answer:**

The project improved my problem-solving skills because I had to work with several interconnected components.

When an issue occurred, I learned not to assume that the problem was always in the LLM or the backend.

Instead, I started examining the complete workflow and identifying where the issue originated.

For example, an incorrect answer could be caused by document extraction, chunking, embedding generation, retrieval, or prompt construction.

This taught me to break complex problems into smaller parts, test each component independently, and identify the actual cause before applying a solution.

---

## 17. HR-style project questions

### Q153. Why are you proud of KnowSphere?

**Answer:**

I am proud of KnowSphere because it helped me move beyond basic machine-learning projects and understand how modern AI applications are developed.

It required me to learn and integrate multiple technologies, including embeddings, vector databases, RAG, LLMs, and backend APIs.

I particularly liked the process of understanding how document information can be converted into searchable knowledge and then used to generate meaningful answers.

It was a valuable experience because I had to understand not only the individual technologies but also how they work together to solve a real problem.

### Q154. If an interviewer says, "Your project is just an API wrapper around Gemini," how would you respond?

**Answer:**

I would explain that Gemini is only one component of KnowSphere.

The main purpose of the project is to build a document-based knowledge retrieval system.

Before the question reaches Gemini, the application needs to process documents, generate embeddings, store them in a vector database, and retrieve relevant information based on the user's question.

Gemini then generates the response using the retrieved context.

Therefore, the project involves document processing, semantic search, vector database integration, backend development, and LLM integration—not just calling a model API.

### Q155. Would you call KnowSphere a Generative AI project or a Machine Learning project?

**Answer:**

I would classify KnowSphere primarily as a Generative AI application built using a RAG architecture.

It uses an embedding model for semantic representation and a Large Language Model for generating responses.

It also involves machine-learning concepts such as embeddings, similarity search, and neural-network-based language models.

So it combines multiple areas of AI and machine learning, but its main application category is Generative AI.

### Q156. How is KnowSphere relevant to the role of an AI/ML Engineer?

**Answer:**

KnowSphere is relevant because it demonstrates my understanding of how AI models can be integrated into practical applications.

It involves understanding embeddings, semantic search, vector databases, LLMs, and RAG.

It also demonstrates my ability to work with Python, backend APIs, databases, and external AI services.

As an AI/ML Engineer, I believe it is important not only to understand models but also to understand how to integrate them into reliable applications that solve real problems.
