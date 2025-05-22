import React from "react";

interface IInput {
  label?: string;
  type?: string;
  id?: string;
  name?: string;
  required?: boolean;
  inPutProps?: React.InputHTMLAttributes<HTMLInputElement>;
  className?: string;
}
export const Input = ({
  label,
  type,
  id,
  name,
  required = false,
  className,
  inPutProps,
}: IInput) => {
  const inputId = React.useId();
  return (
    <div className={`mb-4 sm:mb-6 ${className}`}>
      {label && (
        <label
          htmlFor="companyName"
          className="mb-2 block text-sm font-medium text-gray-700"
        >
          {label}
        </label>
      )}
      <input
        type={type ?? "text"}
        id={id ?? inputId}
        name={name ?? inputId}
        className={`w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500`}
        required={required}
        {...inPutProps}
      />
    </div>
  );
};
