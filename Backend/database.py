from pymongo import MongoClient
from dotenv  import load_dotenv
import os
import certifi

load_dotenv()

MONGODB_URL=os.getenv("MONGODB_URL")



client=MongoClient(MONGODB_URL, tlsCAFile=certifi.where())

users_database=client['Users']

users_collection=users_database['Users_auth']


KB_collection=users_database['Knowledge_Base']

document_collection=users_database['document_metadata']
