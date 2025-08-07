import React, { useState, useRef, useEffect } from 'react';

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
import { analyzeTextInteraction, analyzeInteraction } from '../services/apiService';
import { speakText } from '../services/speechService';

function ChatPage() {
  
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
  
  const { isListening, transcript, toggleListening } = useSpeechRecognition();

  const handleQuestionUpload = (file) => {
    const tempImageUrl = URL.createObjectURL(file);
    setOriginalQuestionImage(tempImageUrl);
    setIsSessionStarted(true);
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

    recorder.onstop = async  () => {
      const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
      const url = URL.createObjectURL(blob);
      setVideoUrl(url); // Kaydedilen videoyu göstermek için URL'i state'e ata
      recordedChunksRef.current = [];
      
      console.log("Kaydedilen video Blob'u:", blob);
      // sendVideoToBackend(blob);

       setIsLoading(true); // Yüklenme durumunu başlat (yeni state)
      setError(null);

      try {
        const response = await analyzeInteraction(blob, chatHistory);
        // API'den dönen GÜNCEL sohbet geçmişiyle state'i tamamen değiştir
        setChatHistory(response.data.history);

        // Cevap geldiğinde, son mesajı bul ve seslendir.
        const aiResponse = response.data.history.find(msg => msg.sender === 'ai');
        if (aiResponse) {
          speakText(aiResponse.text);
        }

      } catch (err) {
        console.error("Analiz hatası:", err);
        setError("Analiz sırasında bir hata oluştu.");
      } finally {
        setIsLoading(false); // Yüklenme durumunu bitir
      }
    };

    recorder.start();
    setIsRecording(true);
  } catch (err) {
    console.error("Ekran/Ses kaydı hatası:", err);
    alert("Ekran ve ses kaydı için izin vermeniz gerekmektedir.");
  }
};

  const stopRecording = () => {
  if (mediaRecorderRef.current) {
    mediaRecorderRef.current.stop();
    streamRef.current.getTracks().forEach(track => track.stop());
    setIsRecording(false);
  }
};

  const handleSendTranscript = async () => {
  // Sadece dinleme durduğunda ve metin varsa gönder
  if (isListening || !transcript) return; 

  const userMessage = { sender: 'user', text: transcript };
  // Optimistic UI: Kullanıcının mesajını hemen göster
  const newHistory = [...chatHistory, userMessage];
  setChatHistory(newHistory);

  try {
    // analyzeTextInteraction fonksiyonunu burada çağırıyoruz
    const response = await analyzeTextInteraction(transcript, chatHistory);
    // Backend'den gelen güncel geçmişle state'i güncelle
    setChatHistory(response.data.history);

    // Cevap geldiğinde, son mesajı bul ve seslendir.
    const aiResponse = response.data.history.find(msg => msg.sender === 'ai');
    if (aiResponse) {
      speakText(aiResponse.text);
    }

  } catch (err) {
    console.error("Metin analizi hatası:", err);
    // Hata durumunda kullanıcıya bilgi ver
    // setError("Mesajınız gönderilirken bir hata oluştu.");
  }
};

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