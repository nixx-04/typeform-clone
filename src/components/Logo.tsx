import React from "react";

interface LogoProps {
  darkMode?: boolean;
  className?: string;
  height?: string | number;
}

export const Logo: React.FC<LogoProps> = ({ darkMode = false, className = "", height = "auto" }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 135 32"
      height={height}
      className={className}
      style={{ display: "block" }}
      id="typeform-logo-svg"
    >
      <g fill={darkMode ? "#ffffff" : "#141414"}>
        {/* Left vertical rounded rect (pill) */}
        <rect x="0" y="6" width="4" height="20" rx="2" />
        {/* Right squircle / rounded square */}
        <rect x="6.5" y="6" width="20" height="20" rx="6" />
        {/* Text 'Typeform' */}
        <text
          x="31"
          y="21"
          fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
          fontWeight="700"
          fontSize="16.5"
          letterSpacing="-0.035em"
        >
          Typeform
        </text>
      </g>
    </svg>
  );
};
