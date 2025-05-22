import React from "react";

interface IUseDebounce {
  debouncedValue: string;
}
export const useDebounce = ({
  value,
  delay,
}: {
  value: string;
  delay: number;
}): IUseDebounce => {
  const [debouncedValue, setDebouncedValue] = React.useState(value);

  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return { debouncedValue };
};
