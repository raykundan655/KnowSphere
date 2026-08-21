from database import document_collection
from file_detection import detect_file_type
from bson import ObjectId
from fastapi.responses import JSONResponse
from supabase import create_client
from dotenv import load_dotenv
import os
from vector_store import process_store
from io import BytesIO



load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

supabase = create_client(
    SUPABASE_URL,
    SUPABASE_KEY
)




def processing_data(document_id:str):

    document_metadata=document_collection.find_one({
        '_id':ObjectId(document_id)
    })

    if not document_metadata:
        return JSONResponse(status_code=404,content={'Message':'file not found'})

    try:
        file_path=document_metadata['storage_path']


        file=BytesIO(supabase.storage.from_('documents').download(file_path))   # data is bytes, not a normal Python file object.

    except Exception as e:
        print("SUPABASE DOWNLOAD ERROR:", e)

        return JSONResponse(
            status_code=500,
            content={
                'Message': 'server issue',
                'Error': str(e)
            }
        )
    

    file_type=detect_file_type(document_metadata['file_name'])

    result=process_store(file,file_type,document_metadata['user_id'],document_metadata['kb_id'],document_id,document_metadata['file_name'])

    return result





# NOTE 
# When we upload a file to Supabase Storage:
# File → bytes → Supabase Storage

# When we download:
# Supabase Storage → bytes
# download() returns bytes, not a normal file.

# Many classes/libraries work with a file or file-like object,
# not directly with bytes.

# So we use:
# data = supabase.storage.from_("documents").download("file.pdf")
# file = BytesIO(data)
# Now BytesIO(data) gives us a file-like object in memory,
# which can be passed to those classes/libraries.


# Important:
# BytesIO does NOT create/save a physical file on the computer.
# It creates a file-like object in RAM.

