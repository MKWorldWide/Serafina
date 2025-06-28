import React from 'react';

/**
 * Interface for LoadingSpinner props
 */
interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  text?: string;
  className?: string;
}

/**
 * LoadingSpinner component to display a loading indicator.
 * Used as a fallback for Suspense and lazy-loaded components.
 * 
 * Features:
 * - Customizable size options
 * - Accessible loading text
 * - Responsive design
 * - Custom styling support
 * 
 * @param props - Component props
 * @returns Loading spinner component
 */
const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'medium', 
  text = 'Loading...',
  className = ''
}) => {
  // Size classes for different spinner sizes
  const sizeClasses = {
    small: 'w-4 h-4',
    medium: 'w-8 h-8',
    large: 'w-12 h-12'
  };

  return (
    <div 
      className={`flex justify-center items-center min-h-screen ${className}`}
      role="status"
      aria-live="polite"
      aria-label={text}
    >
      <div className="flex flex-col items-center space-y-4">
        {/* Spinner animation */}
        <div 
          className={`${sizeClasses[size]} border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin`}
          role="status"
          aria-hidden="true"
        />
        
        {/* Loading text */}
        <p className="text-gray-600 text-sm font-medium">
          {text}
        </p>
        
        {/* Screen reader only text */}
        <span className="sr-only">
          {text}
        </span>
      </div>
    </div>
  );
};

export default LoadingSpinner; 