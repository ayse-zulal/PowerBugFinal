const synth = window.speechSynthesis;

/**
 * Verilen metni, tarayıcının varsayılan sesiyle sesli olarak okur.
 * @param {string} textToSpeak - Seslendirilecek metin.
 */
export const speakText = (textToSpeak) => {
  // Eğer tarayıcıda başka bir konuşma devam ediyorsa, önce onu iptal et.
  if (synth.speaking) {
    synth.cancel();
  }

  // Konuşulacak metni ve ayarları içeren yeni bir "konuşma" nesnesi oluştur.
  const utterance = new SpeechSynthesisUtterance(textToSpeak);

  // Hata durumunda konsola bilgi yazdır.
  utterance.onerror = (event) => {
    console.error('SpeechSynthesisUtterance.onerror', event);
  };

  // Konuşma dilini Türkçe olarak ayarlayalım (en iyi sonuç için).
  utterance.lang = 'tr-TR';

  // Konuşmayı başlat.
  synth.speak(utterance);
};