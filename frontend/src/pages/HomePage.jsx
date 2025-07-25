import React from 'react';
import { Link } from 'react-router-dom'; 

function HomePage() {
  return (
    <div>
      <h1>Sokratik YKS Koçu</h1>
      <p>Ezberlemeyi bırak, öğrenmeyi öğren!</p>
      <Link to="/chat">
        <button>Hemen Başla</button>
      </Link>
    </div>
  );
}

export default HomePage;