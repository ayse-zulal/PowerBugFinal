from fastapi import FastAPI
from . import models, database
from .routes import auth, teach

app = FastAPI()

models.Base.metadata.create_all(bind=database.engine)  

app.include_router(auth.router, tags=["Auth"])
app.include_router(teach.router, tags=["Teach"])

@app.get("/")
def read_root():
    return {"message": "AI education project is running!"}