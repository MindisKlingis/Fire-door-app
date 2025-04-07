import React, { useEffect, useState } from 'react';
import './ThemeSwitcher.css';

type Theme = 'light' | 'dark' | 'eye-comfort';

export const ThemeSwitcher = () => {
  const [currentTheme, setCurrentTheme] = useState<Theme>(() => {
    const savedTheme = localStorage.getItem('theme') as Theme;
    return savedTheme || 'light';
  });

  useEffect(() => {
    // Remove any existing theme classes
    document.documentElement.classList.remove('theme-light', 'theme-dark', 'theme-eye-comfort');
    // Add the new theme class
    document.documentElement.classList.add(`theme-${currentTheme}`);
    // Store the theme preference
    localStorage.setItem('theme', currentTheme);
  }, [currentTheme]);

  return (
    <div className="theme-switcher glass">
      <button
        className={`theme-button ${currentTheme === 'light' ? 'active' : ''}`}
        onClick={() => setCurrentTheme('light')}
        aria-label="Light theme"
      >
        🌞
      </button>
      <button
        className={`theme-button ${currentTheme === 'dark' ? 'active' : ''}`}
        onClick={() => setCurrentTheme('dark')}
        aria-label="Dark theme"
      >
        🌙
      </button>
      <button
        className={`theme-button ${currentTheme === 'eye-comfort' ? 'active' : ''}`}
        onClick={() => setCurrentTheme('eye-comfort')}
        aria-label="Eye comfort theme"
      >
        👁️
      </button>
    </div>
  );
}; 