# KnowSphere --- Project Interview Preparation

**Project:** KnowSphere --- Knowledge Base AI Platform\
**Purpose:** Accenture interview preparation\
**Focus:** Project explanation, RAG architecture, document ingestion,
chunking, embeddings, Qdrant, Gemini, LangChain, FastAPI, MongoDB Atlas,
Supabase, JWT, multi-tenancy, debugging, deployment, limitations, and
project learning.

> **Important preparation note:** The answers below are written in
> natural, spoken English. Understand the flow rather than memorising
> every sentence. Some exact implementation values (such as chunk size,
> overlap, embedding model name, vector dimension, top-k, similarity
> metric, and token expiry) must be checked against your current code
> before you state them as facts. The resume confirms the overall stack
> and project purpose; it does not list every configuration value.

------------------------------------------------------------------------

# Part 1 --- Project Overview and Architecture

### Q1. Tell me about your KnowSphere project.

**Answer:**

KnowSphere is a multi-tenant, Retrieval-Augmented Generation platform
that allows users to have AI-based conversations with their own
documents. The main idea is that instead of manually searching through
long documents, a user can upload documents to a knowledge base and ask
questions in natural language.

I built the platform using Python and FastAPI for the backend. For
document understanding, I implemented chunking and SentenceTransformers
embeddings. I used Qdrant Cloud for semantic vector search, Google
Gemini for generating responses, MongoDB Atlas for application data, and
Supabase for file storage. JWT is used for authentication, and LangChain
helps connect different parts of the document-processing and RAG
pipeline.

The important part is that the platform supports multiple users while
keeping their knowledge bases separate.

### Q2. What problem does KnowSphere solve?

**Answer:**

A lot of useful information is stored inside PDFs and other documents.
Finding a specific answer manually can take time, especially when
documents are large.

KnowSphere makes this easier. A user uploads documents, and the system
processes them so that their content can be searched semantically. When
the user asks a question, the system retrieves relevant sections from
the uploaded documents and gives those sections to Gemini as context.
Gemini then generates an answer based on the retrieved information.

So, the platform makes document search more natural and conversational.

### Q3. Why did you choose this project?

**Answer:**

I wanted to build something beyond a basic machine-learning model or a
simple chatbot. KnowSphere gave me an opportunity to understand how a
complete Generative AI application works.

It combines several areas: backend API development, authentication,
cloud storage, document processing, embeddings, vector databases,
semantic retrieval, and LLM integration. I also got practical experience
in connecting multiple services and debugging the complete flow.

### Q4. Is KnowSphere just a chatbot?

**Answer:**

No. The chat interface is only the part the user interacts with. The
actual system includes a document-ingestion pipeline, file storage,
metadata management, embedding generation, vector indexing, semantic
retrieval, authentication, and tenant-level access control.

A normal chatbot mainly receives a message and sends it to an LLM.
KnowSphere first retrieves relevant information from a user's own
knowledge base and then uses that information to generate a grounded
response.

### Q5. Explain the complete architecture.

**Answer:**

The frontend communicates with the backend through FastAPI REST APIs. A
user authenticates, and the backend uses JWT to identify the user and
validate protected requests.

When a user uploads a document, the original file is stored in Supabase.
Application information, such as user, knowledge-base, and document
metadata, is maintained in MongoDB Atlas. The document is then loaded
and split into smaller chunks. SentenceTransformers converts those
chunks into numerical embeddings, and Qdrant Cloud stores the vectors
along with metadata.

When the user asks a question, the question is also converted into an
embedding. Qdrant searches for semantically similar chunks, applying the
relevant user and knowledge-base filters. The retrieved text is combined
into context and passed to Google Gemini. Gemini generates the final
response using that context.

The overall flow is:

**Upload → Store → Load → Chunk → Embed → Store vectors → Retrieve →
Build context → Gemini → Answer**

### Q6. Explain KnowSphere in 30 seconds.

**Answer:**

KnowSphere is a multi-tenant RAG-based knowledge platform. Users can
upload their documents and ask questions about them. The system
processes documents into chunks, generates embeddings using
SentenceTransformers, and stores those vectors in Qdrant Cloud. When a
question is asked, it retrieves relevant chunks and sends them as
context to Google Gemini to generate an answer. I used FastAPI, MongoDB
Atlas, Supabase, LangChain, and JWT to build the backend and manage
storage, APIs, and user access.

### Q7. What is the role of each technology?

**Answer:**

-   **Python:** Main programming language used for the backend and AI
    pipeline.
-   **FastAPI:** Builds the backend REST APIs.
-   **LangChain:** Provides reusable components for document loading,
    splitting, embeddings, prompts, and model integration.
-   **SentenceTransformers:** Converts text chunks and user questions
    into embeddings.
-   **Qdrant Cloud:** Stores vectors and performs similarity search.
-   **Google Gemini:** Generates natural-language answers using
    retrieved context.
-   **MongoDB Atlas:** Stores application-level data and metadata.
-   **Supabase Storage:** Stores original uploaded documents.
-   **JWT:** Supports authentication and identifies the user in
    protected requests.

------------------------------------------------------------------------

# Part 2 --- Retrieval-Augmented Generation (RAG)

### Q8. What is RAG?

**Answer:**

RAG stands for Retrieval-Augmented Generation. It is a technique where
an application first retrieves relevant information from an external
knowledge source and then provides that information to a language model
as context.

The model uses the retrieved context to generate its answer. This is
useful when we want the model to answer questions using private,
domain-specific, or frequently changing information that may not be part
of its original training data.

In KnowSphere, the external knowledge source is the user's uploaded
documents, and Qdrant helps retrieve relevant document chunks.

### Q9. Why did you use RAG instead of directly calling Gemini?

**Answer:**

If I directly send a user's question to Gemini, Gemini will mainly
answer using its pretrained knowledge and the information included in
the prompt. It does not automatically know the private content of a
user's uploaded documents.

With RAG, I first search the user's knowledge base and retrieve relevant
document sections. I then provide those sections to Gemini along with
the question. This makes the answer more relevant to the user's
documents.

RAG is also useful because documents can be added or updated without
retraining the language model.

### Q10. Explain the RAG workflow step by step.

**Answer:**

RAG has two main stages: ingestion and retrieval.

**1. Ingestion stage**

First, the user uploads a document. The application loads its content
and splits it into smaller chunks. Each chunk is converted into an
embedding using an embedding model. Those vectors, along with useful
metadata, are stored in a vector database such as Qdrant.

**2. Retrieval and generation stage**

When the user asks a question, the question is converted into an
embedding using the same embedding model. Qdrant searches for similar
vectors and returns the most relevant chunks. The application combines
those chunks into context and sends the context and question to Gemini.
Gemini generates the final answer.

### Q11. What is the difference between ingestion and retrieval?

**Answer:**

Ingestion is the process of preparing documents so that they can be
searched later. It includes loading, chunking, embedding, and storing
the vectors.

Retrieval happens when a user asks a question. The system embeds the
question, searches the vector database, and fetches relevant chunks.

In simple words, ingestion prepares the knowledge base, while retrieval
finds the information needed to answer a question.

### Q12. Why is RAG useful for private or changing data?

**Answer:**

A language model's training knowledge is not automatically updated
whenever a user changes a document. RAG keeps the external knowledge
separately from the model.

When a document is uploaded or updated, the application can process it
and update the vector database. The model can then use the latest
retrieved information at query time without being retrained.

### Q13. What is the difference between RAG and fine-tuning?

**Answer:**

RAG provides external information to a model at the time of answering a
question. It changes the context available to the model, not the model's
learned parameters.

Fine-tuning means training an existing model further on a specific
dataset so that its parameters adapt to a task, style, or domain.

For KnowSphere, RAG is a suitable approach because users may upload
different documents and the knowledge can change. We can update the
knowledge base without retraining Gemini.

### Q14. Does RAG completely eliminate hallucinations?

**Answer:**

No. RAG can reduce hallucinations by providing relevant information from
trusted documents, but it cannot guarantee that every answer will be
correct.

The retrieval step might return irrelevant chunks, the retrieved context
might be incomplete, or the LLM might misunderstand the context. To
reduce this risk, the prompt should instruct the model to rely on the
provided context and avoid guessing. We can also use relevance
thresholds, reranking, source references, and evaluation.

### Q15. What happens if the answer is not present in the uploaded documents?

**Answer:**

The system should avoid inventing an answer. The prompt can instruct
Gemini to say that the available context does not contain enough
information.

A stronger implementation can also check retrieval scores. If the
retrieved chunks are not relevant enough, the application can avoid
sending them for generation and return a message that the answer could
not be found in the knowledge base.

### Q16. What is the difference between a normal chatbot and a RAG chatbot?

**Answer:**

A normal chatbot generally sends the user's message to an LLM and
returns the response. A RAG chatbot adds a retrieval step before
generation.

It searches an external knowledge source, retrieves relevant
information, and provides it to the LLM. This makes it possible to
answer questions using a user's own documents rather than relying only
on the model's general knowledge.

### Q17. Can RAG work without a vector database?

**Answer:**

Yes. RAG does not strictly require a vector database. We could retrieve
information using keyword search, a relational database, or another
search engine.

However, a vector database is useful when we want semantic search based
on embeddings. In KnowSphere, Qdrant provides vector similarity search
and metadata filtering.

------------------------------------------------------------------------

# Part 3 --- Document Loading, Chunking, and Context

### Q18. What is document ingestion?

**Answer:**

Document ingestion is the process of taking a source document and
preparing its content for retrieval. It generally includes receiving the
file, storing it, extracting its text, splitting the text into chunks,
generating embeddings, and saving those embeddings in the vector
database.

The goal is to convert an ordinary document into searchable information.

### Q19. Why do we split a document into chunks?

**Answer:**

A large document may contain many pages and different topics. If we try
to process the complete document for every question, it can be
inefficient and may exceed the model's context limit.

Chunking divides the document into smaller sections. The system can then
retrieve only the sections relevant to a particular question. This
reduces unnecessary context and can improve retrieval precision.

### Q20. What is a chunk?

**Answer:**

A chunk is a smaller piece of text created from a larger document. For
example, a long document can be divided into multiple text sections.
Each section can be embedded and searched independently.

When a user asks a question, the system retrieves the chunks that are
semantically closest to that question.

### Q21. What is chunk size?

**Answer:**

Chunk size defines how much text is included in one chunk. A chunk can
be measured in characters or tokens, depending on the splitting
strategy.

If chunks are too small, they may lose important context. If chunks are
too large, they may contain multiple unrelated topics and make retrieval
less precise. The right size depends on the document type and retrieval
requirements.

### Q22. What is chunk overlap?

**Answer:**

Chunk overlap means repeating a small portion of text between
consecutive chunks.

For example, if one chunk ends with an important sentence and the next
chunk starts immediately after it, the relationship between the two
sections may be lost. Overlap preserves some shared context and reduces
the chance of splitting an important idea across boundaries.

### Q23. What happens if chunk size is too small?

**Answer:**

Very small chunks may not contain enough information to explain a
concept. A sentence might be separated from the paragraph that gives it
meaning. The retriever may find a matching phrase but the LLM may not
receive enough context to answer correctly.

### Q24. What happens if chunk size is too large?

**Answer:**

Large chunks may contain several topics. A question may match only one
small part of a chunk, but the whole chunk is retrieved. This can
introduce irrelevant information and consume more of the LLM's context
window.

### Q25. How would you choose a good chunk size?

**Answer:**

I would start with a reasonable value based on the document type, then
test it with representative questions. I would check whether the
retrieved chunks contain enough context and whether they remain focused
on the question.

I would compare retrieval quality and response quality for different
chunk sizes and overlap values rather than assuming one setting is best
for every dataset.

### Q26. What is a context window?

**Answer:**

A context window is the amount of text, measured in tokens, that a
language model can process in a single interaction. It includes the
prompt, conversation history, retrieved context, and the user's
question.

If too much text is sent, the request may exceed the model's context
limit or become less efficient. That is one reason why RAG retrieves
selected chunks instead of sending every uploaded document.

### Q27. What is the difference between a token and a chunk?

**Answer:**

A token is a small unit of text processed by a language model. It can be
a whole word, part of a word, punctuation, or another text unit.

A chunk is a larger section of a document created for retrieval. A chunk
contains multiple tokens. Tokens are used by the model to process text,
while chunks are used by the application to divide and retrieve document
content.

### Q28. Why is sending the complete document to Gemini not ideal?

**Answer:**

A complete document may be very large and contain information unrelated
to the user's question. Sending everything increases token usage,
latency, and cost, and it may exceed the context window.

RAG retrieves only the most relevant sections and sends those sections
to Gemini.

------------------------------------------------------------------------

# Part 4 --- Embeddings and SentenceTransformers

### Q29. What is an embedding?

**Answer:**

An embedding is a numerical representation of text. An embedding model
converts text into a vector containing numbers that capture semantic
information.

Texts with similar meanings tend to have vectors that are close to each
other in the embedding space. This allows us to search based on meaning
rather than only exact keyword matching.

### Q30. Why do you need embeddings in KnowSphere?

**Answer:**

The system needs a way to compare the meaning of a user's question with
the meaning of document chunks. Embeddings convert both into numerical
vectors.

Qdrant can then compare these vectors and return chunks that are
semantically similar to the question.

### Q31. What is SentenceTransformers?

**Answer:**

SentenceTransformers is a library used to generate dense vector
representations of sentences, paragraphs, and other text. It provides
pretrained models that convert text into embeddings suitable for tasks
such as semantic similarity and semantic search.

In KnowSphere, SentenceTransformers is used to create embeddings for
document chunks and user queries.

### Q32. What happens internally when text is converted into an embedding?

**Answer:**

The text is first tokenized into smaller units that the model can
process. The model converts those tokens into contextual representations
and produces a fixed-size vector representing the input text.

The resulting vector captures semantic features learned during training.
The application stores the vector and later compares it with query
embeddings.

### Q33. What is semantic search?

**Answer:**

Semantic search retrieves information based on meaning rather than exact
word matching.

For example, a user might ask, "How can I get my money back?" while a
document contains the phrase "refund policy." Keyword search may not
find an exact match, but semantic search can identify that both phrases
are related.

### Q34. What is the difference between keyword search and semantic search?

**Answer:**

Keyword search looks for matching words or terms. It is useful when the
user knows the exact phrase or identifier.

Semantic search compares embeddings and attempts to understand the
meaning of the query. It can retrieve relevant content even when the
wording is different.

### Q35. What is cosine similarity?

**Answer:**

Cosine similarity measures the cosine of the angle between two vectors.
It is commonly used to compare text embeddings.

A value closer to 1 generally indicates that the vectors point in a
similar direction. The vector database uses the configured similarity
metric to rank candidate results.

### Q36. Why must the same embedding model be used for documents and queries?

**Answer:**

The document chunks and user questions must be represented in a
compatible vector space. If we generate document embeddings with one
model and query embeddings with a different, incompatible model, their
vectors may not be meaningfully comparable.

Using the same embedding model and configuration keeps the vector
representations consistent.

### Q37. What is the difference between an embedding model and an LLM?

**Answer:**

An embedding model converts text into numerical vectors, mainly for
similarity comparison and retrieval. An LLM generates or transforms
text, such as answering questions, summarising, or explaining
information.

In KnowSphere, SentenceTransformers handles the embedding and retrieval
side, while Gemini handles natural-language answer generation.

### Q38. What is a dense vector?

**Answer:**

A dense vector is a numerical vector in which most dimensions contain
values. Text embedding models commonly generate dense vectors that
represent semantic features.

This differs from traditional sparse representations, such as many
bag-of-words vectors, where most positions are zero.

------------------------------------------------------------------------

# Part 5 --- Qdrant and Vector Search

### Q39. What is a vector database?

**Answer:**

A vector database is designed to store and search numerical vectors. It
can compare vectors using similarity metrics and return the nearest
matches.

In a RAG application, it stores document embeddings and helps retrieve
chunks that are semantically similar to a user's query.

### Q40. What is Qdrant?

**Answer:**

Qdrant is a vector database that supports vector similarity search and
metadata filtering. In KnowSphere, it stores embeddings generated from
document chunks and allows the application to retrieve relevant chunks
when a user asks a question.

### Q41. Why did you choose Qdrant?

**Answer:**

The project needs semantic search over document embeddings. Qdrant is
built for vector search and also supports payload metadata and
filtering. This is useful because the platform is multi-tenant:
retrieval should be restricted to the correct user and knowledge base.

### Q42. Does Qdrant generate embeddings?

**Answer:**

No. Qdrant stores and searches vectors. The application uses an
embedding model, such as SentenceTransformers, to convert text into
vectors before sending them to Qdrant.

### Q43. What is a collection in Qdrant?

**Answer:**

A collection is a named group of points in Qdrant. It defines the vector
configuration, such as vector size and distance metric, for the points
stored in that collection.

### Q44. What is a point in Qdrant?

**Answer:**

A point is an individual record stored in a Qdrant collection. It can
contain a vector, an identifier, and a payload.

In a document retrieval system, a point can represent one document
chunk. The vector is used for similarity search, while the payload can
store the chunk text and metadata.

### Q45. What is payload in Qdrant?

**Answer:**

Payload is additional metadata stored with a point. It can include
information such as document ID, user ID, knowledge-base ID, and the
chunk text.

Payload is useful because the application can retrieve the original
chunk content and apply filters during search.

### Q46. Why store user ID and knowledge-base ID in the payload?

**Answer:**

These values help isolate data between users and knowledge bases. When a
user asks a question, the application can filter the vector search using
the authenticated user's ID and selected knowledge-base ID.

This prevents the search from returning chunks belonging to another
user's knowledge base, provided the filters and authorization checks are
correctly enforced.

### Q47. What is top-k retrieval?

**Answer:**

Top-k retrieval means returning the k highest-ranked results from a
search. For example, if k is 5, the system returns up to five of the
most similar chunks.

The value should be selected based on retrieval quality and the amount
of context the LLM can handle. Too few chunks may omit useful
information, while too many can add irrelevant context.

### Q48. What is metadata filtering?

**Answer:**

Metadata filtering means restricting a search using additional
conditions apart from vector similarity.

For example, the application can search only points where the user ID
and knowledge-base ID match the current request. This is important for
both relevance and tenant-level data isolation.

### Q49. What is approximate nearest-neighbour search?

**Answer:**

Approximate nearest-neighbour search finds vectors that are likely to be
among the closest matches without comparing every stored vector
exhaustively. It is used to make similarity search efficient at scale.

The trade-off is that an approximate search may not always return the
exact mathematically nearest vectors, but it can provide a practical
balance between speed and retrieval quality.

### Q50. What happens if the embedding dimension does not match the Qdrant collection?

**Answer:**

The vector size configured in the collection must match the size of the
vectors being inserted and searched. If they do not match, Qdrant can
reject the operation because the vectors are incompatible.

If this happens, I would check the embedding model, its output
dimension, and the collection configuration.

### Q51. What if Qdrant returns irrelevant chunks?

**Answer:**

I would inspect the query embedding, the stored vectors, the selected
collection, metadata filters, and the returned similarity scores. I
would also check whether the chunks are too large or too small.

Possible improvements include tuning chunking, adjusting top-k, adding a
relevance threshold, using hybrid search, and adding a reranker.

------------------------------------------------------------------------

# Part 6 --- Gemini, Prompt Engineering, and LLM Concepts

### Q52. Why do you need Gemini after retrieving data from Qdrant?

**Answer:**

Qdrant is responsible for finding relevant information. It does not
naturally turn those separate text chunks into a conversational answer.

Gemini receives the retrieved context and the user's question. It
understands the relationship between them and generates a readable
response.

### Q53. What is prompt engineering?

**Answer:**

Prompt engineering is the process of designing instructions and context
for an LLM so that it produces the desired output.

In a RAG system, the prompt can define the model's role, provide the
retrieved document context, include the user's question, and explain
that the answer should be based on the supplied context rather than
unsupported assumptions.

### Q54. What should a good RAG prompt contain?

**Answer:**

A useful RAG prompt should contain the retrieved context, the user's
question, and clear instructions about how the model should answer. It
should tell the model to rely on the provided context and explain what
to do when the answer is missing.

The prompt should be clear and should avoid unnecessary instructions
that could confuse the model.

### Q55. What is temperature in an LLM?

**Answer:**

Temperature controls the randomness of token selection during
generation. Lower temperature generally makes responses more focused and
consistent, while higher temperature allows more variation.

For a document question-answering application, a lower temperature can
be useful because we usually prefer clear and consistent answers.
However, low temperature alone does not guarantee correctness.

### Q56. What is a context window?

**Answer:**

A context window is the maximum amount of text, measured in tokens, that
a model can process in one interaction. It includes the instructions,
retrieved chunks, question, and any conversation history included in the
request.

### Q57. What is StrOutputParser?

**Answer:**

In LangChain, StrOutputParser is used to convert a model's output into a
plain string. This is useful when the backend needs to return the
generated answer as ordinary text through an API.

**Implementation note:** Mention this only if it is present in the
current KnowSphere code.

### Q58. What is prompt injection?

**Answer:**

Prompt injection is an attempt to manipulate an LLM by placing malicious
or conflicting instructions inside user input or retrieved content.

For example, an uploaded document might contain text telling the model
to ignore its original instructions. A RAG system should treat retrieved
document content as untrusted information, not as higher-priority
instructions. It should also keep system instructions clear and enforce
access control outside the LLM.

------------------------------------------------------------------------

# Part 7 --- LangChain

### Q59. What is LangChain?

**Answer:**

LangChain is a framework that provides components for building
applications around language models. It includes abstractions for
document loaders, text splitters, embeddings, retrievers, prompts, model
calls, and output parsing.

It helps connect different parts of an LLM application without requiring
every integration to be written from scratch.

### Q60. Why did you use LangChain?

**Answer:**

KnowSphere contains several connected steps: loading documents,
splitting text, generating embeddings, retrieving relevant chunks,
preparing prompts, and calling the LLM.

LangChain provides reusable components for many of these tasks. This
helps keep the pipeline organised and makes it easier to integrate
different models and services.

### Q61. What is a document loader?

**Answer:**

A document loader reads content from a source, such as a file, and
converts it into a format that the application can process. A loader can
also attach metadata, such as a source filename or page information.

### Q62. What is a text splitter?

**Answer:**

A text splitter divides a long document into smaller pieces. These
pieces can then be embedded and stored for retrieval.

### Q63. What is a retriever?

**Answer:**

A retriever is a component that takes a query and returns relevant
documents or chunks from a data source. In a vector-based RAG pipeline,
it can use an embedding model and vector database to perform semantic
retrieval.

### Q64. Could you build RAG without LangChain?

**Answer:**

Yes. LangChain is not mandatory for RAG. I could write the document
loading, splitting, embedding, vector search, prompt construction, and
LLM calls directly using the individual libraries and APIs.

LangChain mainly provides reusable abstractions that make the
integration easier to organise.

------------------------------------------------------------------------

# Part 8 --- FastAPI and Backend APIs

### Q65. What is FastAPI?

**Answer:**

FastAPI is a Python framework used to build APIs. It supports type
hints, request validation, dependency injection, and automatic API
documentation.

I used FastAPI as the backend layer through which the frontend
communicates with the document-processing and RAG functionality.

### Q66. What is an API?

**Answer:**

An API is a way for two software components to communicate. One
component sends a request to another component, and the receiving
component performs a defined operation and returns a response.

For example, the frontend sends a document-upload request to the backend
API, and the backend processes the request and returns a result.

### Q67. What is a REST API?

**Answer:**

A REST API is an API designed around resources and standard HTTP
methods. For example, GET is commonly used to retrieve information, POST
to create or submit data, PUT or PATCH to update data, and DELETE to
remove a resource.

In KnowSphere, the frontend uses backend endpoints to authenticate,
manage knowledge bases, upload documents, and ask questions.

### Q68. What is the difference between GET and POST?

**Answer:**

GET is generally used to retrieve data from a server. POST is generally
used to submit data or create a resource.

For example, getting a list of documents can use GET, while uploading a
new document or submitting a question for processing can use POST.

### Q69. What is Pydantic?

**Answer:**

Pydantic is a Python library used for data validation and settings
management. FastAPI uses Pydantic models to validate incoming request
data and structure responses.

It helps ensure that the backend receives data in the expected format.

### Q70. What is dependency injection in FastAPI?

**Answer:**

Dependency injection allows FastAPI to provide required components or
values to an endpoint. For example, an endpoint can declare that it
needs an authenticated user or database dependency, and FastAPI resolves
that dependency before running the endpoint.

It reduces repeated code and makes application logic easier to organise.

### Q71. What is asynchronous programming?

**Answer:**

Asynchronous programming allows a program to wait for operations such as
network or database calls without blocking the entire execution flow. It
can help an API handle multiple I/O-bound requests efficiently.

It does not automatically make every operation faster. CPU-heavy work
may still need a separate worker or process.

### Q72. What is CORS?

**Answer:**

CORS stands for Cross-Origin Resource Sharing. It is a browser security
mechanism that controls whether a web page from one origin is allowed to
make requests to a server on another origin.

For example, if the frontend and backend are hosted on different
domains, the backend must allow the frontend origin through its CORS
configuration.

### Q73. How does the frontend communicate with FastAPI?

**Answer:**

The frontend sends HTTP requests to FastAPI endpoints. For normal data,
it can send JSON. For file uploads, it generally sends multipart form
data.

For protected endpoints, it also sends the authentication token in the
Authorization header. The backend validates the request and returns a
response that the frontend can display.

### Q74. How would you debug an API that is not working?

**Answer:**

I would first check the HTTP status code and the response body. Then I
would inspect the backend logs and verify the endpoint URL, HTTP method,
request payload, headers, and authentication token.

If the endpoint calls another service, I would check that integration
separately. I would also reproduce the request through Swagger or
another API client to determine whether the issue is in the frontend or
backend.

------------------------------------------------------------------------

# Part 9 --- MongoDB Atlas and Supabase

### Q75. What is MongoDB?

**Answer:**

MongoDB is a NoSQL document database. It stores data in flexible,
JSON-like documents rather than requiring every record to follow a fixed
relational table structure.

It is useful for application data that may have different fields or
nested structures.

### Q76. What is MongoDB Atlas?

**Answer:**

MongoDB Atlas is the managed cloud service for MongoDB. It provides
hosted database infrastructure and management features, so developers do
not need to maintain the database server themselves.

### Q77. Why use MongoDB in KnowSphere?

**Answer:**

MongoDB is used for application-level information and metadata. This
type of data is different from vector embeddings. Keeping application
records in MongoDB makes it easier to manage users, knowledge bases, and
document-related information.

### Q78. What is Supabase?

**Answer:**

Supabase is a backend platform that provides services such as database,
authentication, and storage. In KnowSphere, Supabase is used for storing
the original uploaded files.

### Q79. Why use Supabase Storage instead of storing the original file in Qdrant?

**Answer:**

Qdrant is designed for vector storage and similarity search, not as the
main storage system for original documents.

Supabase Storage is designed to store files. Qdrant stores the
embeddings and retrieval metadata generated from those files. Each
service therefore has a separate responsibility.

### Q80. Why use multiple storage systems?

**Answer:**

Each system is selected for a different type of data. Supabase stores
original files, MongoDB stores application information and metadata, and
Qdrant stores embeddings for semantic search.

Separating these responsibilities makes the architecture easier to
manage and allows each service to perform the task it is designed for.

### Q81. What is the difference between SQL and NoSQL databases?

**Answer:**

Relational SQL databases organise data into tables with defined schemas
and relationships. NoSQL databases support other data models, such as
documents, key-value pairs, or wide-column structures.

MongoDB is a document-oriented NoSQL database. The choice depends on the
application's data model and query requirements.

------------------------------------------------------------------------

# Part 10 --- JWT, Authentication, Authorization, and Multi-Tenancy

### Q82. What is authentication?

**Answer:**

Authentication is the process of verifying who a user is. For example,
when a user logs in with valid credentials, the application verifies
their identity.

### Q83. What is authorization?

**Answer:**

Authorization determines what an authenticated user is allowed to access
or do. A user may be successfully logged in but still should not be
allowed to access another user's private knowledge base.

### Q84. What is JWT?

**Answer:**

JWT stands for JSON Web Token. It is a compact token format used to
securely transmit claims between parties. In a web application, the
backend can issue a signed JWT after successful login.

The frontend sends the token with protected requests. The backend
verifies the token and uses the claims, such as the user identifier, to
identify the user.

### Q85. What are the three parts of a JWT?

**Answer:**

A JWT commonly contains three parts separated by dots:

1.  **Header:** Specifies the token type and signing algorithm.
2.  **Payload:** Contains claims, such as user ID and expiration time.
3.  **Signature:** Allows the receiver to verify that the token has not
    been modified.

The payload is encoded, not automatically encrypted. Sensitive
information should not be placed in it.

### Q86. Is JWT encrypted?

**Answer:**

A typical signed JWT is not encrypted. Its header and payload are
Base64URL encoded, so someone who has the token can decode and read
those parts.

The signature protects integrity, meaning it helps the backend detect
changes. Sensitive information should not be stored in a normal JWT
payload.

### Q87. How does JWT authentication work in your project?

**Answer:**

After a successful login, the backend issues a token containing
information that identifies the user. The frontend includes the token in
the Authorization header when calling protected endpoints.

The backend verifies the token before allowing the request to continue.
After verification, the application can use the authenticated user's
identity for authorization checks.

**Implementation note:** Be prepared to explain the exact signing
library, claims, expiry, and token-storage method used in your current
code.

### Q88. What is a Bearer token?

**Answer:**

A Bearer token is an access token sent with an HTTP request, commonly in
the Authorization header in this format:
`Authorization: Bearer <token>`.

The server validates the token before allowing access to a protected
resource.

### Q89. What is multi-tenancy?

**Answer:**

Multi-tenancy means that one application serves multiple users or
organisations, while keeping each tenant's data and access separate.

In KnowSphere, different users can maintain their own knowledge bases.
The application must ensure that one user cannot access another user's
documents or retrieved chunks.

### Q90. How do you prevent one user from accessing another user's knowledge base?

**Answer:**

The backend first identifies the user through the verified JWT. It
should then check whether the requested knowledge base belongs to that
authenticated user.

The vector search should also apply the relevant user and knowledge-base
filters. This means that even if two users have similar questions, the
retrieval process should only search the data the current user is
authorised to access.

### Q91. Why is authentication alone not enough?

**Answer:**

Authentication only confirms who the user is. It does not automatically
prove that the user has permission to access every resource.

Authorization checks are also required. For example, after identifying
the user, the backend must check that the requested knowledge base
belongs to that user.

### Q92. Why should we not rely only on frontend restrictions?

**Answer:**

Frontend restrictions can be bypassed because users can send requests
directly to backend endpoints. Security checks must therefore be
enforced on the backend.

The backend should validate the user's identity and permissions for
every protected operation.

### Q93. What is the difference between logical and physical tenant isolation?

**Answer:**

Logical isolation means tenant data is stored within shared
infrastructure but separated using identifiers, filters, and
authorization rules.

Physical isolation means tenants have separate infrastructure or storage
resources. Logical isolation can be more cost-efficient, while physical
isolation can provide stronger separation for certain requirements.

The appropriate design depends on security, compliance, scale, and cost.

------------------------------------------------------------------------

# Part 11 --- Testing, Debugging, and Failure Scenarios

### Q94. How did you test KnowSphere?

**Answer:**

I tested the backend endpoints and the complete application flow. I
checked authentication, knowledge-base operations, document upload,
document processing, retrieval, and question answering.

I also checked the integration between the frontend and backend and used
API testing tools such as Swagger to isolate backend issues.

### Q95. Qdrant is returning no results. What would you check?

**Answer:**

I would check whether the collection exists and whether vectors were
inserted successfully. Then I would verify that the embedding dimension
matches the collection configuration and that the same embedding model
is used for both documents and queries.

I would also inspect the metadata filters, especially the user ID and
knowledge-base ID, because an incorrect filter can exclude all results.

### Q96. The document upload succeeds, but the vectors are missing. How would you debug it?

**Answer:**

A successful file upload does not necessarily mean that document
processing also succeeded. I would check whether the stored file can be
downloaded, whether the loader extracted text correctly, and whether the
text splitter generated chunks.

Next, I would inspect embedding generation and the Qdrant upsert
operation. I would also check backend logs to identify the exact stage
where processing failed.

### Q97. Gemini gives an incorrect answer even though the document contains the answer. What would you do?

**Answer:**

I would first inspect the chunks retrieved from Qdrant. If the correct
information was not retrieved, I would investigate chunking, embeddings,
metadata filters, top-k, and search configuration.

If the correct chunk was retrieved, I would inspect the prompt and the
context sent to Gemini. The problem could be that the context is
incomplete, too long, or unclear, or that the model has misunderstood
the information.

### Q98. What if the embedding API or Gemini API fails?

**Answer:**

The backend should handle external-service failures gracefully. I would
catch the relevant exceptions, log enough information for debugging
without exposing secrets, and return a meaningful error response to the
frontend.

For temporary failures, retry logic with suitable limits and backoff can
help. The application should also avoid marking a document as
successfully processed if embedding or indexing failed.

### Q99. What if a user uploads the same document twice?

**Answer:**

The application should have a clear duplicate-document policy. One
option is to calculate a file hash and detect whether the same content
has already been uploaded. The system could reject duplicates, reuse the
existing document, or create a new version.

The important thing is to avoid accidentally creating unnecessary
duplicate vectors and confusing retrieval results.

### Q100. What happens when a document is deleted?

**Answer:**

Deleting a document should remove all related data, not just the
original file. The application needs to remove the corresponding vectors
from Qdrant, the original file from Supabase Storage, and the document
metadata from MongoDB.

The deletion operation should be scoped to the correct user, knowledge
base, and document so that unrelated data is not affected.

### Q101. What if deletion succeeds in one service but fails in another?

**Answer:**

The services are independent, so there may not be one transaction
covering Supabase, MongoDB, and Qdrant. A partial failure can leave
inconsistent data.

A stronger production design would make deletion operations idempotent,
record operation status, retry failed steps, and run reconciliation to
identify and repair incomplete deletions.

------------------------------------------------------------------------

# Part 12 --- Performance, Evaluation, and Improvements

### Q102. How would you measure the quality of a RAG system?

**Answer:**

I would evaluate retrieval and answer generation separately.

For retrieval, I would check whether the system finds the expected
relevant chunks using metrics such as Precision@k, Recall@k, Mean
Reciprocal Rank, or NDCG.

For generation, I would evaluate whether the answer is correct,
relevant, and supported by the retrieved context. I would also measure
latency and use human review for representative questions.

### Q103. What is Recall@k?

**Answer:**

Recall@k measures how many of the relevant items are present among the
top k retrieved results. It helps determine whether the retrieval system
is finding the information it should find.

### Q104. What is Precision@k?

**Answer:**

Precision@k measures the proportion of the top k retrieved results that
are actually relevant. It helps determine whether the search is
returning useful chunks or too many irrelevant ones.

### Q105. What is reranking?

**Answer:**

Reranking is a second-stage process that takes an initial set of
retrieved results and reorders them using a more detailed relevance
model.

For example, the vector database may retrieve a larger set of candidate
chunks. A reranker then evaluates how well each chunk matches the query
and places the most relevant ones first.

### Q106. What is hybrid search?

**Answer:**

Hybrid search combines semantic vector search with keyword-based search.
Vector search is useful for matching meaning, while keyword search is
useful for exact terms, names, IDs, and technical phrases.

Combining both can improve retrieval when a query contains both semantic
intent and exact terms.

### Q107. How would you improve KnowSphere's retrieval quality?

**Answer:**

I would create a set of representative questions and identify which
document chunks should be retrieved for each question. Then I would
evaluate the current retrieval system using Precision@k and Recall@k.

Based on the results, I would tune chunk size and overlap, review
metadata, adjust top-k, and consider a relevance threshold. I would also
explore hybrid search and reranking to improve the quality of retrieved
context.

### Q108. How would you improve the system's response time?

**Answer:**

I would measure the time taken by each stage instead of guessing where
the delay occurs. I would examine document loading, embedding
generation, vector search, and Gemini response time separately.

Possible improvements include batch embedding, caching repeated
operations, optimising database queries, and moving long
document-processing tasks to background workers.

### Q109. Why should document processing use background workers?

**Answer:**

Processing a large document may take time because it involves
downloading, loading, chunking, embedding, and indexing. If all of this
happens inside the upload request, the request may remain open for too
long and could time out.

A background worker can process the document separately. The API can
return an accepted or processing status, and the frontend can check the
document's status later.

### Q110. How would you scale KnowSphere?

**Answer:**

I would separate API request handling from document-processing tasks. A
job queue and background workers could handle ingestion independently.

I would also monitor API latency, retrieval quality, database
performance, and external API failures. As usage grows, I would review
database indexes, vector-search configuration, batching, caching, and
infrastructure capacity.

------------------------------------------------------------------------

# Part 13 --- Deployment and Production Readiness

### Q111. What is deployment?

**Answer:**

Deployment means making an application available in an environment where
users can access it. It includes preparing the frontend and backend,
configuring environment variables, connecting databases and external
services, and making sure the application works outside the local
development environment.

### Q112. What is the difference between development and production?

**Answer:**

Development is the environment where we build, test, and debug the
application. Production is the environment used by actual users.

Production requires stronger security, reliable configuration, error
handling, monitoring, and performance management. We should not expose
development secrets or debugging details in production.

### Q113. What are environment variables?

**Answer:**

Environment variables are configuration values supplied to an
application from its environment rather than hardcoded into the source
code.

They are commonly used for API keys, database connection strings, and
service credentials. This helps keep secrets out of the source code and
allows different configurations for development and production.

### Q114. Why should API keys not be placed in frontend code?

**Answer:**

Frontend code is delivered to the user's browser, so users can inspect
it. If a private API key is placed there, it can be exposed and misused.

Private credentials should remain on the backend or in a secure
secrets-management system. The frontend should call the backend, and the
backend should communicate with protected services.

### Q115. What would you improve before calling KnowSphere production-ready?

**Answer:**

I would strengthen file validation, upload limits, error handling, rate
limiting, logging, and monitoring. I would also add background
processing and clear processing-status tracking for large documents.

For the RAG pipeline, I would add formal retrieval evaluation, better
source attribution, relevance checks, and possibly hybrid search and
reranking. I would also write automated tests for authentication, tenant
isolation, document lifecycle operations, and API behaviour.

------------------------------------------------------------------------

# Part 14 --- Important Challenge, Solution, and Learning Questions

> This final section intentionally contains only the most important
> project-reflection questions. These answers are more conversational
> and are suitable for HR or technical interview follow-ups.

### Q116. What was the biggest challenge you faced while building KnowSphere?

**Answer:**

The biggest challenge was not implementing one individual technology. It
was integrating all the components into one complete working system.

KnowSphere uses several independent services, including FastAPI, MongoDB
Atlas, Supabase, Qdrant, SentenceTransformers, and Gemini. Each
component has a different responsibility, and the complete application
works only when data moves correctly between them.

For example, after a document is uploaded, it must be stored correctly,
its content must be extracted, the text must be divided into chunks,
embeddings must be generated, and those vectors must be stored in
Qdrant. Later, when a user asks a question, the correct chunks must be
retrieved and passed to Gemini.

Making this complete flow work reliably was the most challenging part
because an issue in one stage could affect the final answer.

### Q117. How did you overcome that challenge?

**Answer:**

I approached the problem step by step instead of trying to debug the
complete system at once.

I separated the application into smaller stages, such as API handling,
document storage, text processing, embedding generation, vector storage,
retrieval, and LLM response generation. I tested each stage
independently and checked whether the expected data was being passed to
the next stage.

Once the individual components were working, I integrated them gradually
and tested the complete user flow. This made it easier to identify where
an issue was occurring and helped me understand how the different
services work together.

### Q118. What did you learn from building KnowSphere?

**Answer:**

The biggest learning was understanding how a real RAG application works
beyond the theoretical explanation.

Before building it, I knew concepts such as embeddings, vector
databases, and LLMs individually. While developing KnowSphere, I
understood how these concepts connect in a practical application:
documents are processed into chunks, chunks are converted into
embeddings, Qdrant retrieves relevant information, and Gemini uses that
information to generate an answer.

I also improved my backend development skills through FastAPI, API
integration, database management, authentication, and debugging.
Overall, the project helped me understand how to combine AI components
with backend engineering to solve a practical problem.

### Q119. What would you improve if you had more time?

**Answer:**

I would focus first on improving retrieval quality and production
reliability.

For retrieval, I would create a proper evaluation dataset, measure how
accurately the system retrieves relevant chunks, and explore hybrid
search and reranking. I would also improve how the application handles
cases where the retrieved information is not relevant enough to answer
the question.

On the backend side, I would add background document processing, clearer
processing statuses, stronger error handling, and monitoring. These
improvements would make the system more reliable as the number and size
of uploaded documents increase.

### Q120. Why are you proud of this project?

**Answer:**

I am proud of KnowSphere because I worked on an end-to-end AI
application rather than only building a small model or a basic chatbot
interface.

It helped me connect concepts from Generative AI, semantic search,
vector databases, backend development, authentication, and cloud
services. I also had to understand how the different components
communicate and how to debug problems across the complete pipeline.

The project gave me practical experience in turning individual
technologies into a working application, which is the part I value most.

### Q121. How is KnowSphere different from simply uploading a document to a general AI chatbot?

**Answer:**

The main difference is that KnowSphere is designed as a knowledge-base
platform where users can manage their own document collections and ask
questions against those collections.

It has a document-ingestion pipeline, embedding generation, vector
storage, semantic retrieval, and tenant-level access control. When a
user asks a question, the application retrieves relevant sections from
the selected knowledge base before generating the answer.

So, the main focus is not just chatting with an LLM; it is organising,
retrieving, and securely using document-based knowledge.

------------------------------------------------------------------------

# Part 15 --- Final Interview Revision

## The complete pipeline you must be able to explain

**Document upload:** The user sends a document to the backend.

**File storage:** The original file is stored in Supabase.

**Metadata management:** Application information is stored in MongoDB
Atlas.

**Document loading:** The system extracts the document's text.

**Chunking:** The text is split into smaller sections.

**Embedding generation:** SentenceTransformers converts each chunk into
a numerical vector.

**Vector storage:** Qdrant stores the vectors and associated metadata.

**Question embedding:** The user's question is converted into a vector
using the same embedding model.

**Semantic retrieval:** Qdrant searches for relevant chunks using
similarity search and appropriate metadata filters.

**Context construction:** The retrieved chunks are combined into
context.

**Answer generation:** Gemini receives the context and question and
generates the response.

## Important differences to remember

  -----------------------------------------------------------------------
  Concept A               Concept B               Main difference
  ----------------------- ----------------------- -----------------------
  RAG                     Fine-tuning             RAG retrieves external
                                                  context; fine-tuning
                                                  changes model
                                                  parameters through
                                                  training.

  Embedding model         LLM                     Embeddings represent
                                                  text as vectors; an LLM
                                                  generates or transforms
                                                  text.

  Chunk                   Token                   A chunk is a document
                                                  section; tokens are the
                                                  units processed by the
                                                  model.

  Keyword search          Semantic search         Keyword search matches
                                                  terms; semantic search
                                                  matches meaning.

  Authentication          Authorization           Authentication verifies
                                                  identity; authorization
                                                  checks permissions.

  MongoDB                 Qdrant                  MongoDB manages
                                                  application data;
                                                  Qdrant stores and
                                                  searches vectors.

  Supabase Storage        Qdrant                  Supabase stores
                                                  original files; Qdrant
                                                  stores vectors and
                                                  retrieval metadata.

  FastAPI                 LangChain               FastAPI builds APIs;
                                                  LangChain provides
                                                  components for LLM
                                                  applications.

  Top-k                   Similarity threshold    Top-k limits the number
                                                  of results; a threshold
                                                  filters by a relevance
                                                  score.
  -----------------------------------------------------------------------

## Implementation details to verify before the interview

Do not guess these values. Open your current code and confirm them:

-   Exact document formats supported.
-   Exact document loaders used.
-   Exact text splitter and its configuration.
-   Chunk size and chunk overlap.
-   Exact SentenceTransformers model name.
-   Embedding vector dimension.
-   Qdrant collection name and distance metric.
-   Number of chunks retrieved (top-k).
-   Whether a similarity/relevance threshold is implemented.
-   Exact Gemini model name and prompt.
-   What information is stored in MongoDB.
-   Supabase bucket and file-storage flow.
-   How user and knowledge-base IDs are attached to Qdrant points.
-   How JWT is created, verified, and expired.
-   How document deletion is handled across the three storage systems.
-   What happens when document processing or an external API fails.

## Final advice

Do not memorise every answer word for word. Be confident about the
architecture and the reason behind each technology.

The most important things to explain clearly are:

1.  Why you built KnowSphere and what problem it solves.
2.  How the complete RAG pipeline works.
3.  Why chunking and embeddings are needed.
4.  How Qdrant performs semantic retrieval.
5.  Why Gemini is called after retrieval.
6.  Why MongoDB, Supabase, and Qdrant have separate responsibilities.
7.  How JWT and backend authorization protect each user's knowledge
    base.
8.  What challenge you faced, how you solved it, and what you learned.

If you can explain the complete flow from document upload to the final
Gemini response, and answer why each component is used, you will be in a
strong position to discuss this project.
