import json
import os
from langchain_core.tools import tool
from youtubesearchpython import VideosSearch
from langchain_tavily import TavilySearch  # Doğru import
from langchain_core.messages import HumanMessage, AIMessage
from langchain_google_genai import ChatGoogleGenerativeAI
from dotenv import dotenv_values, load_dotenv
from . import DatabaseMemory
from sqlalchemy.orm import Session  # <-- Add this import

load_dotenv()
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
TAVILY_API_KEY = os.getenv("TAVILY_API_KEY")

@tool
def suggest_video_for_topic(topic_name: str) -> str:
    """
    Belirtilen konuya uygun bir YouTube konu anlatım videosu önerir.
    Türkçe içerikleri önceliklidir.
    """
    try:
        # Türkçe arama terimi optimize et
        search_query = f"{topic_name} konu anlatımı YKS türkçe"
        results = VideosSearch(search_query, max_results=3).next()
        
        if results:
            video_suggestions = []
            for i, result in enumerate(results[:2]):  # İlk 2 sonucu al
                url = f"https://www.youtube.com{result['url_suffix']}"
                video_suggestions.append(f"{i+1}. {result['title']} - {url}")
            
            return f"🎥 {topic_name} konusu için video önerileri:\n" + "\n".join(video_suggestions)
        else:
            return f"Üzgünüm, {topic_name} için uygun bir video bulunamadı."
    except Exception as e:
        return f"Video önerisi alınamadı: {e}"


@tool
def search_educational_content(query: str) -> str:
    """
    Eğitimsel içerik ve YKS ile ilgili güncel bilgileri arar.
    Öğrencinin soruları için ek kaynak ve bilgi sağlar.
    """
    try:
        print(f"🔍 SEARCH TOOL ÇAĞRILDI: {query}")  # Debug log ekledik
        
        # Tavily search engine kullan
        search_tool = TavilySearch(
            max_results=3,
            search_depth="advanced"
        )
        
        # YKS odaklı arama sorgusu hazırla
        enhanced_query = f"{query}"
        print(f"🔍 Enhanced query: {enhanced_query}")  # Debug log
        
        results = search_tool.invoke(enhanced_query)
        #print(f"🔍 Search results: {results}")  # Debug log
        print(f"🔍 Search results type: {type(results)}")  # <--- Bunu ekle
        if results:
            search_summary = f"🔍 '{query}' hakkında bulduğum bilgiler:\n\n"
            
            # Tavily sonuçları genellikle string listesi olarak gelir
            if isinstance(results, dict) and "results" in results:
                result_items = results["results"]
                for i, result in enumerate(result_items[:2], 1):
                    if isinstance(result, dict):
                        title = result.get('title', 'Başlık yok')
                        content = result.get('content', result.get('snippet', 'İçerik yok'))[:200] + "..."
                        url = result.get('url', '')
                        
                        search_summary += f"{i}. **{title}**\n"
                        search_summary += f"   {content}\n"
                        search_summary += f"   📎 Kaynak: {url}\n\n"
                    elif isinstance(result, str):
                        search_summary += f"{i}. {result[:200]}...\n\n"
            print("search summry de böyle ",search_summary)
            return search_summary
        else:
            return f"'{query}' hakkında uygun bilgi bulunamadı."
            
    except Exception as e:
        error_msg = f"Arama yapılamadı: {e}"
        print(f"❌ SEARCH ERROR: {error_msg}")  # Debug log
        return error_msg


@tool 
def generate_quiz_questions(student_prompt: str, db: Session = None, conversation_id: int = None) -> str:
    """
    Daha önce öğrenciyle yapılan konuşmalardaki eksik konular üzerinden quiz oluşturur.
    """
    try:
        if not db or not conversation_id:
            return "Veritabanı bağlantısı veya conversation_id eksik"

        memory = DatabaseMemory(db, conversation_id)
        topics = memory.get_topics()

        llm = ChatGoogleGenerativeAI(
            model="gemini-2.0-flash",
            google_api_key=GEMINI_API_KEY
        )

        extract_prompt = f"""
        Öğrencinin son mesajı: {student_prompt}
        Öğrencinin daha önce anlamadığı/yapamadığı konular şunlar: {topics}
        Bu konular içinden öğrencinin promptuyla en çok alakalı olanları filtrele ve onlarla ilgili quiz soruları oluştur.
        Sadece soruları ver, açıklama yapma.
        """

        response = llm.invoke([HumanMessage(content=extract_prompt)])
        return response.content.strip()

    except Exception as e:
        return f"Quiz oluşturulamadı: {e}"