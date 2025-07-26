import React, { useState } from 'react';
import ImageUploader from '../components/ImageUploader';
import { analyzeImage } from '../services/apiService'; 

function ChatPage() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false); 
  const [error, setError] = useState(null); 
  const [chatHistory, setChatHistory] = useState([]); 

  const handleFileSelect = async (file) => {
    setSelectedFile(file);
    setIsLoading(true); 
    setError(null); 

    try {
      const response = await analyzeImage(file);
      
      console.log('API yanıtı:', response.data);
      
      setChatHistory([response.data]);

    } catch (err) {
      console.error('API hatası:', err);
      setError('Sorun analiz edilirken bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setIsLoading(false); 
    }
  };
  
  return (
    <div>
      <h2>Sohbet Ekranı</h2>
      
      {!selectedFile && !isLoading && (
         <ImageUploader onImageSelect={handleFileSelect} />
      )}

      {isLoading && (
        <div>
          <h3>Harika! Sorun analiz ediliyor, lütfen bekle...</h3>
          {/* Buraya güzel bir loading spinner eklenebilir */}
        </div>
      )}

      {error && <p style={{ color: 'red' }}>{error}</p>}

      {chatHistory.length > 0 && (
        <div>
          <h3>İşte sohbetimiz:</h3>
          {/* Buraya sohbet baloncukları gelecek */}
          <pre>{JSON.stringify(chatHistory, null, 2)}</pre>
        </div>
      )}

    </div>
  );
}

export default ChatPage;