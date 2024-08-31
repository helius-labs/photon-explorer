import React, { useState } from "react";

interface NiftyAssetExtensionRendererProps {
  name: string;
  data: any;
  isTopLevel?: boolean;
}

const NiftyAssetExtensionRenderer: React.FC<NiftyAssetExtensionRendererProps> = ({ name, data, isTopLevel = false }) => {
  const [expandedBlob, setExpandedBlob] = useState<string | null>(null);

  const isBlobData = (value: any): boolean => {
    return Array.isArray(value) && value.every(item => typeof item === 'number' && item >= 0 && item <= 255);
  };

  const renderValue = (value: any, depth: number = 0, key: string = ''): JSX.Element | null => {
    if (value === null || value === undefined || value === "") {
      return null;
    } else if (isBlobData(value)) {
      return (
        <span className="text-gray-800 dark:text-gray-200">
          [Binary data: {value.length} bytes]
          <button
            className="ml-2 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
            onClick={() => setExpandedBlob(expandedBlob === key ? null : key)}
          >
            {expandedBlob === key ? "Hide" : "View"} full data
          </button>
          {expandedBlob === key && (
            <div className="mt-2 p-4 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-lg shadow-md overflow-auto max-h-60">
              {value.join(", ")}
            </div>
          )}
        </span>
      );
    } else if (Array.isArray(value)) {
      return (
        <div className={`pl-${depth * 4}`}>
          {value.map((item, index) => (
            <div key={index}>
              {renderValue(item, depth + 1, `${key}[${index}]`)}
            </div>
          ))}
        </div>
      );
    } else if (typeof value === "object" && value !== null) {
      const renderedEntries = Object.entries(value)
        .map(([subKey, val]) => {
          const renderedValue = renderValue(val, depth + 1, `${key}.${subKey}`);
          if (renderedValue === null) return null;
          return (
            <div key={subKey} className={depth === 0 ? "mb-2" : ""}>
              <span className={depth === 0 ? "text-orange-600 dark:text-orange-400 font-semibold" : "text-orange-500 dark:text-orange-300 font-semibold"}>
                {subKey}:
              </span>{" "}
              {renderedValue}
            </div>
          );
        })
        .filter(Boolean);
      if (renderedEntries.length === 0) return null;
      return <div className={`pl-${depth * 4}`}>{renderedEntries}</div>;
    }
    return <span className="text-gray-800 dark:text-gray-200">{value.toString()}</span>;
  };

  const renderedData = renderValue(data, 0, name);
  if (renderedData === null) return null;

  return (
    <div className={`mb-6 ${isTopLevel ? "border-b border-gray-300 dark:border-gray-700 pb-4" : ""}`}>
      <h3 className={`font-semibold text-orange-600 dark:text-orange-400 ${isTopLevel ? "text-2xl mb-3" : "text-xl mb-2"}`}>
        {name}
      </h3>
      {renderedData}
    </div>
  );
};

export default NiftyAssetExtensionRenderer;