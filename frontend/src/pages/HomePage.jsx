import React from 'react';
import { Link } from 'react-router-dom';

function HomePage() {
  return (
    <div className="home-container">
      <div className="card">
        <h1 className="title">
          Sokratik YKS Koçu
        </h1>
        <p className="subtitle">
          Ezberlemeyi bırak, öğrenmeyi öğren!
        </p>
        <Link to="/chat">
          <button className="start-button">
            Hemen Başla
          </button>
        </Link>
      </div>
    </div>
  );
}

export default HomePage;