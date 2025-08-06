import { Routes, Route } from 'react-router-dom';
import AuthPage from './pages/AuthPage';
import HomePage from './pages/HomePage'; 
import ChatPage from './pages/ChatPage'; 
import './App.css';

/*
function App() {
  return (
    <div className="App">
      <Routes>
        {/* Ana sayfa için rota }
        <Route path="/" element={<HomePage />} />

        {/* Sohbet sayfası için rota }
        <Route path="/chat" element={<ChatPage />} />
      </Routes>
    </div>
  );
}*/

function App() {
  return (
    <Routes>
      <Route path="/" element={<AuthPage />} /> {/* Ana sayfa artık AuthPage */}
      {/* HomePage'i farklı bir yola taşıyabiliriz, mesela /welcome */}
      <Route path="/welcome" element={<HomePage />} /> 
      <Route path="/chat" element={<ChatPage />} />
    </Routes>
  );
}

export default App;