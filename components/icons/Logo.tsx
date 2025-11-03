
import React from 'react';

export const Logo: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <g clipPath="url(#clip0_405_2)">
      <rect width="40" height="40" rx="8" fill="currentColor"/>
      <path d="M22 13V10H14V13H11V16H14V24H11V27H14V30H22V27H25V24H22V16H25V13H22ZM22 16V24H14V16H22Z" fill="white"/>
      <path fillRule="evenodd" clipRule="evenodd" d="M11 11H7C7 14.5 9 16 9 16L11 14.5C11 14.5 9.5 13.5 11 11Z" fill="#FFC72C"/>
    </g>
    <defs>
      <clipPath id="clip0_405_2">
        <rect width="40" height="40" rx="8" fill="white"/>
      </clipPath>
    </defs>
  </svg>
);
