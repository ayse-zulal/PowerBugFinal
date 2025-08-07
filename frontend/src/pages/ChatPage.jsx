import React, { useState, useRef, useEffect, useCallback } from 'react';

import { 
  FaCommentDots, 
  FaMicrophone, 
  FaStop, 
  FaVideo,
  FaPaperPlane 
} from "react-icons/fa";

import ImageUploader from '../components/ImageUploader'; 
import TldrawCanvas from '../components/TldrawCanvas';
import ChatDrawer from '../components/ChatDrawer';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { 
  createConversation, 
  sendTextMessage, 
  sendVideoMessage 
} from '../services/apiService';
import { speakText } from '../services/speechService';

function ChatPage() {

  const [conversationId, setConversationId] = useState(null);
  
  const [originalQuestionImage, setOriginalQuestionImage] = useState(null);
  const [isSessionStarted, setIsSessionStarted] = useState(false);
  
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);

  const [isRecording, setIsRecording] = useState(false);
  const [videoUrl, setVideoUrl] = useState(null);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const mediaRecorderRef = useRef(null);
  const recordedChunksRef = useRef([]);
  const streamRef = useRef(null);
  
  const { isListening, transcript, toggleListening, resetTranscript  } = useSpeechRecognition();

   const handleQuestionUpload = async (file) => {
    const tempImageUrl = URL.createObjectURL(file);
    setOriginalQuestionImage(tempImageUrl);
    
    // Tarayıcı hafızasından kullanıcı ID'sini oku
    const userId = localStorage.getItem('powerbug_user_id');

    if (!userId) {
      alert("Lütfen önce giriş yapın!");
      // navigate('/login'); // Kullanıcıyı login sayfasına yönlendirebilirsin
      return;
    }
    
    setIsLoading(true);
    setError(null);
    try {
      const response = await createConversation(userId, file.name);
      setConversationId(response.data.conversation_id);
      setIsSessionStarted(true); // Oturumu başlat
      console.log("Yeni sohbet oluşturuldu, ID:", response.data.conversation_id);
    } catch (err) {
      console.error("Sohbet oluşturma hatası:", err);
      setError("Yeni bir öğrenme oturumu başlatılırken hata oluştu.");
    } finally {
      setIsLoading(false);
    }
  };

  const startRecording = async () => {
  setVideoUrl(null);
  try {
    const displayStream = await navigator.mediaDevices.getDisplayMedia({
      video: { cursor: "always" },
      audio: false,
    });
    const audioStream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: false,
    });

    const combinedStream = new MediaStream([
      ...displayStream.getTracks(),
      ...audioStream.getTracks(),
    ]);
    streamRef.current = combinedStream;

    const recorder = new MediaRecorder(combinedStream);
    mediaRecorderRef.current = recorder;
    
    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        recordedChunksRef.current.push(event.data);
      }
    };

    // !!! recorder.onstop bloğu buradan tamamen SİLİNDİ !!!

    recorder.start();
    setIsRecording(true);
  } catch (err) {
    console.error("Ekran/Ses kaydı hatası:", err);
    alert("Ekran ve ses kaydı için izin vermeniz gerekmektedir.");
  }
};

  const stopRecording = () => {
  if (mediaRecorderRef.current) {
    mediaRecorderRef.current.stop(); // Bu, onstop olayını tetikleyecek
    streamRef.current.getTracks().forEach(track => track.stop());
    setIsRecording(false);
    setIsLoading(true);
  }
};

  // Bu useEffect, onstop olayını her zaman güncel state'lerle tanımlar
  useEffect(() => {
    if (!mediaRecorderRef.current) return;

    mediaRecorderRef.current.onstop = async () => {
      const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
      const url = URL.createObjectURL(blob);
      setVideoUrl(url);
      recordedChunksRef.current = [];

      if (!conversationId) {
        console.error("Sohbet ID'si bulunamadı, video gönderilemiyor.");
        setError("Sohbet oturumu bulunamadı.");
        return;
      }

      setIsLoading(true);
      setError(null);
      try {
        const voiceTranscript = transcript;

        const userMessage = { sender: 'user', text: `Video ile anlatım: ${voiceTranscript}` };
        setChatHistory(prev => [...prev, userMessage]);
        console.log("video gönderiliyor")

        const response = await sendVideoMessage(conversationId, blob, voiceTranscript);

        console.log("Video gönderildi, AI yanıtı alınıyor...");

        const aiMessage = { sender: 'ai', text: response.data.teacher_response };
        setChatHistory(prev => [...prev, aiMessage]);
        speakText(aiMessage.text);

      } catch (err) {
        console.error("Video analizi hatası:", err);
        setError("Video analizi sırasında bir hata oluştu.");
      } finally {
        setIsLoading(false);
      }
    };
    
  }, [conversationId, chatHistory, transcript, resetTranscript]);

  const handleSendTranscript = useCallback(async () => {
    if (isListening || !transcript || !conversationId) return;

    const userMessage = { sender: 'user', text: transcript };
    setChatHistory(prev => [...prev, userMessage]);

    setIsLoading(true);
    try {
      const response = await sendTextMessage(conversationId, transcript);
      const aiMessage = { sender: 'ai', text: response.data.teacher_response };
      setChatHistory(prev => [...prev, aiMessage]);
      speakText(aiMessage.text);
    } catch (err) {
      console.error("Metin analizi hatası:", err);
      setError("Mesaj gönderilirken bir hata oluştu.");
    } finally {
      setIsLoading(false);
    }
  }, [isListening, transcript, conversationId, chatHistory, resetTranscript]);

  return (
    <div className="chat-container">
      <h2 className="chat-title">Sokratik Öğrenme Alanı</h2>

      {!isSessionStarted ? (
        <div className="upload-section">
          <p className="instructions">Lütfen çözmek istediğin sorunun fotoğrafını yükle.</p>
          <ImageUploader onImageSelect={handleQuestionUpload} />
        </div>
      ) : (

        
        <div className={`session-container ${isChatOpen ? 'drawer-open' : ''}`}>
            
          <ChatDrawer 
              isOpen={isChatOpen} 
              onClose={() => setIsChatOpen(false)} 
              transcript={transcript} 
              history={chatHistory}
              isLoading={isLoading} 
              videoUrl={videoUrl}
          />

          <div className="main-area-with-question">
        
            <div className="question-display-area">
              <img src={originalQuestionImage} alt="Analiz edilecek soru" />
            </div>

            <div className="main-content">
              <TldrawCanvas />

              <div className="floating-controls">
            
                  <button 
                  onClick={() => setIsChatOpen(prevIsOpen => !prevIsOpen)} 
                  className="control-button" 
                  title={isChatOpen ? "Sohbeti Gizle" : "Sohbeti Göster"}
                  >
                    <FaCommentDots size={20} />
                  </button>

                  <button onClick={toggleListening} className="control-button mic-button" title={isListening ? 'Dinlemeyi Durdur' : 'Konuşmaya Başla'}>
                    {isListening ? <FaStop size={20} /> : <FaMicrophone size={20} />}
                  </button>

                  {!isListening && transcript && (
                    <button onClick={handleSendTranscript} className="control-button send-button" title="Konuşmayı Gönder">
                      <FaPaperPlane size={20} />
                    </button>
                  )}
                  
                  {!isRecording ? (
                    <button onClick={startRecording} className="control-button record-button" title="Kaydı Başlat">
                      <FaVideo  size={20} /> 
                    </button>
                  ) : (
                    <button onClick={stopRecording} className="control-button record-button stop" title="Kaydı Durdur">
                      <FaStop size={20} />
                    </button>
                  )}

              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ChatPage;