import jwt

# jwt is token is combination of three part payload+header+secret_key

SECRET_KEY = "my-super-secret-key"
ALGORITHM = "HS256"

# encoded
def create_jwt(user_id:str)->str:
    payload={
        "id":user_id
    }

    token=jwt.encode(payload,SECRET_KEY,algorithm=ALGORITHM)

    return token


#decode

def varify_jwt(token:str):

    payload=jwt.decode(token,SECRET_KEY,algorithms=ALGORITHM)

    return payload


