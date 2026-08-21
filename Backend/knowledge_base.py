from fastapi import APIRouter, Depends
from schema import knowledgeBase
from database import KB_collection,users_collection
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jwt_hendler import varify_jwt
from bson import ObjectId
from fastapi.responses import JSONResponse


app=APIRouter()

user_cred=HTTPBearer()

@app.post('/KnowledgeBase')
def create_knowledgeBase(user_data:knowledgeBase,token:HTTPAuthorizationCredentials=Depends(user_cred)):

    jwt_token=token.credentials

    payload=varify_jwt(jwt_token)

    user=users_collection.find_one({'_id':ObjectId(payload['id'])})


    isexist=KB_collection.find_one({'name':user_data.name,'user_id':str(user['_id'])})

    if isexist:
        return JSONResponse(status_code=400,content={'Message':'Knowledge Base already exist'})

    data=user_data.model_dump()

    data['user_id']=str(user['_id'])

    KB_collection.insert_one(data)

    return JSONResponse(status_code=201,content={'Message':'KnowledgeBase is created'})



@app.get('/KnowledgeBase')
def view_knowledgeBase(token:HTTPAuthorizationCredentials=Depends(user_cred)):
# first runs the dependency, fetches its result, and then injects that result into the function parameter.

    jwt_token=token.credentials

    payload=varify_jwt(jwt_token)

    user=users_collection.find_one({
        '_id':ObjectId(payload['id'])
    })

    Kb_data=KB_collection.find(
        {
            'user_id':str(user['_id'])
        }
    )

    data=[]

    for kb in Kb_data:
        data.append({
            "id": str(kb["_id"]),
            "name": kb["name"],
        })

    return data



@app.get("/knowledgeBase/{kb_id}")
def fetch_knowledgeBase(kb_id:str,token:HTTPAuthorizationCredentials=Depends(user_cred)):

    jwt_token=token.credentials

    payload=varify_jwt(jwt_token)

    user=users_collection.find_one({'_id':ObjectId(payload['id'])})

    knowledgeBase=KB_collection.find_one({
        '_id':ObjectId(kb_id),
        'user_id':str(user['_id'])
    },
    {
        '_id':0
    }
    )

    if not knowledgeBase:
        return JSONResponse(
            status_code=404,
            content={"message": "Knowledge Base not found"}
        )

    return JSONResponse(status_code=200,content={'Message':knowledgeBase})



@app.delete("/knowledgeBase/{kb_id}")
def delete_knowledgeBase(
    kb_id: str,
    token: HTTPAuthorizationCredentials = Depends(user_cred)
):

    jwt_token = token.credentials

   
    payload = varify_jwt(jwt_token)

    
    user = users_collection.find_one({
        "_id": ObjectId(payload["id"])
    })

    if not user:
        return JSONResponse(
            status_code=401,
            content={"message": "User not found"}
        )

    # Delete only if the KB belongs to this user
    result = KB_collection.delete_one({
        "_id": ObjectId(kb_id),
        "user_id": str(user["_id"])
    })


    if result.deleted_count == 0:
        return JSONResponse(
            status_code=404,
            content={"message": "Knowledge Base not found"}
        )

    return JSONResponse(
        status_code=200,
        content={"message": "Knowledge Base deleted successfully"}
    )




