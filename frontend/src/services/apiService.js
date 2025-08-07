import axios from 'axios';

const API_URL = 'https://powerbugfinal.onrender.com'; 


/**
 * Yeni bir sohbet oturumu 
 * @param {number} userId - Giriş yapmış kullanıcının ID'si.
 * @param {string} title - Sohbetin başlığı (opsiyonel).
 * @returns {Promise<any>} - Oluşturulan sohbetin ID'sini içeren yanıt.
 */
export const createConversation = (userId, title = "Yeni Sokratik Oturum") => {
  console.log('API: Yeni sohbet oluşturuluyor...');
  return axios.post(`${API_URL}/conversations/`, {
    user_id: userId,
    title: title,
  });
};

/**
 * Belirli bir sohbete sadece metin mesajı gönderir.
 * @param {number} conversationId - Mevcut sohbetin ID'si.
 * @param {string} message - Kullanıcının gönderdiği metin.
 * @returns {Promise<any>} - AI'nin yanıtını içeren nesne.
 */
export const sendTextMessage = (conversationId, message) => {
  console.log(`API: Sohbet #${conversationId}'e metin gönderiliyor...`);
  return axios.post(`${API_URL}/conversations/${conversationId}/message/`, {
    message: message,
  });
};

/**
 * Belirli bir sohbete video ve metin mesajı gönderir.
 * @param {number} conversationId - Mevcut sohbetin ID'si.
 * @param {Blob} videoBlob - Kullanıcının kaydettiği video dosyası.
 * @param {string} message - Video ile birlikte gönderilen metin (kullanıcının sesi).
 * @returns {Promise<any>} - AI'nin yanıtını içeren nesne.
 */
export const sendVideoMessage = (conversationId, videoBlob, message) => {
  const formData = new FormData();
  // Backend'in beklediği anahtar isimleriyle eşleştiriyoruz:
  formData.append('video', videoBlob, 'recording.webm');
  formData.append('message', message); 

  console.log(`API: Sohbet #${conversationId}'e video gönderiliyor...`);
  return axios.post(`${API_URL}/conversations/${conversationId}/video/`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};


// --- KİMLİK DOĞRULAMA (AUTH) FONKSİYONLARI ---

/**
 * Yeni bir kullanıcı kaydı oluşturur.
 * @param {object} userData - { name, email, password } içeren nesne.
 * @returns {Promise<any>}
 */
export const registerUser = (userData) => {
  return axios.post(`${API_URL}/auth/register`, userData);
};

/**
 * Mevcut bir kullanıcıyla giriş yapar.
 * @param {object} credentials - { email, password } içeren nesne.
 * @returns {Promise<any>}
 */
export const loginUser = async ({ username, password }) => {
  const params = new URLSearchParams();
  params.append('username', username);
  params.append('password', password);

  return await axios.post(`${API_URL}/auth/login`, params, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    withCredentials: true, 
  });
};