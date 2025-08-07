from fastapi import APIRouter, Body, UploadFile, File, HTTPException
from fastapi import Depends
from .. import models, schemas, database, Teacher
from sqlalchemy.orm import Session
import shutil
import os
import uuid
from typing import Annotated

router = APIRouter()

def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()

# 1. Konuşma oluşturma
@router.post("/conversations/")
def create_conversation(payload: schemas.ConversationCreate, db: Session = Depends(get_db)):
    new_convo = models.Conversation(user_id=payload.user_id, title=payload.title)
    db.add(new_convo)
    db.commit()
    db.refresh(new_convo)
    return {"conversation_id": new_convo.id, "message": "Conversation created."}


# 2. Metin mesajı gönder ve AI yanıt al
@router.post("/conversations/{conversation_id}/message/")
def send_message(conversation_id: int, msg: schemas.MessageInput, db: Session = Depends(get_db)):
       teacher = Teacher.VideoTeacherSystem(db=db, conversation_id=conversation_id)
       teacher.memory.add_message("student", msg.message)

       ai_response = teacher.process_text_session(msg.message)

       teacher.memory.add_message("teacher", ai_response)
       return {
           "student_message": msg.message,
           "teacher_response": ai_response
       }



# 3. Video + metin mesajı gönder ve AI yanıt al
@router.post("/conversations/{conversation_id}/video/")
def send_video(conversation_id: int, message: str, video: UploadFile = File(...), db: Session = Depends(get_db)):
    try:
        # Videoyu geçici olarak kaydet
        teacher = Teacher.VideoTeacherSystem(db=db, conversation_id=conversation_id)
        temp_filename = f"temp_videos/{uuid.uuid4().hex}_{video.filename}"
        os.makedirs(os.path.dirname(temp_filename), exist_ok=True)
        with open(temp_filename, "wb") as buffer:
            shutil.copyfileobj(video.file, buffer)
        
        # AI video + mesaj yanıtı al
        ai_response = teacher.process_video_session(temp_filename, message)

        return {
            "student_message": message,
            "teacher_response": ai_response
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        # Dosyayı sil
        if os.path.exists(temp_filename):
            os.remove(temp_filename)
