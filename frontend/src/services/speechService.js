const synth = window.speechSynthesis;

/**
 * Verilen metni, tarayıcının varsayılan sesiyle sesli olarak okur.
 * @param {string} textToSpeak - Seslendirilecek metin.
 */
export const speakText = (textToSpeak) => {
  if (!textToSpeak || typeof textToSpeak !== 'string') {
    console.warn('speakText: Geçersiz metin:', textToSpeak);
    return;
  }

  if (synth.speaking) {
    synth.cancel();
  }

  const utterance = new SpeechSynthesisUtterance(textToSpeak);
  utterance.lang = 'tr-TR';
  utterance.onerror = (event) => {
    console.error('Speech error:', event);
  };
  synth.speak(utterance);
};