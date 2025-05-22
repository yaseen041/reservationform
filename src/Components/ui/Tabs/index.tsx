"use client";
import React from "react";

interface TabsProps {
  options: {
    id: string;
    title: string;
  }[];
  selectedTabId: string;
  setSelectedTabId: (value: string) => void;
}

export const Tabs = ({
  setSelectedTabId,
  selectedTabId,
  options,
}: TabsProps) => {
  const [activeTab, setActiveTab] = React.useState(
    options.length > 0 ? options[0].id : "",
  );
  React.useEffect(() => {
    setSelectedTabId(activeTab);
  }, [activeTab, setSelectedTabId]);

  return (
    <div className="p-4">
      <div className="mb-4 flex space-x-4">
        {options?.map((i) => (
          <button
            key={i.id}
            onClick={() => setActiveTab(i.id)}
            className={`rounded-t-lg px-6 py-2 transition-colors duration-200 ${
              i.id === selectedTabId
                ? "border-b-2 border-purple-600 text-purple-600"
                : "text-blue-600 hover:bg-blue-50"
            }`}
          >
            {i.title}
          </button>
        ))}
      </div>
    </div>
  );
};
