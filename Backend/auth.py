from fastapi import APIRouter, Depends
from schema import UserRegister,userlogin
from database import users_collection
from fastapi.responses import JSONResponse
from security import password_hash,password_varification
from jwt_hendler import create_jwt,varify_jwt
from fastapi.security import HTTPAuthorizationCredentials,HTTPBearer
from bson import ObjectId


app=APIRouter()

cred_req=HTTPBearer()  #it tell auth code is coming ->and it extract it->extracted data store by httpsauthorizationcredentials

@app.post("/register")
def register(user_input:UserRegister):

    result=users_collection.find_one({'gmail':user_input.gmail})

    if result:
        return JSONResponse(status_code=400,content={'Message':'Invalid email or password'})

    if user_input.password!=user_input.confirm:
        return JSONResponse(status_code=400,content={'Message':'Invalid email or password'})

    data=user_input.model_dump(exclude=['confirm'])

    result=password_hash(data['password'])

    data['password']=result

    users_collection.insert_one(data)

    return JSONResponse(status_code=201,content={'Message':'Account is created'})




@app.post('/login')
def user_login(user_input:userlogin):

    result=users_collection.find_one(
                  {'gmail':user_input.gmail},
                  )

    if not result:
        return JSONResponse(status_code=401,content={'Message':'user not found'})

    hashvalue=result['password']

    login=password_varification(user_input.password,hashvalue)

    if not login:
        return JSONResponse(status_code=401,content={'Message':'Password not match'})


    token=create_jwt(str(result['_id']))

    return JSONResponse(status_code=200,content={'Message':'User login','token':token})


    
@app.get('/me')
def profile(token:HTTPAuthorizationCredentials=Depends(cred_req)):

    jwt_token=token.credentials

    payload=varify_jwt(jwt_token)

    user_id = payload["id"]

    user=users_collection.find_one({'_id':ObjectId(user_id)})

    return user















