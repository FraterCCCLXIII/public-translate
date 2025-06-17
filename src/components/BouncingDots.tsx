import React from 'react';

interface BouncingDotsProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  color?: string;
}

const BouncingDots: React.FC<BouncingDotsProps> = ({ 
  className = '', 
  size = 'md',
  color = 'text-gray-400'
}) => {
  const sizeClasses = {
    sm: 'w-1 h-1',
    md: 'w-1.5 h-1.5', 
    lg: 'w-2 h-2'
  };

  const animationDelays = {
    sm: ['animate-bounce', 'animate-bounce [animation-delay:-0.3s]', 'animate-bounce [animation-delay:-0.15s]'],
    md: ['animate-bounce', 'animate-bounce [animation-delay:-0.3s]', 'animate-bounce [animation-delay:-0.15s]'],
    lg: ['animate-bounce', 'animate-bounce [animation-delay:-0.3s]', 'animate-bounce [animation-delay:-0.15s]']
  };

  return (
    <div className={`flex space-x-1 ${className}`}>
      {[0, 1, 2].map((index) => (
        <div
          key={index}
          className={`${sizeClasses[size]} ${color} rounded-full ${animationDelays[size][index]}`}
        />
      ))}
    </div>
  );
};

export default BouncingDots; 