import { useState, useEffect, useRef } from 'react';

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
let recognition; 

if (SpeechRecognition) {
  recognition = new SpeechRecognition();
  recognition.continuous = true;
  recognition.interimResults = true;
  recognition.lang = 'tr-TR';
}

export const useSpeechRecognition = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  
  const listeningRef = useRef(false);

  useEffect(() => {
   
    if (!SpeechRecognition) {
      return;
    }

    recognition.onstart = () => {
      console.log('Ses tanıma BAŞLADI.');
      listeningRef.current = true;
      setIsListening(true);
    };

    recognition.onend = () => {
      console.log('Ses tanıma DURDU.');
     
      if (listeningRef.current) {
       
        console.log('Beklenmedik durma, yeniden başlatılıyor...');
        recognition.start();
      } else {
        
        setIsListening(false);
      }
    };

    recognition.onresult = (event) => {
      let finalTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript + ' ';
        }
      }
      if (finalTranscript) {
         setTranscript(prev => prev + finalTranscript);
      }
    };

    recognition.onerror = (event) => {
      console.error('Ses tanıma hatası:', event.error);
    };

    return () => {
      listeningRef.current = false;
      recognition.stop();
    };
  }, []); 

  const toggleListening = () => {
    if (!SpeechRecognition) {
      alert("Üzgünüz, tarayıcınız ses tanımayı desteklemiyor.");
      return;
    }

    if (isListening) {
      console.log('Kullanıcı durdurmak istedi.');
      listeningRef.current = false; 
      recognition.stop();
    } else {
      console.log('Kullanıcı başlatmak istedi.');
      setTranscript(''); 
      recognition.start();
    }
  };

  return { isListening, transcript, toggleListening, hasSpeechRecognitionSupport: !!SpeechRecognition };
};