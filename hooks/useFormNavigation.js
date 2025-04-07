import { useState, useCallback } from 'react';

const useFormNavigation = (sections = []) => {
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);

  const nextSection = useCallback(() => {
    if (currentSectionIndex < sections.length - 1) {
      setCurrentSectionIndex(prev => prev + 1);
      window.scrollTo(0, 0);
      return true;
    }
    return false;
  }, [currentSectionIndex, sections.length]);

  const previousSection = useCallback(() => {
    if (currentSectionIndex > 0) {
      setCurrentSectionIndex(prev => prev - 1);
      window.scrollTo(0, 0);
      return true;
    }
    return false;
  }, [currentSectionIndex]);

  const goToSection = useCallback((sectionName) => {
    const index = sections.indexOf(sectionName);
    if (index !== -1) {
      setCurrentSectionIndex(index);
      window.scrollTo(0, 0);
      return true;
    }
    return false;
  }, [sections]);

  return {
    currentSection: sections[currentSectionIndex],
    currentSectionIndex,
    nextSection,
    previousSection,
    goToSection,
    canGoNext: currentSectionIndex < sections.length - 1,
    canGoPrevious: currentSectionIndex > 0,
    isFirstSection: currentSectionIndex === 0,
    isLastSection: currentSectionIndex === sections.length - 1,
    totalSections: sections.length
  };
};

export default useFormNavigation; 