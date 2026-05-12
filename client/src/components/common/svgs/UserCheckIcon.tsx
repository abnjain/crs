import type { IconProps } from './types';


export function UserCheckIcon({ size = 18, className, ...rest }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      preserveAspectRatio="xMidYMid meet"
      {...rest}
    >
      <path
        d="M11 7.94824C13.757 7.94824 16 10.1912 16 12.9482V13.9482H4V12.9482C4 10.1912 6.243 7.94824 9 7.94824H11ZM21 2.94824V5.94824H24V7.94824H21V10.9482H19V7.94824H16V5.94824H19V2.94824H21ZM10 0C11.995 0 13.5 1.505 13.5 3.5C13.5 5.495 11.995 7 10 7C8.005 7 6.5 5.495 6.5 3.5C6.5 1.505 8.005 0 10 0Z"
        fill="currentColor"
      />
    </svg>
  );
}
