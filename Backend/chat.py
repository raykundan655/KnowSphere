from fastapi import APIRouter,Depends
from fastapi.security import HTTPBearer,HTTPAuthorizationCredentials
from schema import chatmodel
from jwt_hendler import varify_jwt
from rag import generate_ans
from database import users_collection,KB_collection
from bson import ObjectId
from fastapi.responses import JSONResponse

app=APIRouter()

user_cred = HTTPBearer()

@app.post('/knowledgeBase/{kb_id}/chat')
def chitchat(user_input:chatmodel,kb_id:str,token:HTTPAuthorizationCredentials=Depends(user_cred)):
    jwt_token=token.credentials

    user=varify_jwt(jwt_token)

    user_valid=users_collection.find_one({
        '_id':ObjectId(user['id'])
        })

    if not user_valid:
       return JSONResponse(status_code=404,content={
            'Message':'User not valid'
        })

    kb_valid=KB_collection.find_one(
        {
            'user_id':user['id'],
            '_id':ObjectId(kb_id)
        }
    )

    if not kb_valid:
        return JSONResponse(status_code=404,content={
                    'Message':'Kb not valid'
                })


    output=generate_ans(user_input.question,user['id'],kb_id)

    return {
    "question": user_input.question,
    "answer": output
    }







