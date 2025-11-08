import React from "react";

export default function PageSpinner({ visible }: { visible: boolean }) {
  if (!visible) return <></>;
  return (
    <div className="h-full w-full fixed top-0 left-0 z-10000 opacity-25 bg-black flex justify-center items-center">
      <div className="z-10001">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 100 100"
          preserveAspectRatio="xMidYMid"
          width="200"
          height="200"
          style={{
            shapeRendering: "auto",
            display: "block",
            background: "transparent",
          }}
        >
          <g>
            <circle
              strokeDasharray="164.93361431346415 56.97787143782138"
              r="35"
              strokeWidth="10"
              stroke="#ffffff"
              fill="none"
              cy="50"
              cx="50"
            >
              <animateTransform
                keyTimes="0;1"
                values="0 50 50;360 50 50"
                dur="1s"
                repeatCount="indefinite"
                type="rotate"
                attributeName="transform"
              ></animateTransform>
            </circle>
            <g></g>
          </g>
        </svg>
      </div>
    </div>
  );
}
