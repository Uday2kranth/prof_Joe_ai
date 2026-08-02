import { useState, useEffect } from 'react';

export function useTypewriterPlaceholder(
  prompts: string[],
  speed = 60,
  deleteSpeed = 30,
  delayBetweenPrompts = 2200,
  enabled = true
): string {
  const [currentPromptIndex, setCurrentPromptIndex] = useState(0);
  const [displayText, setDisplayText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!enabled || !prompts || prompts.length === 0) return;

    const fullPrompt = prompts[currentPromptIndex];

    const timer = setTimeout(() => {
      if (!isDeleting) {
        setDisplayText(fullPrompt.slice(0, displayText.length + 1));
        if (displayText === fullPrompt) {
          setTimeout(() => setIsDeleting(true), delayBetweenPrompts);
        }
      } else {
        setDisplayText(fullPrompt.slice(0, displayText.length - 1));
        if (displayText === '') {
          setIsDeleting(false);
          setCurrentPromptIndex((prev) => (prev + 1) % prompts.length);
        }
      }
    }, isDeleting ? deleteSpeed : speed);

    return () => clearTimeout(timer);
  }, [enabled, displayText, isDeleting, currentPromptIndex, prompts, speed, deleteSpeed, delayBetweenPrompts]);

  return (enabled && displayText) ? `${displayText} |` : '';
}
