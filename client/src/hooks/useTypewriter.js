import { useState, useEffect } from 'react';

export const useTypewriter = (phrases, startDelay = 1600) => {
  const [displayText, setDisplayText] = useState('');
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const currentPhrase = phrases[phraseIndex];
    
    const type = () => {
      if (!isDeleting) {
        if (charIndex < currentPhrase.length) {
          setDisplayText(currentPhrase.slice(0, charIndex + 1));
          setCharIndex(charIndex + 1);
          setTimeout(type, 72);
        } else {
          setIsDeleting(true);
          setTimeout(type, 2200);
        }
      } else {
        if (charIndex > 0) {
          setDisplayText(currentPhrase.slice(0, charIndex - 1));
          setCharIndex(charIndex - 1);
          setTimeout(type, 38);
        } else {
          setIsDeleting(false);
          setPhraseIndex((phraseIndex + 1) % phrases.length);
          setTimeout(type, 72);
        }
      }
    };

    const timer = setTimeout(type, startDelay);

    return () => clearTimeout(timer);
  }, [charIndex, isDeleting, phraseIndex, phrases, startDelay]);

  return displayText;
};
