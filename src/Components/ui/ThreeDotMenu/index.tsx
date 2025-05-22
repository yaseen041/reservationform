"use client";
import React, { useEffect, useRef, useState } from "react";
import { MoreVertical } from "lucide-react";

interface ThreeDotMenuProps {
  children: React.ReactNode;
}
export const ThreeDotMenu = ({ children }: ThreeDotMenuProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="relative inline-block text-left" ref={ref}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="rounded-full p-2 hover:bg-gray-100"
      >
        <MoreVertical className="h-5 w-5" />
      </button>

      {isOpen && (
        <div className="absolute right-0 z-50 mt-2 w-40 rounded-lg border border-gray-200 bg-white shadow-lg">
          {children}
        </div>
      )}
    </div>
  );
};
