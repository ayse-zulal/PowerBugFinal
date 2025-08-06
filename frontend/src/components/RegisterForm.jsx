import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { registerUser } from '../services/apiService';

function RegisterForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null); 
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    //Backend'e register isteği (axios)
    setError(null);
    
    try {
      const response = await registerUser({ name, email, password });

      console.log('Kayıt başarılı:', response.data);
      navigate('/welcome'); 

    } catch (err) {
      console.error('Kayıt hatası:', err.response?.data?.detail || err.message);
      setError(err.response?.data?.detail || 'Bir hata oluştu. Lütfen tekrar deneyin.');
    }
  };

  return (
    <div className="form-box register">
      <form onSubmit={handleSubmit}>
        <h1>Kayıt Ol</h1>
        {error && <p className="error-message">{error}</p>} 
        <div className="input-box">
          <input type="text" placeholder="İsim" value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div className="input-box">
          <input type="email" placeholder="E-posta" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div className="input-box">
          <input type="password" placeholder="Şifre" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        <button type="submit" className="btn">Kaydol</button>
      </form>
    </div>
  );
}

export default RegisterForm;