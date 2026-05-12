import type { IconProps } from './types';

/** Reject user — from Vector.svg */
export function UserXIcon({ size = 18, className, ...rest }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 20 14"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      preserveAspectRatio="xMidYMid meet"
      {...rest}
    >
      <path
        d="M6 7C7.995 7 9.5 5.495 9.5 3.5C9.5 1.505 7.995 0 6 0C4.005 0 2.5 1.505 2.5 3.5C2.5 5.495 4.005 7 6 7ZM7 7.948H5C2.243 7.948 0 10.191 0 12.948V13.948H12V12.948C12 10.191 9.757 7.948 7 7.948ZM18.293 3.241L16 5.534L13.707 3.241L12.293 4.655L14.585 6.947L12.292 9.24L13.706 10.654L15.999 8.361L18.293 10.655L19.707 9.241L17.414 6.948L19.707 4.655L18.293 3.241Z"
        fill="currentColor"
      />
    </svg>
  );
}
