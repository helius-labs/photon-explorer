import React from "react";

interface MintExtensionRendererProps {
  name: string;
  data: any;
  isTopLevel?: boolean;
}

const MintExtensionRenderer: React.FC<MintExtensionRendererProps> = ({ name, data, isTopLevel = false }) => {
  const renderValue = (value: any, depth: number = 0): JSX.Element => {
    if (value === null) {
      return <span className="text-white">null</span>;
    } else if (Array.isArray(value)) {
      return (
        <div className={`pl-${depth * 4}`}>
          {value.map((item, index) => (
            <div key={index}>
              {Array.isArray(item) ? (
                <>
                  <span className="text-orange-300">{item[0]}: </span>
                  {renderValue(item[1], depth + 1)}
                </>
              ) : (
                renderValue(item, depth + 1)
              )}
            </div>
          ))}
        </div>
      );
    } else if (typeof value === "object" && value !== null) {
      return (
        <div className={`pl-${depth * 4}`}>
          {Object.entries(value).map(([key, val]) => (
            <div key={key} className={depth === 0 ? "mb-2" : ""}>
              <span className={depth === 0 ? "text-orange-500 font-semibold" : "text-orange-300 font-semibold"}>
                {key}:
              </span>{" "}
              {renderValue(val, depth + 1)}
            </div>
          ))}
        </div>
      );
    }
    return <span className="text-white">{value.toString()}</span>;
  };

  return (
    <div className={`mb-6 ${isTopLevel ? "border-b border-gray-700 pb-4" : ""}`}>
      <h3 className={`font-semibold text-orange-500 ${isTopLevel ? "text-2xl mb-3" : "text-xl mb-2"}`}>
        {name}
      </h3>
      {renderValue(data)}
    </div>
  );
};

export default MintExtensionRenderer;