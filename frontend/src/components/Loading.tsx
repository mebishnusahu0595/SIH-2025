'use client';

import React from 'react';

const Loading: React.FC = () => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-md">
      <div className="glass-effect rounded-2xl p-8 flex flex-col items-center space-y-6 max-w-sm mx-4">
        {/* Butterfly Icon */}
        <div className="relative">
          <svg
            width="80"
            height="80"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="animate-pulse"
          >
            {/* Butterfly body */}
            <ellipse cx="12" cy="12" rx="1" ry="8" fill="#000000" />
            {/* Left wing upper */}
            <path
              d="M12 4 C8 2, 4 4, 2 8 C4 6, 8 4, 12 4 Z"
              fill="#000000"
              opacity="0.8"
            />
            {/* Left wing lower */}
            <path
              d="M12 4 C8 6, 4 10, 2 16 C4 14, 8 12, 12 4 Z"
              fill="#000000"
              opacity="0.6"
            />
            {/* Right wing upper */}
            <path
              d="M12 4 C16 2, 20 4, 22 8 C20 6, 16 4, 12 4 Z"
              fill="#000000"
              opacity="0.8"
            />
            {/* Right wing lower */}
            <path
              d="M12 4 C16 6, 20 10, 22 16 C20 14, 16 12, 12 4 Z"
              fill="#000000"
              opacity="0.6"
            />
            {/* Wing details */}
            <circle cx="6" cy="6" r="0.5" fill="#000000" />
            <circle cx="18" cy="6" r="0.5" fill="#000000" />
            <circle cx="5" cy="12" r="0.3" fill="#000000" />
            <circle cx="19" cy="12" r="0.3" fill="#000000" />
          </svg>
        </div>

        {/* Heart Icon */}
        <div className="relative">
          <svg
            width="60"
            height="60"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="animate-bounce"
          >
            <path
              d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
              fill="#000000"
            />
          </svg>
        </div>

        {/* Loading Text */}
        <div className="text-center space-y-2">
          <h2 className="text-xl font-semibold text-gray-800 notable-font">
            MindSupport
          </h2>
          <p className="text-sm text-gray-600 animate-pulse">
            Loading your safe space...
          </p>
        </div>

        {/* Loading Dots */}
        <div className="flex space-x-2">
          <div className="w-2 h-2 bg-gray-800 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-2 h-2 bg-gray-800 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-2 h-2 bg-gray-800 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
      </div>
    </div>
  );
};

export default Loading;