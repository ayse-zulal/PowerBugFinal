import os
import time
import json
from datetime import datetime
from .DatabaseMemory import DatabaseMemory
from sqlalchemy.orm import Session
import google.generativeai as genai
from langchain_core.messages import HumanMessage, AIMessage
from langchain_google_genai import ChatGoogleGenerativeAI
from dotenv import load_dotenv
from .tools import suggest_video_for_topic, search_educational_content, generate_quiz_questions



class VideoTeacherSystem:
    """Ana öğretmen sistemi"""
    
    def __init__(self, db: Session, conversation_id: int):
        load_dotenv()

        self.GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
        self.TAVILY_API_KEY = os.getenv("TAVILY_API_KEY")

        if not self.GEMINI_API_KEY:
            raise ValueError("GEMINI_API_KEY api.env dosyasında bulunamadı!")
        if not self.TAVILY_API_KEY:
            raise ValueError("TAVILY_API_KEY api.env dosyasında bulunamadı!")

        os.environ["TAVILY_API_KEY"] = self.TAVILY_API_KEY

        genai.configure(api_key=self.GEMINI_API_KEY)

        self.memory = DatabaseMemory(db, conversation_id)

    def get_llm(self):
        return ChatGoogleGenerativeAI(
            model="gemini-2.0-flash", 
            google_api_key=self.GEMINI_API_KEY
            )

    def get_llm_with_tools(self):
        tools = [suggest_video_for_topic, generate_quiz_questions, search_educational_content]
        return ChatGoogleGenerativeAI(
            model="gemini-2.0-flash", 
            google_api_key=self.GEMINI_API_KEY
        ).bind_tools(tools)
    
    def student_progress(self, student_prompt: str):
        """Öğrencinin cevabı olumlu bir ilerleme içeriyor mu"""
        conversation_history = self.memory.get_conversation_history()
        
        system_prompt = f"""
        Sana bir öğrencinin soru çözerken bir öğretmeniyle yaptığı konuşmaları veriyorum: {conversation_history}
        
        Öğrencinin şu yeni cevabı: {student_prompt} öğretmenin en son isteğini/ricasını karşılıyor mu?
        
        Sadece şu kelimelerden birini kullan:
        - "True" (eğer öğrenci öğretmenin isteğini karşıladıysa)
        - "False" (eğer karşılamadıysa)
        
        Başka kelime kullanma.
        """

        response = self.get_llm().invoke([HumanMessage(content=system_prompt)])
        return response.content.strip()
    
    def should_suggest_video(self, student_prompt: str, conversation_history: str) -> bool:
        """Video önerisi yapılıp yapılmayacağını belirle"""
        check_prompt = f"""
        Konuşma geçmişi: {conversation_history}
        Öğrencinin son mesajı: {student_prompt}
        
        Öğrencinin bir konuyu anlamakta zorlandığı veya ek kaynak ihtiyacı olduğu durumu var mı?
        
        Sadece "True" veya "False" yanıtla.
        """

        response = self.get_llm().invoke([HumanMessage(content=check_prompt)])
        return "True" in response.content
    
    def should_search_content(self, student_prompt: str, conversation_history: str) -> bool:
        """Eğitimsel içerik araması yapılıp yapılmayacağını belirle - GELİŞTİRİLDİ"""
        # Anahtar kelimeler listesi genişletildi
        search_keywords = [
            "link", "site", "kaynak", "araştır", "bul", "internetten", 
            "web", "url", "güncel", "yeni", "son", "örnek", "açıklama",
            "detay", "bilgi", "öğren", "anlat", "göster", "nerede",
            "hangi", "nasıl", "ne zaman", "kimden", "nereden"
        ]
        
        # Basit keyword kontrolü
        student_lower = student_prompt.lower()
        has_search_keyword = any(keyword in student_lower for keyword in search_keywords)
        
        if has_search_keyword:
            print(f"🔍 Anahtar kelime bulundu, arama yapılacak: {student_prompt}")
            return True
        
        # AI ile de kontrol et
        check_prompt = f"""
        Konuşma geçmişi: {conversation_history}
        Öğrencinin son mesajı: {student_prompt}
        
        Öğrenci aşağıdakilerden birini mi istiyor?:
        - Web sitesi linki
        - İnternet kaynağı
        - Güncel bilgi
        - Ek kaynak/materyal
        - Detaylı açıklama
        - Örnek/örnekler
        - Araştırma yapılması
        
        Çok titiz ol, sadece öğrenci yukarıdaki gibi istekte bulunduğu sürece True de, yoksa False.
        Sadece "True" veya "False" yanıtla.
        """
        
        response = self.get_llm().invoke([HumanMessage(content=check_prompt)])
        result = "True" in response.content
        
        print(f"🔍 Search decision - Keyword: {has_search_keyword}, AI: {result}")
        return result

    def should_generate_quiz(self, student_prompt: str, conversation_history: str) -> bool:
        """Quiz oluşturulup oluşturulmayacağını belirle"""
        check_prompt = f"""
        Konuşma geçmişi: {conversation_history}
        Öğrencinin son mesajı: {student_prompt}
        
        Öğrenci quiz, soru, tekrar, test, alıştırma veya benzer bir talep mi yapıyor?
        Ya da önceki konularını tekrar etmek istiyor mu? Öğrenci bu kelimelerden birini kullanmadığı sürece False demen lazım.  
        Çok titiz ol, öğrenci istemediği sürece False de.
        
        Sadece "True" veya "False" yanıtla.
        """

        response = self.get_llm().invoke([HumanMessage(content=check_prompt)])
        return "True" in response.content
    
    def extract_topic_for_video(self, conversation_history: str) -> str:
        """Video önerisi için konuyu çıkar"""
        extract_prompt = f"""
        Konuşma geçmişi: {conversation_history}
        
        Bu konuşmada hangi ana konu/kavram üzerinde durulmuş? Video önerisi için konu adını tek kelime veya kısa ifade olarak söyle.
        
        Örnek: "mutlak değer", "türev", "integral", "açıortay" gibi.
        Sadece konu adını yaz, başka açıklama yapma.
        """
        
        response = self.get_llm().invoke([HumanMessage(content=extract_prompt)])
        return response.content.strip()
    
    def extract_search_query(self, student_prompt: str, conversation_history: str) -> str:
        """Arama sorgusu çıkar"""
        extract_prompt = f"""
        Konuşma geçmişi: {conversation_history}
        Öğrencinin son mesajı: {student_prompt}
        
        Öğrencinin aradığı bilgi için en uygun arama sorgusunu çıkar.
        Sadece arama terimini ver, başka açıklama yapma.
        
        Örnek: "matematik logaritma örnekleri" veya "fizik hareket yasaları"
        """
        
        response = self.get_llm().invoke([HumanMessage(content=extract_prompt)])
        return response.content.strip()

    def extract_search_query(self, student_prompt: str, conversation_history: str) -> str:
        """Arama sorgusu çıkar"""
        extract_prompt = f"""
        Konuşma geçmişi: {conversation_history}
        Öğrencinin son mesajı: {student_prompt}

        Öğrencinin aradığı bilgi için en uygun arama sorgusunu çıkar.
        Sadece arama terimini ver, başka açıklama yapma.

        Örnek: "matematik logaritma örnekleri" veya "fizik hareket yasaları"
        """

        response = self.get_llm().invoke([HumanMessage(content=extract_prompt)])
        return response.content.strip()

    def upload_video_to_gemini(self, video_path: str) -> str:
        """Videoyu Gemini File API'ye yükle"""
        try:
            print(f"📤 Video yükleniyor: {os.path.basename(video_path)}")
            
            # Videoyu yükle
            video_file = genai.upload_file(
                path=video_path,
                display_name=f"student_video_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
            )
            
            print("⏳ Video işleniyor...")
            # Video işlenene kadar bekle
            while video_file.state.name == "PROCESSING":
                time.sleep(2)
                video_file = genai.get_file(video_file.name)
            
            if video_file.state.name == "FAILED":
                raise Exception("Video işlenemedi")
                
            print("✅ Video başarıyla yüklendi")
            return video_file.name
            
        except Exception as e:
            print(f"❌ Video yükleme hatası: {e}")
            return None
    
    def get_teacher_response(self, student_prompt: str, video_file_name: str = None) -> str:
        """Öğretmen yanıtı üret - video varsa dosya adıyla birlikte analiz et"""
        print("🧠 Öğretmen yanıtı hazırlanıyor...")
        
        # Konuşma geçmişini al
        conversation_history = self.memory.get_conversation_history()
        
        # Öğrenci progress al
        progress = self.student_progress(student_prompt)
        print(f"📊 Öğrenci Progress: {progress}")
        
        progress_bool = None
        if "True" in progress:
            progress_bool = "Olumlu"
        elif "False" in progress:
            progress_bool = "Olumsuz"

        # Tool kullanım kararları
        should_suggest = self.should_suggest_video(student_prompt, conversation_history)
        should_quiz = self.should_generate_quiz(student_prompt, conversation_history)
        should_search = self.should_search_content(student_prompt, conversation_history)
        
        print(f"🔧 Tool decisions - Video: {should_suggest}, Quiz: {should_quiz}, Search: {should_search}")
        
        # Sistem promptu
        system_prompt = f"""
Sen, YKS'ye hazırlanan bir öğrencinin öğretmenisin. Onunla birebir konuşuyorsun. Sokratik yöntemle öğretim yapıyorsun.

Önceki konuşmalarınız:
{conversation_history}

{f"Öğrenci bir video gönderdi. Videodaki çözüm adımlarını (hem görsel hem sesli açıklamaları) analiz et:" if video_file_name else ""}

Öğrencinin yeni cevabı: {student_prompt}
Öğrencinin ilerlemesi: {progress_bool}

Görevin:
1. {f"Videodaki çözüm adımlarını incele ve" if video_file_name else ""} Öğrencinin hatalı adımlarını bul
2. Hata yoksa tebrik et ve başka sorusu olup olmadığını sor
3. Hata varsa çözümü direkt verme, Sokratik sorularla yönlendir
4. Anlamadığı konuları öğret, samimi ve destekleyici ol
5. {"Eğer öğrenci zorlanıyorsa, konuyla ilgili video önerisi yapmayı düşün" if should_suggest else ""}
6. {"Eğer öğrenci quiz/tekrar istiyor ve önceki konuları varsa, quiz oluşturmayı düşün" if should_quiz else ""}
7. {"Eğer öğrenci kaynak/link/bilgi istiyor, web araması yapmayı düşün" if should_search else ""}

Öğrenciyle doğrudan konuş, o seni dinliyor olacak, onunla yüz yüze sohbe tediyormuşsun gibi konuş.
"""

        try:
            if video_file_name:
                # Video varsa direkt genai SDK kullan
                model = genai.GenerativeModel("gemini-2.0-flash")
                video_file = genai.get_file(video_file_name)
                
                response = model.generate_content([
                    system_prompt,
                    video_file
                ])
                teacher_response = response.text
            
            else:
                response = self.get_llm().invoke([HumanMessage(content=system_prompt)])
                teacher_response = response.content
            tool_results=[]
            # Tool kullanımı gerekiyorsa tool'lu model kullan
            if should_suggest or should_quiz or should_search:
                tool_results=[]
                print("🔧 Tool'lu model kullanılacak")
                response = self.get_llm().invoke([HumanMessage(content=system_prompt)])
                # Tool çağrılarını manuel olarak yap
                    
                if should_suggest:
                    topic = self.extract_topic_for_video(conversation_history)
                    print(f"🎯 Video önerisi için çıkarılan konu: {topic}")
                    video_result = suggest_video_for_topic.invoke({"topic_name": topic})
                    tool_results.append(video_result)
                    
                if should_search and (not should_quiz):
                    search_query = self.extract_search_query(student_prompt, conversation_history)
                    search_result = search_educational_content.invoke({"query": search_query})
                    tool_results.append(search_result)

                if should_quiz:
                    quiz_result = generate_quiz_questions.invoke({
                        "student_prompt": student_prompt,
                        "db": self.memory.db,
                        "conversation_id": self.memory.session_id
                    })
                    tool_results.append(quiz_result)
                
            # Tool sonuçlarını ekle
            if tool_results:
                teacher_response += "\n\n" + "\n\n".join(tool_results)
            
            return teacher_response
                
        except Exception as e:
            print(f"❌ AI yanıt hatası: {e}")
            return "Üzgünüm, şu anda yanıt veremiyorum. Lütfen tekrar deneyin."
    
    def detect_topics_for_quiz(self):
        """Öğrencinin eksik olduğu konuları anlama ve kaydetme"""
        conversation_history = self.memory.get_conversation_history()

        system_prompt = f"""
Aşağıda bir öğrencinin öğretmeniyle yaptığı soru çözüm konuşmaları var:
{conversation_history}

Lütfen öğrencinin eksik olduğu veya tekrar etmesi gereken konuları belirle.
Cevabı sadece aşağıdaki gibi bir JSON formatında ver:

[
{{ "lecture_name": "Matematik", "topic_name": "Mutlak Değer" }},
{{ "lecture_name": "Geometri", "topic_name": "Açıortay" }}
]

Eğer konu bulamazsan boş bir liste [] döndür.
"""
        try:
            response = self.get_llm().invoke([HumanMessage(content=system_prompt)])
            # JSON parse etmeye çalış
            response_text = response.content.strip()
            
            # JSON kısmını çıkar (eğer başka metin de varsa)
            import re
            json_match = re.search(r'\[.*\]', response_text, re.DOTALL)
            if json_match:
                json_text = json_match.group()
                topics = json.loads(json_text)
            else:
                topics = []

            for topic in topics:
                lecture_name = topic.get("lecture_name", "Genel")
                topic_name = topic.get("topic_name", "Bilinmeyen Konu")
                self.memory.add_topic(lecture_name, topic_name)
            
            if topics:
                print(f"📚 Yeni konular eklendi: {topics}")
                
        except Exception as e:
            print(f"❌ Konu algılama hatası: {e}")

    def process_video_session(self, video_path: str, student_prompt: str) -> str:
        """Video ile öğrenme oturumu"""
        try:
            # Videoyu Gemini'ye yükle
            video_file_name = self.upload_video_to_gemini(video_path)
            if not video_file_name:
                return "❌ Video yüklenemedi."
            
            # Öğretmen yanıtı (video dosyasıyla birlikte)
            teacher_response = self.get_teacher_response(student_prompt, video_file_name)
            
            # Hafızaya kaydet
            self.memory.add_message("student", student_prompt)
            self.memory.add_message("teacher", teacher_response)
            
            # Video dosyasını temizle
            try:
                genai.delete_file(video_file_name)
                print("🗑️ Geçici video dosyası temizlendi")
            except:
                pass
            
            return teacher_response
            
        except Exception as e:
            error_msg = f"❌ Hata: {e}"
            print(error_msg)
            return error_msg
    
    def process_text_session(self, student_prompt: str) -> str:
        """Sadece metin ile öğrenme oturumu"""
        teacher_response = self.get_teacher_response(student_prompt)
        
        # Hafızaya kaydet
        self.memory.add_message("student", student_prompt)
        self.memory.add_message("teacher", teacher_response)
        
        return teacher_response
    
    def save_session(self, filepath: str = None):
        """Oturumu kaydet"""
        self.detect_topics_for_quiz()
        print(self.memory.topics_for_quiz)
        #self.memory.save_topics_to_db()
        #self.memory.save_to_file(filepath)
        self.memory.save_topics_to_file()
        print(f"💾 Oturum kaydedildi: {filepath or f'session_{self.memory.session_id}.json'}")
