import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage'; 
import ChatPage from './pages/ChatPage'; 
import './App.css';

function App() {
  return (
    <div className="App">
      <Routes>
        {/* Ana sayfa için rota */}
        <Route path="/" element={<HomePage />} />

        {/* Sohbet sayfası için rota */}
        <Route path="/chat" element={<ChatPage />} />
      </Routes>
    </div>
  );
}

export default App;