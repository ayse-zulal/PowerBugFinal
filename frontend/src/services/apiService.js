import axios from 'axios';

const API_URL = 'http://localhost:5000'; 

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