interface PawHeartLogoProps {
  className?: string;
  size?: number;
}

export function PawHeartLogo({ className = "", size = 40 }: PawHeartLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Heart shape */}
      <path
        d="M32 56C32 56 8 40 8 24C8 16 14 10 22 10C27 10 31 13 32 16C33 13 37 10 42 10C50 10 56 16 56 24C56 40 32 56 32 56Z"
        fill="currentColor"
        opacity="0.9"
      />
      {/* Paw pad - main */}
      <ellipse cx="32" cy="36" rx="5" ry="5.5" fill="white" opacity="0.95" />
      {/* Paw pad - top left */}
      <ellipse cx="25" cy="28" rx="3" ry="3.5" fill="white" opacity="0.95" />
      {/* Paw pad - top right */}
      <ellipse cx="39" cy="28" rx="3" ry="3.5" fill="white" opacity="0.95" />
      {/* Paw pad - far left */}
      <ellipse cx="21" cy="34" rx="2.5" ry="3" fill="white" opacity="0.95" />
      {/* Paw pad - far right */}
      <ellipse cx="43" cy="34" rx="2.5" ry="3" fill="white" opacity="0.95" />
    </svg>
  );
}
