import React, { useState } from 'react';
import { ReactComponent as ArrowUpwardIcon } from './icons/arrow-upward.svg';

const BackToTopButton = () => {
  const [isVisible, setIsVisible] = useState(false);

  const handleScroll = () => {
    const scrollTop = document.documentElement.scrollTop;
    setIsVisible(scrollTop > 800); // Show the button when scrolling down 300px or more
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  // Listen for scroll events
  window.addEventListener('scroll', handleScroll);

  return (
    <button
      className={`vkw-back-to-top-button ${isVisible ? 'visible' : ''}`}
      onClick={scrollToTop}
    >
      <ArrowUpwardIcon />
    </button>
  );
};

export default BackToTopButton;
