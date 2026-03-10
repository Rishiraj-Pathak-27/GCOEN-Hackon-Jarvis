import { useRef, useEffect, useState } from 'react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(useGSAP);

const SplitText = ({
  text,
  className = '',
  delay = 50,
  duration = 1.25,
  ease = 'power3.out',
  splitType = 'chars',
  from = { opacity: 0, y: 40 },
  to = { opacity: 1, y: 0 },
  threshold = 0.1,
  rootMargin = '-100px',
  textAlign = 'center',
  tag = 'p',
  onLetterAnimationComplete
}) => {
  const ref = useRef(null);
  const animationCompletedRef = useRef(false);
  const onCompleteRef = useRef(onLetterAnimationComplete);
  const [isVisible, setIsVisible] = useState(false);

  // Keep callback ref updated
  useEffect(() => {
    onCompleteRef.current = onLetterAnimationComplete;
  }, [onLetterAnimationComplete]);

  // Intersection Observer for visibility
  useEffect(() => {
    if (!ref.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !animationCompletedRef.current) {
            setIsVisible(true);
          }
        });
      },
      { threshold, rootMargin }
    );

    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [threshold, rootMargin]);

  // Split text into elements
  const splitTextIntoElements = (text, type) => {
    if (type === 'chars') {
      return text.split('').map((char, i) => (
        <span key={i} className="split-char" style={{ display: 'inline-block' }}>
          {char === ' ' ? '\u00A0' : char}
        </span>
      ));
    } else if (type === 'words') {
      return text.split(' ').map((word, i) => (
        <span key={i} className="split-word" style={{ display: 'inline-block', marginRight: '0.25em' }}>
          {word}
        </span>
      ));
    }
    return text;
  };

  useGSAP(
    () => {
      if (!ref.current || !isVisible || animationCompletedRef.current) return;

      const targets = ref.current.querySelectorAll(
        splitType === 'chars' ? '.split-char' : '.split-word'
      );

      if (targets.length === 0) return;

      gsap.fromTo(
        targets,
        { ...from },
        {
          ...to,
          duration,
          ease,
          stagger: delay / 1000,
          onComplete: () => {
            animationCompletedRef.current = true;
            onCompleteRef.current?.();
          },
          willChange: 'transform, opacity',
          force3D: true
        }
      );
    },
    {
      dependencies: [isVisible, text, delay, duration, ease, splitType, JSON.stringify(from), JSON.stringify(to)],
      scope: ref
    }
  );

  const Tag = tag || 'p';

  return (
    <Tag
      ref={ref}
      className={`split-parent ${className}`}
      style={{
        textAlign,
        overflow: 'hidden',
        display: 'inline-block',
        whiteSpace: 'normal',
        wordWrap: 'break-word',
        willChange: 'transform, opacity'
      }}
    >
      {splitTextIntoElements(text, splitType)}
    </Tag>
  );
};

export default SplitText;
