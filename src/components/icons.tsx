import type { SVGProps } from "react";

export const Icons = {
  logo: (props: SVGProps<SVGSVGElement>) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      {...props}
    >
      <rect width="24" height="24" fill="#0b63c5" />
      <rect x="3" y="3" width="18" height="18" fill="#fecb00" />
      <path fill="#000000" d="M7,7h10v2h-4v8h-2v-8H7V7z" />
    </svg>
  ),
};
