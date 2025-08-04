import React, { useState, useRef, useEffect } from 'react';

import { 
  FaPencilAlt, 
  FaEraser, 
  FaUndo, 
  FaRedo, 
  FaTrash, 
  FaCommentDots, 
  FaMicrophone, 
  FaStop 
} from "react-icons/fa";

import ImageUploader from '../components/ImageUploader'; 
import Whiteboard from '../components/Whiteboard';
import ToolbarPopover from '../components/ToolbarPopover';
import ChatDrawer from '../components/ChatDrawer';

import { useSpeechRecognition } from '../hooks/useSpeechRecognition';

function ChatPage() {
  
  const [originalQuestionImage, setOriginalQuestionImage] = useState(null);
  const [isSessionStarted, setIsSessionStarted] = useState(false);
  const [strokeColor, setStrokeColor] = useState('black'); 
  const [strokeWidth, setStrokeWidth] = useState(4);
  const canvasRef = useRef(null);
  const [isChatOpen, setIsChatOpen] = useState(false);

  const [isRecording, setIsRecording] = useState(false);
  const [videoUrl, setVideoUrl] = useState(null);

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

    recorder.onstop = () => {
      const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
      const url = URL.createObjectURL(blob);
      setVideoUrl(url); // Kaydedilen videoyu göstermek için URL'i state'e ata
      recordedChunksRef.current = [];
      
      console.log("Kaydedilen video Blob'u:", blob);
      // sendVideoToBackend(blob);
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

  const eraseMode = () => { canvasRef.current?.eraseMode(true); };
  const drawMode = () => { canvasRef.current?.eraseMode(false); };
  const undo = () => { canvasRef.current?.undo(); };
  const redo = () => { canvasRef.current?.redo(); };
  const clearAll = () => { canvasRef.current?.clearCanvas(); };

  const changeColor = (color) => {
    setStrokeColor(color);
    canvasRef.current?.eraseMode(false);
    canvasRef.current?.setState({ strokeColor: color });
  };

  const changeStrokeWidth = (width) => {
    setStrokeWidth(width);
    canvasRef.current?.setState({ strokeWidth: width });
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
        <div className="session-container">
          
          <ChatDrawer 
            isOpen={isChatOpen} 
            onClose={() => setIsChatOpen(false)} 
            transcript={transcript} 
            videoUrl={videoUrl}
          />

          <div className="main-content">
            <div className="toolbar">
              <ToolbarPopover icon={<FaPencilAlt size={20} />}>
                <div className="tool-section vertical">
                  <label>Renk</label>
                  <div className="color-palette">
                    <div className="color-picker-box" style={{ backgroundColor: 'black' }} onClick={() => changeColor('black')} />
                    <div className="color-picker-box" style={{ backgroundColor: '#e53e3e' }} onClick={() => changeColor('#e53e3e')} />
                    <div className="color-picker-box" style={{ backgroundColor: '#3182ce' }} onClick={() => changeColor('#3182ce')} />
                  </div>
                </div>
                 <div className="tool-section vertical">
                   <label>Kalınlık</label>
                   <input 
                     type="range" 
                     min="1" 
                     max="20" 
                     value={strokeWidth} 
                     onChange={(e) => changeStrokeWidth(e.target.value)}
                     className="stroke-slider"
                   />
                 </div>
              </ToolbarPopover>

              <button onClick={eraseMode} className="tool-button" title="Silgi">
                <FaEraser size={20} />
              </button>
              <button onClick={undo} className="tool-button" title="Geri Al">
                <FaUndo size={20} />
              </button>
              <button onClick={redo} className="tool-button" title="İleri Al">
                <FaRedo size={20} />
              </button>
              <button onClick={clearAll} className="tool-button clear-button" title="Tümünü Temizle">
                <FaTrash size={20} />
              </button>

              <button onClick={() => setIsChatOpen(true)} className="tool-button" title="Sohbeti Göster">
                <FaCommentDots size={20} />
              </button>

              <button onClick={toggleListening} className="tool-button mic-button-toolbar" title={isListening ? 'Dinlemeyi Durdur' : 'Konuşmaya Başla'}>
                {isListening ? <FaStop size={20} /> : <FaMicrophone size={20} />}
              </button>
              
              {!isRecording ? (
                <button onClick={startRecording} className="tool-button record-button-start" title="Kaydı Başlat">
                  <FaMicrophone size={20} /> {/* Veya bir "kayıt" ikonu */}
                </button>
              ) : (
                <button onClick={stopRecording} className="tool-button record-button-stop" title="Kaydı Durdur">
                  <FaStop size={20} />
                </button>
              )}

            </div>

            <div className="whiteboard-area">
              <Whiteboard 
                ref={canvasRef} 
                width="100%" 
                height="500px" 
                backgroundImage={originalQuestionImage}
                strokeColor={strokeColor}
                strokeWidth={strokeWidth}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ChatPage;