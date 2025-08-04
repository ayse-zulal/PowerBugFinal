import React from 'react';

function ChatDrawer({ isOpen, onClose, transcript, videoUrl  }) {
  return (
    <div className={`chat-drawer ${isOpen ? 'open' : ''}`}>
      <div className="drawer-header">
        <h3>Sohbet Akışı</h3>
        <button onClick={onClose} className="close-button">×</button>
      </div>
      <div className="drawer-content">
        <div className="transcript-box">
          <p><strong>Öğrenci:</strong> {transcript}</p>

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