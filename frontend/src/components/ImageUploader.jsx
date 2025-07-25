import React, { useState, useRef } from 'react';
function ImageUploader({ onImageSelect }) {
  const [preview, setPreview] = useState(null);
  const fileInputRef = useRef(null);
  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      onImageSelect(file);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current.click();
  };

  return (
    <div className="uploader-container">
      <input
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        ref={fileInputRef}
        onChange={handleImageChange}
      />
      
      {/* Eğer bir resim seçilmediyse, butonu göster */}
      {!preview && (
        <button onClick={handleUploadClick} className="upload-button">
          Soru Fotoğrafını Yükle
        </button>
      )}

      {/* Eğer bir resim seçildiyse, önizlemesini göster */}
      {preview && (
        <div className="image-preview">
          <img src={preview} alt="Soru Önizlemesi" style={{ maxWidth: '300px', maxHeight: '300px' }} />
        </div>
      )}
    </div>
  );
}
export default ImageUploader;