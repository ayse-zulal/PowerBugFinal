// frontend/src/components/Whiteboard.jsx (SON VE KESİN HALİ)
import React, { forwardRef } from 'react';
import { ReactSketchCanvas } from 'react-sketch-canvas';

// Ana kapsayıcının stili. Bu, hem resmi hem de tuvali içerecek.
const containerStyle = {
  position: 'relative', // İçindeki elemanları konumlandırmak için zorunlu
  width: '100%',
  border: '2px dashed #a0aec0',
  borderRadius: '0.5rem',
  overflow: 'hidden', // Taşan kısımları gizle
};

// Arka plan resminin stili
const backgroundImageStyle = {
  position: 'absolute', // Tuvalin tam arkasında duracak
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  objectFit: 'contain',         // İSTEK: Boyut oranını koru
  objectPosition: 'top left',     // İSTEK: Sol üste hizala
  opacity: 0.6,                   // İSTEK: Saydam yap
  pointerEvents: 'none',          // Tıklamaları engellemesin
};

const Whiteboard = forwardRef(
  ({ width, height, backgroundImage }, ref) => {
    return (
      // Ana kapsayıcı div
      <div style={{ ...containerStyle, width, height }}>
        
        {/* Katman 1: Arka Plan Resmi (Bizim Kontrolümüzde) */}
        {backgroundImage && (
          <img 
            src={backgroundImage} 
            style={backgroundImageStyle} 
            alt="Soru Arka Planı" 
          />
        )}

        {/* Katman 2: Çizim Tuvali (Tamamen Şeffaf) */}
        <ReactSketchCanvas
          ref={ref}
          // Tuvalin kendisi şeffaf olacak ve çerçevesi olmayacak
          // Çerçeveyi artık dıştaki div sağlıyor
          style={{ background: 'transparent' }}
          width={width}
          height={height}
          strokeWidth={4}
          strokeColor="black"
        />
      </div>
    );
  }
);

export default Whiteboard;