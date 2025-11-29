"use client";

import React, { useEffect, useState, useCallback, useMemo, useContext } from "react";
import { GetInterviewList } from "@/app/_Serveractions";
import { UserInfoContext } from "@/context/UserInfoContext";
import { useUser } from "@/lib/simpleAuth";
import { HiSparkles } from "react-icons/hi2";
import { useRouter } from "next/navigation";
import loadingSpiner from "@/public/loadingSpiner.json";

const YourCredits = () => {
  const { userInfo } = useContext(UserInfoContext);
  const { user } = useUser();

  const [totalInterviewsCreated, setTotalInterviewsCreated] = useState(0);
  const [loading, setLoading] = useState(true);
  const [Lottie, setLottie] = useState(null);

  const router = useRouter();

  /** ============================
   *  Load Lottie animation
   * ============================ */
  useEffect(() => {
    import("lottie-react").then((module) => setLottie(() => module.default));
  }, []);

  /** ============================
   *  Fetch interviews count
   * ============================ */
  const fetchInterviews = useCallback(async () => {
    if (!user?.email) return;

    try {
      const result = await GetInterviewList(user.email);
      if (Array.isArray(result)) {
        setTotalInterviewsCreated(result.length);
      }
    } catch (err) {
      console.error("Error fetching interview count", err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchInterviews();
  }, [fetchInterviews]);

  /** ============================
   *  Credit Calculations
   * ============================ */

  // Credits (if unlimited, defaults to 0)
  const totalCredits = useMemo(() => userInfo?.credits || 0, [userInfo]);

  // Example: Each interview = 2 credits (original logic)
  const creditsUsed = useMemo(() => totalInterviewsCreated * 2, [totalInterviewsCreated]);

  // Remove free credits (6) based on original formula
  const actualUsed = useMemo(() => {
    const val = creditsUsed - 6;
    return val < 0 ? 0 : val;
  }, [creditsUsed]);

  // Prevent divide-by-zero crash
  const percentageUsed = useMemo(() => {
    if (!totalCredits || totalCredits === 0) return 0;
    const percent = Math.floor((actualUsed / totalCredits) * 100);
    return percent > 100 ? 100 : percent;
  }, [actualUsed, totalCredits]);

  return (
    <div className="border-2 border-primary rounded-lg p-4 shadow-xl bg-white">
      {/* Header – Upgrade Button */}
      <div
        onClick={() => router.push("/dashboard/upgrade")}
        className="flex gap-2 items-center cursor-pointer hover:text-primary transition"
      >
        <HiSparkles size={24} />
        <h2 className="font-bold text-primary text-xl">Upgrade</h2>
      </div>

      {/* Loader */}
      {loading ? (
        <div className="flex flex-col justify-center items-center mt-4">
          {Lottie ? (
            <Lottie
              animationData={loadingSpiner}
              loop
              className="h-20 w-20 lg:h-28 lg:w-28"
            />
          ) : (
            <div className="h-20 w-20 bg-gray-200 rounded animate-pulse" />
          )}
        </div>
      ) : (
        <>
          {/* Credits Summary */}
          <div className="text-center mt-3 font-bold">
            <h2>Total Credits: {totalCredits}</h2>
          </div>

          <div className="flex justify-between mt-3 text-sm">
            <h2 className="font-semibold text-gray-500">
              Credits Used: {userInfo?.creditsUsed ?? actualUsed}
            </h2>

            <h2 className="font-semibold text-gray-500">
              Total Spent: ${userInfo?.totalAmountSpent || 0}
            </h2>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-gray-300 h-3 rounded-full mt-3">
            <div
              className="bg-primary h-3 rounded-full transition-all"
              style={{ width: `${percentageUsed}%` }}
            />
          </div>

          <p className="text-right text-xs font-semibold mt-1 text-gray-500">
            Used: {percentageUsed}%
          </p>
        </>
      )}
    </div>
  );
};

export default YourCredits;
