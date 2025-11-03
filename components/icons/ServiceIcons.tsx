import React from 'react';

const iconProps = {
  xmlns: "http://www.w3.org/2000/svg",
  fill: "none",
  viewBox: "0 0 24 24",
  strokeWidth: 1.5,
  stroke: "currentColor"
};

export const AcIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg {...iconProps} {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 19.5l-7.5-7.5 7.5-7.5" />
  </svg>
);

export const PlumbingIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg {...iconProps} {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h7.5M8.25 10.5h7.5M8.25 14.25h7.5M4.5 3.75v16.5c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V3.75M8.25 2.25h7.5v1.5h-7.5V2.25z" />
  </svg>
);

export const ElectricalIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg {...iconProps} {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
  </svg>
);

export const CleaningIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg {...iconProps} {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3.75l-4.5 4.5m0 0l4.5 4.5m-4.5-4.5h15m-15 0l4.5-4.5m0 0l4.5 4.5M3 12h18M3 16.5h18" />
  </svg>
);

export const PaintingIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg {...iconProps} {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.998 15.998 0 011.62-3.388m0 0a2.25 2.25 0 012.245-2.4 3 3 0 001.128-5.78 4.5 4.5 0 00-2.245 8.4z" />
  </svg>
);

export const PestControlIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg {...iconProps} {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12c0-1.232-.046-2.453-.138-3.662a4.006 4.006 0 00-3.7-3.7 48.678 48.678 0 00-7.324 0 4.006 4.006 0 00-3.7 3.7c-.092 1.209-.138 2.43-.138 3.662s.046 2.453.138 3.662a4.006 4.006 0 003.7 3.7 48.656 48.656 0 007.324 0 4.006 4.006 0 003.7-3.7c.092-1.209.138-2.43.138-3.662z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 12v.01" />
  </svg>
);

export const CarpenterIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg {...iconProps} {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 4.5l7.5 7.5-7.5 7.5" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.375 12h18" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 4.5l-7.5 7.5 7.5 7.5" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.375 4.5h18v15h-18z" transform="rotate(45 12 12)" />
  </svg>
);

export const SERVICE_ICONS_MAP: { [key: string]: React.FC<React.SVGProps<SVGSVGElement>> } = {
  ac: AcIcon,
  plumbing: PlumbingIcon,
  electrical: ElectricalIcon,
  cleaning: CleaningIcon,
  painting: PaintingIcon,
  pest: PestControlIcon,
  carpenter: CarpenterIcon,
};