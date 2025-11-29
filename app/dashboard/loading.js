"use client";

import dynamic from "next/dynamic";
import loadingSpiner from "@/public/loadingSpiner.json";

// Lottie animation – client-only
const Lottie = dynamic(() => import("lottie-react"), { ssr: false });

export default function Loading() {
  return (
    <div className="flex items-center justify-center h-screen w-full">
      <div className="w-40 h-40 lg:w-64 lg:h-64 flex items-center justify-center">
        <Lottie animationData={loadingSpiner} loop={true} />
      </div>
    </div>
  );
}
