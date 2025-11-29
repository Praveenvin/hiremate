"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import notfound from "@/public/notfound.json";

// Dynamically import Lottie to avoid SSR issues
const Lottie = dynamic(() => import("lottie-react"), { ssr: false });

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white px-4 py-10">
      <div className="flex flex-col items-center text-center">

        {/* Animation */}
        <div className="w-full max-w-lg">
          <Lottie
            animationData={notfound}
            loop={true}
            className="w-full h-full"
          />
        </div>

        {/* Heading */}
        <h1 className="mt-6 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
          Uh-oh!
        </h1>

        {/* Message */}
        <p className="mt-2 text-gray-600">
          We can't find that page.
        </p>

        {/* Button */}
        <Link
          href="/dashboard"
          className="mt-6 inline-block rounded bg-indigo-600 px-5 py-3 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring"
        >
          Go Back Home
        </Link>

      </div>
    </div>
  );
}
