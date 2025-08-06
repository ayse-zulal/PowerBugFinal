# db_memory.py
from sqlalchemy.orm import Session
from .models import Conversation, Message, Topic

class DatabaseMemory:
    def __init__(self, db: Session, conversation_id: int):
        self.db = db
        self.conversation_id = conversation_id

    def add_message(self, role: str, content: str):
        message = Message(
            conversation_id=self.conversation_id,
            role=role,
            content=content
        )
        self.db.add(message)
        self.db.commit()

    def add_topic(self, lecture_name: str, topic_name: str):
        topic = Topic(
            conversation_id=self.conversation_id,
            lecture_name=lecture_name,
            topic_name=topic_name
        )
        self.db.add(topic)
        self.db.commit()
    
    def get_topics(self):
        topics = (
            self.db.query(Topic)
            .filter_by(conversation_id=self.conversation_id)
            .all()
        )
        return [f"{t.lecture_name}: {t.topic_name}" for t in topics]

    def get_conversation_history(self) -> str:
        messages = (
            self.db.query(Message)
            .filter_by(conversation_id=self.conversation_id)
            .order_by(Message.timestamp)
            .all()
        )
        return "\n".join([f"{m.role.upper()}: {m.content}" for m in messages])
