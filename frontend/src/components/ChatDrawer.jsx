import React from 'react';

function ChatDrawer({ isOpen, onClose, transcript, history = [], videoUrl, isLoading  }) {
  return (
    <div className={`chat-drawer ${isOpen ? 'open' : ''}`}>
      <div className="drawer-header">
        <h3>Sohbet Akışı</h3>
        <button onClick={onClose} className="close-button">×</button>
      </div>
      <div className="drawer-content">
        <div className="transcript-box">
          {history.map((message, index) => (
            <div key={index} className={`chat-bubble ${message.sender}`}>
              <p><strong>{message.sender === 'user' ? 'Öğrenci' : 'AI Koçu'}:</strong> {message.text}</p>
            </div>
          ))}

          {isLoading && (
            <div className="loading-indicator">
              <p>AI Koçu düşünüyor...</p>
            </div>
          )}

          {videoUrl && (
            <div className="video-player-drawer">
              <p><strong>Gönderilen Kayıt:</strong></p>
              <video src={videoUrl} controls width="100%" />
            </div>
          )}
          
        </div>
      </div>
    </div>
  );
}

export default ChatDrawer;