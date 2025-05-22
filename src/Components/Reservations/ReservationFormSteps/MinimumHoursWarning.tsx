"use client";
import React from "react";
import { XIcon } from "lucide-react";

interface MinimumHoursWarningProps {
  onClose: () => void;
  onYes: () => void;
  message: string;
}

export default function MinimumHoursWarning({
  onClose,
  onYes,
  message,
}: MinimumHoursWarningProps) {
  const modalRef = React.useRef<HTMLDivElement>(null);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div
        ref={modalRef}
        className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl"
      >
        <div className="mb-4 flex items-center justify-between">
          Minimum Hours Required
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <XIcon size={24} />
          </button>
        </div>
        <p className="py-4">{message}</p>

        <div className="flex justify-end space-x-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-100"
          >
            No
          </button>
          <button
            type="submit"
            className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
            onClick={onYes}
          >
            Yes
          </button>
        </div>
      </div>
    </div>
  );
}
