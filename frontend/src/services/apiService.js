import axios from 'axios';

const API_URL = 'http://localhost:8000'; 

/**
 * @param {File} imageFile 
 * @returns {Promise<any>} 
 */
export const analyzeImage = (imageFile) => {
  const formData = new FormData();
  formData.append('file', imageFile); //file anaktarı

  console.log('API servisi: Resim backend\'e gönderiliyor...');

  // POST isteği
  return axios.post(`${API_URL}/analyze-question`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};


// Sadece Metin Göndermek İçin
export const analyzeTextInteraction = (transcript, history) => {
  console.log('API\'ye gönderiliyor: sadece metin ve sohbet geçmişi');
  // Backend'ci arkadaşınla endpoint adı ve veri yapısı konusunda anlaş:
  return axios.post(`${API_URL}/analyze-text`, {
    transcript: transcript,
    history: history,
  });
};

/**
 * Kullanıcının video kaydını ve mevcut sohbet geçmişini analiz için backend'e gönderir.
 * @param {Blob} videoBlob - Kullanıcının kaydettiği video dosyası.
 * @param {Array} history - Mevcut sohbet geçmişi.
 * @returns {Promise<any>} - API'den dönen güncellenmiş sohbet geçmişi.
 */

export const analyzeInteraction = (videoBlob, history) => {
  const formData = new FormData();
  formData.append('video', videoBlob, 'recording.webm'); // Dosyaya bir isim verelim
  formData.append('history', JSON.stringify(history)); // Geçmişi JSON metnine çevirip yolla

  console.log('API ye gönderiliyor: video ve sohbet geçmişi');
  
  //endpoint adını teyit et.
  return axios.post(`${API_URL}/analyze-video`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

export const registerUser = (userData) => {
  // userData{ name, email, password } gibi mi
  return axios.post(`${API_URL}/auth/register`, userData);
};


export const loginUser = (credentials) => {
  // credentials { email, password } gibi mi?
  return axios.post(`${API_URL}/auth/login`, credentials);
};