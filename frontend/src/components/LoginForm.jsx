import React, { useState } from 'react';
import { BiLockAlt, BiEnvelope } from 'react-icons/bi'; 
import { useNavigate } from 'react-router-dom'
import { loginUser } from '../services/apiService'; 

function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const navigate = useNavigate(); 

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      // Backend'e giriş isteği gönderiyoruz
      const response = await loginUser({ email, password });

      // Backend'den başarılı bir cevap geldiyse...
      console.log('Giriş başarılı:', response.data);
      
      // Giriş başarılı olduğu için kullanıcıyı yönlendir
      navigate('/welcome');

    } catch (err) {
      // Eğer bir hata olursa (örn: şifre yanlış)
      console.error('Giriş hatası:', err.response?.data?.detail || err.message);
      setError(err.response?.data?.detail || 'E-posta veya şifre hatalı.');
    }
  };

  return (
    <div className="form-box login">
      <form onSubmit={handleSubmit}>
        <h1>Giriş Yap</h1>
        {error && <p className="error-message">{error}</p>}
        <div className="input-box">
          <input 
            type="email" 
            placeholder="E-posta" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            required 
          />
          <i className="icon"><BiEnvelope /></i> 
        </div>
        <div className="input-box">
          <input 
            type="password" 
            placeholder="Şifre" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            required 
          />
          <i className="icon"><BiLockAlt /></i> 
        </div>
        <button type="submit" className="btn">Giriş Yap</button>
      </form>
    </div>
  );
}

export default LoginForm;