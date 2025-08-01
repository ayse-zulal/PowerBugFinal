import React, { useState, useRef } from 'react';

import ImageUploader from '../components/ImageUploader'; 
import Whiteboard from '../components/Whiteboard';

function ChatPage() {

  const [originalQuestionImage, setOriginalQuestionImage] = useState(null);
  const [isSessionStarted, setIsSessionStarted] = useState(false);

  const canvasRef = useRef(null);
  
  const handleQuestionUpload = (file) => {
 
    console.log("Yüklenen soru dosyası:", file);
    
    // Geçici: Dosyanın bir URL'ini oluşturalım ki Whiteboard'da gösterelim
    const tempImageUrl = URL.createObjectURL(file);
    setOriginalQuestionImage(tempImageUrl);
    setIsSessionStarted(true);
  };

  const eraseMode = () => {
    // canvasRef üzerinden tuvalin silgi moduna geçmesini sağlıyoruz.
    canvasRef.current?.eraseMode(true); 
  };

  const drawMode = () => {
    // Tuvalin çizim moduna geri dönmesini sağlıyoruz.
    canvasRef.current?.eraseMode(false);
  };

  const undo = () => {
    // Son yapılan işlemi geri al
    canvasRef.current?.undo();
  };

  const redo = () => {
    // Geri alınan işlemi ileri al
    canvasRef.current?.redo();
  };
  
  const clearAll = () => {
    // Tüm çizimleri temizle
    canvasRef.current?.clearCanvas();
  };

  return (
    <div className="chat-container">
      <h2 className="chat-title">Sokratik Öğrenme Alanı</h2>

      {/* Eğer oturum henüz başlamadıysa, soru yükleme ekranını göster */}
      {!isSessionStarted ? (
        <div className="upload-section">
          <p className="instructions">Lütfen çözmek istediğin sorunun fotoğrafını yükle.</p>
          <ImageUploader onImageSelect={handleQuestionUpload} />
        </div>
      ) : (
        
        <div className="whiteboard-session">
          <div className="toolbar">
            {/* YENİ ARAÇ KUTUSU BUTONLARI */}
            <button onClick={drawMode} className="tool-button">Kalem</button>
            <button onClick={eraseMode} className="tool-button">Silgi</button>
            <button onClick={undo} className="tool-button">Geri Al</button>
            <button onClick={redo} className="tool-button">İleri Al</button>
            <button onClick={clearAll} className="tool-button clear-button">Tümünü Temizle</button>
          </div>
          <div className="whiteboard-area">
            <Whiteboard 
              // "Uzaktan kumandamızı" Whiteboard'a prop olarak yolluyoruz.
              ref={canvasRef} 
              width="100%" 
              height="500px" 
              backgroundImage={originalQuestionImage}
            />
          </div>
        </div>


      )}
    </div>
  );
}

export default ChatPage;