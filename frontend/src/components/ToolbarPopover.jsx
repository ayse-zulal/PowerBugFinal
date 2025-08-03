import React, { useState, useRef, useEffect } from 'react';

function ToolbarPopover({ icon, children }) {
  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef(null);

  // Dışarıya tıklandığında menüyü kapatmak için
  useEffect(() => {
    function handleClickOutside(event) {
      if (popoverRef.current && !popoverRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [popoverRef]);

  return (
    <div className="popover-container" ref={popoverRef}>
      <button onClick={() => setIsOpen(!isOpen)} className="tool-button">
        {icon}
      </button>
      {isOpen && (
        <div className="popover-menu">
          {children}
        </div>
      )}
    </div>
  );
}

export default ToolbarPopover;