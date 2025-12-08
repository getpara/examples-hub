"use client";
import { useState, useRef, useEffect, ReactNode } from "react";

interface TooltipProps {
  children: ReactNode;
  content: string;
}

export default function Tooltip({ children, content }: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const targetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        tooltipRef.current &&
        !tooltipRef.current.contains(event.target as Node) &&
        targetRef.current &&
        !targetRef.current.contains(event.target as Node)
      ) {
        setIsVisible(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="relative inline-block">
      <div
        ref={targetRef}
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        onClick={() => setIsVisible(!isVisible)}
        className="cursor-pointer">
        {children}
      </div>

      {isVisible && (
        <div
          ref={tooltipRef}
          className="absolute z-10 px-2 py-1 text-xs text-white bg-black rounded-sm shadow-sm -translate-x-1/2 left-1/2 bottom-full mb-1 w-max max-w-xs">
          <div className="relative">
            {content}
            <div className="absolute w-2 h-2 bg-black rotate-45 -bottom-1 left-1/2 -translate-x-1/2"></div>
          </div>
        </div>
      )}
    </div>
  );
}
