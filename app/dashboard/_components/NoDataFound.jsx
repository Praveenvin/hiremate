"use client";

import React, { useState, useEffect } from "react";
import NoResultFound from "@/public/NoResultFound.json";

const NoDataFound = ({ message }) => {
  const [Lottie, setLottie] = useState(null);

  useEffect(() => {
    // Load Lottie on the client
    import("lottie-react").then((module) => {
      setLottie(() => module.default);
    });
  }, []);

  return (
    <div className="flex flex-col justify-center items-center w-full py-6">
      {Lottie ? (
        <div className="flex justify-center items-center w-full">
          <Lottie
            animationData={NoResultFound}
            loop={true}
            className="h-72 w-auto"
          />
        </div>
      ) : (
        <div className="h-72 w-72 bg-gray-200 rounded-lg animate-pulse flex justify-center items-center">
          <span className="text-gray-500">Loading...</span>
        </div>
      )}

      <p className="font-bold text-xl mt-3">
        {message || "No result found!"}
      </p>
    </div>
  );
};

export default NoDataFound;
