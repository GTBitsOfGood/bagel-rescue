import React from "react";

const LoadingBar = ({ progress }: { progress: number }) => {
  return (
    <div className="w-4/5 mt-6 mb-6 mx-auto">
      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-[#0F7AFF] transition-all duration-200 ease-out"
          style={{ width: `${progress}%` }}
        ></div>
      </div>
    </div>
  );
};

export default LoadingBar;
