from dataclasses import dataclass, field
from typing import List, Dict, Optional
import json
from datetime import datetime
#from models import Topics
#from database import SessionLocal
#from sqlalchemy.orm import Session
import os
TOPICS_FILE_PATH = "topics.json"

@dataclass
class ConversationMemory:
    """Konuşma hafızasını yöneten sınıf"""
    messages: List[Dict] = field(default_factory=list)
    topics_for_quiz: List[Dict] = field(default_factory=list)
    session_id: str = field(default_factory=lambda: datetime.now().strftime("%Y%m%d_%H%M%S"))
    
    def add_message(self, role: str, content: str, metadata: Optional[Dict] = None):
        """Yeni mesaj ekle"""
        message = {
            "role": role,
            "content": content,
            "timestamp": datetime.now().isoformat(),
            "metadata": metadata or {}
        }
        self.messages.append(message)

    def add_topic(self, lecture_name: str, topic_name: str):
        """Yeni konu ekle"""
        topic_for_quiz = {
            "lecture_name": lecture_name,
            "topic_name": topic_name,
        }
        # Aynı konuyu tekrar ekleme
        if topic_for_quiz not in self.topics_for_quiz:
            self.topics_for_quiz.append(topic_for_quiz)
    
    def get_conversation_history(self, limit: int = 15) -> str:
        """Son N mesajı formatted string olarak döndür"""
        if not self.messages:
            return "Henüz önceki konuşma yok."
        
        recent_messages = self.messages[-limit:]
        history = []
        
        for msg in recent_messages:
            role_name = "Öğrenci" if msg["role"] == "student" else "Öğretmen"
            history.append(f"{role_name}: {msg['content']}")
        
        return "\n".join(history)


    def save_topics_to_file(self):
        existing_topics = []

        if os.path.exists(TOPICS_FILE_PATH) and os.path.getsize(TOPICS_FILE_PATH) > 0:
            try:
                with open(TOPICS_FILE_PATH, "r", encoding="utf-8") as f:
                    existing_topics = json.load(f)
            except json.JSONDecodeError:
                print("⚠️ Uyarı: Kayıt dosyası bozuk. Yeni veriyle üzerine yazılacak.")
                existing_topics = []

        # Duplicate kontrolü
        existing_set = {(t["lecture_name"], t["topic_name"]) for t in existing_topics}

        for topic in self.topics_for_quiz:
            key = (topic["lecture_name"], topic["topic_name"])
            if key not in existing_set:
                existing_topics.append(topic)
                existing_set.add(key)

        with open(TOPICS_FILE_PATH, "w", encoding="utf-8") as f:
            json.dump(existing_topics, f, ensure_ascii=False, indent=2)


            # Dosyaya yaz
            with open(TOPICS_FILE_PATH, "w", encoding="utf-8") as f:
                json.dump(existing_topics, f, ensure_ascii=False, indent=2)

    @staticmethod
    def load_topics_from_file() -> List[Dict[str, str]]:
        """Dosyadan tüm topic verilerini JSON uyumlu liste olarak döndür"""
        try:
            with open(TOPICS_FILE_PATH, "r", encoding="utf-8") as f:
                return json.load(f)
        except FileNotFoundError:
            return []

    