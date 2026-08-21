from fastapi import UploadFile, File, Depends, BackgroundTasks
from fastapi import APIRouter
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jwt_hendler import varify_jwt
from database import users_collection, KB_collection,document_collection
from bson import ObjectId
from fastapi.responses import JSONResponse
from supabase import create_client
from dotenv import load_dotenv
import os
from document_processing import processing_data
from vector_store import delete_document_vectorStore
from uuid import uuid4

load_dotenv()


# superbase provide there lib for python 

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

supabase = create_client(
    SUPABASE_URL,
    SUPABASE_KEY
)






app = APIRouter()

user_cred=HTTPBearer()

@app.post("/knowledgeBase/{kb_id}/documents")
def upload_documents(kb_id:str,background_tasks:BackgroundTasks,file:UploadFile=File(...),token:HTTPAuthorizationCredentials=Depends(user_cred)):

    jwt_token=token.credentials

    payload=varify_jwt(jwt_token)

    user=users_collection.find_one({
        '_id':ObjectId(payload['id'])
    })

    if not user:
        return JSONResponse(status_code=404,content={'Message':'user not found'})

    knowledgebase=KB_collection.find_one({
        '_id':ObjectId(kb_id),
         "user_id": str(user["_id"])
    })

    if  not knowledgebase:
         return JSONResponse(status_code=404,content={'Message':'KB not found'})


    file_data_bytes=file.file.read()

    # supabase store the data in bytes as object-> supabase Storage is also object storage, and every stored file needs an object name/pat
    # it is name for file that store into supabase that avoid conflite so no to user access same file

    

    unique_file_name = f"{uuid4()}-{file.filename}"

    file_path = (
        f"user_id/{str(user['_id'])}/"
        f"KB_id/{str(knowledgebase['_id'])}/"
        f"document/{unique_file_name}"
    )

    try:

        supabase.storage.from_('documents').upload(
            file_path,
            file_data_bytes,
            {
            "content-type": file.content_type
            }
        )

    except Exception as e:
        print("SUPABASE UPLOAD ERROR:", e)
        return JSONResponse(
            status_code=500,
            content={
                "Message": "File upload failed",
                "Error": str(e)
            }
    )

    


    document_metadata={
        'user_id':str(user['_id']),
        'kb_id':str(knowledgebase['_id']),
        'file_name':file.filename,
        'storage_path':file_path,
        'content_type':file.content_type

    }

    document_object=document_collection.insert_one(document_metadata)

    background_tasks.add_task(processing_data, str(document_object.inserted_id))

    return JSONResponse(status_code=200,content={'Message':'File saved succesfully'})




@app.get("/knowledgeBase/{kb_id}/documents")
def list_all(kb_id:str,token:HTTPAuthorizationCredentials=Depends(user_cred)):
    jwt_token=varify_jwt(token.credentials)

    user=users_collection.find_one({
        '_id':ObjectId(jwt_token['id'])
    })

    if not user:
       return JSONResponse(status_code=404,content={'Message':'User not found'})

    kb_valid=KB_collection.find_one({
        '_id':ObjectId(kb_id),
         "user_id": str(user["_id"])
    })

    if not kb_valid:
        return JSONResponse(status_code=404,content={'Message':'KB not found'})


    all_docs=document_collection.find({
        'user_id':str(user['_id']),
        'kb_id':str(kb_id)
    })


    documents = []

    for doc in all_docs:
        documents.append({
            "document_id": str(doc["_id"]),
            "file_name": doc["file_name"],
            "content_type": doc["content_type"]
        })

    return JSONResponse(status_code=200,content={
        'Message':'sucess',
        'data':documents
    })


@app.delete("/knowledgeBase/{kb_id}/documents/{document_id}")
def removedoc( kb_id: str, document_id: str, token: HTTPAuthorizationCredentials = Depends(user_cred)):
    jwt_token=varify_jwt(token.credentials)
    user=users_collection.find_one({
        '_id':ObjectId(jwt_token['id'])
    })

    if not user:
        return JSONResponse(
            status_code=404,
            content={
                "Message": "User not found"
            }
        )

    kb_valid = KB_collection.find_one({
        "_id": ObjectId(kb_id),
        "user_id": str(user["_id"])
    })

    if not kb_valid:
        return JSONResponse(
            status_code=404,
            content={
                "Message": "KB not found"
            }
        )

    document = document_collection.find_one({
        "_id": ObjectId(document_id),
        "user_id": str(user["_id"]),
        "kb_id": str(kb_id)
    })

    if not document:

        return JSONResponse(
            status_code=404,
            content={
                "Message": "Document not found"
            }
        )

    delete_document_vectorStore(str(user['_id']),str(kb_valid['_id']),str(document['_id']))


    try:

        supabase.storage.from_(
            "documents"
        ).remove([
            document["storage_path"]
        ])

    except Exception:

        return JSONResponse(
            status_code=500,
            content={
                "Message": "Failed to delete file from storage"
            }
        )

    document_collection.delete_one({
        "_id": ObjectId(document_id)
    })

    return {
        "Message": "Document deleted successfully",
        "document_id": document_id
    }