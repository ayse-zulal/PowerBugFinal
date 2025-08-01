import React, { useRef } from 'react';

// Bu bileşenin tek görevi, bir dosya seçtirmek ve seçilen dosyayı bildirmektir.
function ImageUploader({ onImageSelect }) {
  const fileInputRef = useRef(null);

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      onImageSelect(file);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current.click();
  };

  return (
    <>
      {/* Gizli dosya input'u, işin tüm mantığını yapar */}
      <input
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        ref={fileInputRef}
        onChange={handleImageChange}
      />

      {/* Kullanıcının göreceği tek şey bu buton olacak */}
      <button onClick={handleUploadClick} className="button-primary">
        Soru Fotoğrafını Yükle
      </button>
    </>
  );
}

export default ImageUploader;