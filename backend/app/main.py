from fastapi import FastAPI
from . import models, database
from .routes import auth

app = FastAPI()

models.Base.metadata.create_all(bind=database.engine)  # Tabloları oluştur

app.include_router(auth.router, tags=["Auth"])

@app.get("/")
def read_root():
    return {"message": "AI education project is running!"}