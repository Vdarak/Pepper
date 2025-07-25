import React from 'react';

interface AnimatedLogoProps {
  isAnimating: boolean;
}

const AnimatedLogo: React.FC<AnimatedLogoProps> = ({ isAnimating }) => {
  const baseClasses = "font-logo text-3xl md:text-4xl font-bold uppercase tracking-wider transition-all duration-500";
  const dynamicClasses = isAnimating ? 'logo-animating' : 'text-primary';

  return (
    <h1 className={`${baseClasses} ${dynamicClasses}`}>
      Pepper
    </h1>
  );
};

export default AnimatedLogo;