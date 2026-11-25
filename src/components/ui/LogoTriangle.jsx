import React from "react";

export default function LogoTriangle({ className = "", style }) {
  return (
    <svg
      viewBox="0 0 400 360"
      className={className}
      style={style}
      aria-hidden="true"
    >
      <polygon points="200,20 380,330 20,330" fill="#8CC63F" />
      <polygon points="200,20 380,330 200,330" fill="#6FA42C" />
    </svg>
  );
}
