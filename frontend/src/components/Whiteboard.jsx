import React, { forwardRef } from 'react';
import { ReactSketchCanvas } from 'react-sketch-canvas';

const containerStyle = {
  position: 'relative', 
  width: '100%',
  border: '2px dashed #a0aec0',
  borderRadius: '0.5rem',
  overflow: 'hidden', 
};


const backgroundImageStyle = {
  position: 'absolute', 
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  objectFit: 'contain',         
  objectPosition: 'top left',     
  opacity: 0.6,                   
  pointerEvents: 'none',         
};

const Whiteboard = forwardRef(
  ({ width, height, backgroundImage, strokeColor, strokeWidth }, ref) => {
    return (
      
      <div style={{ ...containerStyle, width, height }}>
        
        {backgroundImage && (
          <img 
            src={backgroundImage} 
            style={backgroundImageStyle} 
            alt="Soru Arka Planı" 
          />
        )}

        <ReactSketchCanvas
          ref={ref}
          style={{ background: 'transparent' }}
          width={width}
          height={height}
          strokeWidth={strokeWidth}
          strokeColor={strokeColor} 
        />
      </div>
    );
  }
);

export default Whiteboard;