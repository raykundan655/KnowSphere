from pwdlib import PasswordHash

passwordModify= PasswordHash.recommended()

def password_hash(user_pass:str)->str:
    result=passwordModify.hash(user_pass)
    return result 

# don't use this for login beacuse it generate random hash value for each->so same password may not get same hash value

def password_varification(user_password:str,pass_Hash:str)->bool:
    return passwordModify.verify(user_password,pass_Hash)

# it return true if both are same