from pathlib import Path

SUPPORTED_EXTENSIONS = {
    ".pdf": "pdf",
    ".docx": "docx",
    ".txt": "txt"
}

def detect_file_type(filename: str):

    extension = Path(filename).suffix.lower()

    if extension not in SUPPORTED_EXTENSIONS:
        return None

    return SUPPORTED_EXTENSIONS[extension]

