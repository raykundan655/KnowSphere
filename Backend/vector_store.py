import tempfile
from langchain_community.document_loaders import (PyPDFLoader,Docx2txtLoader,TextLoader)
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_huggingface import HuggingFaceEmbeddings
from qdrant_client import QdrantClient
from uuid import uuid4
from dotenv import load_dotenv

from qdrant_client.models import (
    Distance,
    VectorParams,
    PointStruct,
    FilterSelector,
    Filter,
    FieldCondition,
    MatchValue

)

import os

load_dotenv()


QDRANT_API_KEY=os.getenv('QDRANT_API_KEY')
QDRANT_URL=os.getenv('QDRANT_URL')

collection_name="knowledge_base_vectors"

qdrant=QdrantClient(
    url=QDRANT_URL,
    api_key=QDRANT_API_KEY
)



emb_model=HuggingFaceEmbeddings(model_name='sentence-transformers/all-MiniLM-L6-v2')



def process_store(file,file_type,user_id,kb_id,document_id,file_name):

    suffix=f'.{file_type}'

    with tempfile.NamedTemporaryFile(
        suffix=suffix,
        delete=False
    ) as temp:

        file.seek(0)

        temp.write(file.read())

        file_path=temp.name

    if file_type=='pdf':
        loader=PyPDFLoader(file_path)
       
    elif file_type=='docx':
        loader=Docx2txtLoader(file_path)
        
    elif file_type == "txt":
        loader = TextLoader(
            file_path,
            encoding="utf-8"
        )

    else:
        raise ValueError("Unsupported file type")

    document=loader.load()

    splitter=RecursiveCharacterTextSplitter(
        chunk_size=1000,
        chunk_overlap=200
    )

    chunks=splitter.split_documents(document)

    texts = [
        chunk.page_content
        for chunk in chunks
    ]

    embeddings = emb_model.embed_documents(
        texts
    )
    # Qdrant itself does not convert your text into embeddings. You need an embedding model for that


    if not qdrant.collection_exists(collection_name):

        print("Creating Qdrant collection...")

        qdrant.create_collection(
            collection_name=collection_name,
            vectors_config=VectorParams(
                size=384,
                distance=Distance.COSINE
            )
        )

        qdrant.create_payload_index(
            collection_name=collection_name,
            field_name="user_id",
            field_schema="keyword"
        )

        qdrant.create_payload_index(
            collection_name=collection_name,
            field_name="kb_id",
            field_schema="keyword"
        )

        qdrant.create_payload_index(
            collection_name=collection_name,
            field_name="document_id",
            field_schema="keyword"
        )

        # creating index into the database so searching become fast
  


    points=[]

    for index ,(chunk,embedding) in  enumerate(zip(chunks, embeddings)):
        point=PointStruct(
            id=str(uuid4()),  #it gernerate unique user id auto
            vector=embedding,
            payload={
                'document_id':document_id,
                'user_id':user_id,
                'kb_id':kb_id,
                'text':chunk.page_content,
                'metadata':chunk.metadata,
                'document_name':file_name

            }
        )

        points.append(point)

    print("Number of chunks:", len(chunks))
    print("Number of points:", len(points))
    print("Collection exists:", qdrant.collection_exists(collection_name))


    qdrant.upsert(collection_name,points)
    # Insert the points into Qdrant, or update them if a point with the same ID already exists.->UPDATE + INSERT = UPSER

    print("Qdrant upsert completed successfully")


    return {
        "message": "Document processed successfully",
        "document_id": document_id,
        "chunks": len(chunks)
    }

    


def search_document(user_query,user_id,kb_id,limits=5):
    import time
    print("Searching Qdrant...")
    print("User ID:", user_id)
    print("KB ID:", kb_id)

    start_emb = time.time()
    user_emb=emb_model.embed_query(user_query)
    print(f"[TIMER] Local query embedding took: {time.time() - start_emb:.4f} seconds", flush=True)

    start_qdrant = time.time()
    result=qdrant.query_points(
        collection_name=collection_name,
        query=user_emb,

        query_filter=Filter(
            must=[
                FieldCondition(
                    key="user_id",
                    match=MatchValue(value=user_id)
                ),
                FieldCondition(
                    key="kb_id",
                    match=MatchValue(value=kb_id)
                )
            ]
        ),
        limit=limits
    )
    print(f"[TIMER] Qdrant search query took: {time.time() - start_qdrant:.4f} seconds", flush=True)

    return result

# result is qdrant response object







def delete_document_vectorStore(user_id:str,kb_id:str,doc_id:str):

    if not qdrant.collection_exists(collection_name):
        return {
            "message": "Qdrant collection does not exist"
        }

    qdrant.delete(
        collection_name=collection_name,
        points_selector=FilterSelector(
            filter=Filter(
                must=[
                    FieldCondition(
                        key="user_id",
                        match=MatchValue(value=user_id)
                    ),
                    FieldCondition(
                        key="kb_id",
                        match=MatchValue(value=kb_id)
                    ),
                    FieldCondition(
                        key="document_id",
                        match=MatchValue(value=doc_id)
                    )
                ]
            )
        )
    )

    




    
















# NOTE
# LangChain document loaders such as PyPDFLoader generally expect a filesystem path to the document, not an in-memory BytesIO object. A BytesIO object contains the file's bytes in memory but does not have a filesystem path, 
# so we need to write those bytes to a temporary file and pass that temporary file's path to the loader.
# how to create temp file  using the lib tempfile in which NamedTemporaryFile  function that use to create temp file 
# with tempfile.NamedTemporaryFile(
#     delete=False,   -> when ever we come out of with block file auto delete but we don't want it should be delete so delete=False
#     suffix=".txt"
# ) as temp:
