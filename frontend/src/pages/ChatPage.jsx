import React, { useState } from 'react';
import ImageUploader from '../components/ImageUploader'; 

function ChatPage() {
  const [selectedFile, setSelectedFile] = useState(null);

  const handleFileSelect = (file) => {
    console.log("ChatPage'e gelen dosya:", file); 
    setSelectedFile(file);
  };

  return (
    <div>
      <h2>Sohbet Ekranı</h2>
      
      {/* Eğer henüz bir dosya seçilmediyse, ImageUploader ı göster */}
      {!selectedFile && (
         <ImageUploader onImageSelect={handleFileSelect} />
      )}

      {/* Eğer bir dosya seçildiyse, bir sonraki adıma geç*/}
      {selectedFile && (
        <div>
          <h3>Harika! Sorun analiz ediliyor...</h3>
          {/* Buraya sohbet baloncukları gelecek */}
        </div>
      )}

    </div>
  );
}

export default ChatPage;