from pydantic import BaseModel,Field,EmailStr
from typing import Annotated

class UserRegister(BaseModel):
    gmail:Annotated[EmailStr,Field(...,description='Enter you gamil')]
    password:Annotated[str,Field(...,description='Enter your password')]
    confirm:Annotated[str,Field(...,description='Again enter the password')]



class userlogin(BaseModel):
    gmail:Annotated[EmailStr,Field(...,description='Enter your Email')]
    password:Annotated[str,Field(...,description='Enter your password')]


class knowledgeBase(BaseModel):
    name:Annotated[str,Field(...,description='Enter the Name of KnowledgeBase')]
    info:Annotated[str,Field(...,description='Tell me about KnowledgeNase')]

class chatmodel(BaseModel):
    question:Annotated[str,Field(...,description='User will enter the question')]
    