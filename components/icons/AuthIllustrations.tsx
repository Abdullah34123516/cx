import React from 'react';

export const PhoneIllustration: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg viewBox="0 0 100 100" {...props}>
    <g transform="translate(5, 5)">
      <rect width="90" height="90" rx="45" fill="#e0f2fe" />
      <path d="M63,20 H37 C32,20 28,24 28,29 V71 C28,76 32,80 37,80 H63 C68,80 72,76 72,71 V29 C72,24 68,20 63,20 Z M50,77 C48,77 46.5,75.5 46.5,73.5 C46.5,71.5 48,70 50,70 C52,70 53.5,71.5 53.5,73.5 C53.5,75.5 52,77 50,77 Z M68,65 H32 V29 C32,26 34,24 37,24 H63 C66,24 68,26 68,29 V65Z" fill="#0284c7" />
    </g>
  </svg>
);

export const OtpIllustration: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg viewBox="0 0 100 100" {...props}>
    <g transform="translate(5, 5)">
      <rect width="90" height="90" rx="45" fill="#e0f2fe" />
      <path d="M68,25 H32 C30,25 28,27 28,29 V50 H72 V29 C72,27 70,25 68,25 Z" fill="#93c5fd" />
      <path d="M72,55 H28 V71 C28,73 30,75 32,75 H68 C70,75 72,73 72,71 V55 Z" fill="#60a5fa" />
      <circle cx="40" cy="65" r="3" fill="white" />
      <circle cx="50" cy="65" r="3" fill="white" />
      <circle cx="60" cy="65" r="3" fill="white" />
      <path d="M60,45 C60,48 55,50 50,50 C45,50 40,48 40,45 V35 C40,32 45,30 50,30 C55,30 60,32 60,35 V45 Z" fill="#0284c7" />
      <path d="M50,30 C55,30 60,32 60,35 V38 C60,35 55,33 50,33 C45,33 40,35 40,38 V35 C40,32 45,30 50,30 Z" fill="#38bdf8" />
    </g>
  </svg>
);

export const DetailsIllustration: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg viewBox="0 0 100 100" {...props}>
    <g transform="translate(5, 5)">
      <rect width="90" height="90" rx="45" fill="#e0f2fe" />
      <rect x="25" y="60" width="50" height="20" rx="5" fill="#93c5fd" />
      <rect x="30" y="65" width="40" height="5" rx="2" fill="#dbeafe" />
      <rect x="30" y="75" width="25" height="5" rx="2" fill="#dbeafe" />
      <circle cx="50" cy="40" r="15" fill="#60a5fa" />
      <path d="M50,55 C40,55 35,50 35,45 C35,35 50,20 50,20 C50,20 65,35 65,45 C65,50 60,55 50,55Z" fill="#0284c7" />
      <circle cx="50" cy="38" r="12" fill="#38bdf8" />
    </g>
  </svg>
);