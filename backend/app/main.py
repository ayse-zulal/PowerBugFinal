from fastapi import FastAPI
from . import models, database
from .routes import auth, teach
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

origins = [
    "http://localhost:5173", 
    "http://127.0.0.1:5173",
    "https://teachervoiceai.netlify.app",  
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins, 
    allow_credentials=True,
    allow_methods=["*"],  
    allow_headers=["*"],
)

models.Base.metadata.create_all(bind=database.engine)  

app.include_router(auth.router, tags=["Auth"])
app.include_router(teach.router, tags=["Teach"])

@app.get("/")
def read_root():
    return {"message": "AI education project is running!"}
