// frontend/src/pages/AuthPage.jsx
import React, { useState } from 'react';
import LoginForm from '../components/LoginForm';
import RegisterForm from '../components/RegisterForm';
import './AuthPage.css'; // Bu sayfaya özel CSS dosyamız

function AuthPage() {
  const [isActive, setIsActive] = useState(false);

  return (
    <div className="auth-body">
      <div className={`container ${isActive ? 'active' : ''}`}>
        <LoginForm />
        <RegisterForm />
        
        <div className="toggle-box">
          <div className="toggle-panel toggle-left">
            <h1>Tekrar Hoş Geldin!</h1>
            <p>Hesabınla giriş yaparak öğrenme yolculuğuna devam et.</p>
            <button className="btn" onClick={() => setIsActive(false)}>Giriş Yap</button>
          </div>
          <div className="toggle-panel toggle-right">
            <h1>Merhaba!</h1>
            <p>Hesabın yok mu? Hemen kaydol ve öğrenmeye başla.</p>
            <button className="btn" onClick={() => setIsActive(true)}>Kaydol</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AuthPage;