import React from 'react';

function ChatDrawer({ isOpen, onClose, transcript  }) {
  return (
    <div className={`chat-drawer ${isOpen ? 'open' : ''}`}>
      <div className="drawer-header">
        <h3>Sohbet Akışı</h3>
        <button onClick={onClose} className="close-button">×</button>
      </div>
      <div className="drawer-content">
        <div className="transcript-box">
          <p><strong>Öğrenci:</strong> {transcript}</p>
        </div>
      </div>
    </div>
  );
}

export default ChatDrawer;