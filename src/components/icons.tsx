import type { SVGProps } from 'react';

export function NutriSnapLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="1em"
      height="1em"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2Z" />
      <path d="M7 13c.83.83 2.17.83 3 0 .83-.83.83-2.17 0-3-.83-.83-2.17-.83-3 0l-3 3" />
      <path d="m14 17.5 3.5-3.5" />
      <path d="m12 12-2-2" />
      <path d="m15 15 2 2" />
      <path d="M22 12h-2" />
      <path d="M13 3.34V2" />
      <path d="M4 12H2" />
      <path d="M11 20.66V22" />
    </svg>
  );
}
