"use client";

import React, { useState, useEffect } from "react";
import skelotenloading2 from "@/public/skelotenloading2.json";

const Loading = () => {
  const [Lottie, setLottie] = useState(null);

  useEffect(() => {
    import("lottie-react").then((module) => {
      setLottie(() => module.default);
    });
  }, []);

  return (
    <div className="flex justify-center items-center w-full h-full py-10">
      {Lottie ? (
        <div className="flex justify-center items-center">
          <Lottie
            animationData={skelotenloading2}
            loop={true}
            speed={3.5}
            className="h-80 w-auto"
          />
        </div>
      ) : (
        <div className="h-80 w-80 bg-gray-200 rounded-lg animate-pulse flex justify-center items-center">
          <span className="text-gray-500">Loading...</span>
        </div>
      )}
    </div>
  );
};

export default Loading;
