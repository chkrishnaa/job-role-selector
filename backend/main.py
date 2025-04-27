from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from resume_analyzer import analyze_resume

app = FastAPI()

# Allow React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/analyze_resume/")
async def analyze_resume_endpoint(file: UploadFile = File(...)):
    contents = await file.read()
    result = analyze_resume(contents)
    return result
