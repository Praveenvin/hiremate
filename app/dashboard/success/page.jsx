"use client";

import React, { useContext, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  MatchUserPaymentSecretKey,
  RemoveUserPaymentSecretKey,
} from "@/app/_Serveractions";
import { useUser } from "@/lib/simpleAuth";
import { UserInfoContext } from "@/context/UserInfoContext";

const SuccessPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const paymentKey = searchParams.get("session_id");
  const { user } = useUser();
  const { userInfo } = useContext(UserInfoContext);

  const [Lottie, setLottie] = useState(null);
  const [PaymentSuccess, setPaymentSuccess] = useState(null);
  const [PaymentCheck, setPaymentCheck] = useState(null);

  /** -----------------------------
   *  Load Lottie animations
   *  ----------------------------- */
  useEffect(() => {
    import("lottie-react").then((m) => setLottie(() => m.default));
    import("@/public/PaymentSuccefull.json").then((m) =>
      setPaymentSuccess(m.default)
    );
    import("@/public/PaymentCheck.json").then((m) =>
      setPaymentCheck(m.default)
    );
  }, []);

  /** -----------------------------
   *  Payment verification flow
   *  ----------------------------- */
  useEffect(() => {
    if (!paymentKey || !userInfo || !user?.email) return;

    const runPaymentFlow = async () => {
      try {
        const matched = await MatchUserPaymentSecretKey(
          user.email,
          paymentKey
        );

        if (matched) {
          console.log("Payment verified 🔥", matched);

          // Remove secret key after use
          await RemoveUserPaymentSecretKey(user.email);
          console.log("Payment key removed 🔥");
        } else {
          console.log("Payment key mismatch ❌");
        }
      } catch (error) {
        console.error("Payment verification error:", error);
      }
    };

    runPaymentFlow();
  }, [paymentKey, userInfo, user]);

  return (
    <>
      {/* BACK BUTTON */}
      <div className="flex justify-start -mx-32 mt-3">
        <Button
          onClick={() => router.replace("/dashboard")}
          className="flex justify-center items-center gap-1 rounded-3xl cursor-pointer"
        >
          <ArrowLeft /> Go back
        </Button>
      </div>

      {/* MAIN SUCCESS UI */}
      <div className="flex flex-col items-center -mt-12">
        
        {/* PAYMENT SUCCESS ANIMATION */}
        {Lottie && PaymentSuccess ? (
          <Lottie
            animationData={PaymentSuccess}
            loop
            className="h-screen -mt-32 flex justify-center items-center"
          />
        ) : (
          <div className="h-screen w-screen bg-gray-200 rounded animate-pulse -mt-32"></div>
        )}

        {/* SECOND CHECKMARK ANIMATION */}
        {Lottie && PaymentCheck ? (
          <Lottie
            animationData={PaymentCheck}
            loop
            className="h-52 flex justify-center items-center -mt-52"
          />
        ) : (
          <div className="h-52 w-52 bg-gray-200 rounded animate-pulse -mt-52"></div>
        )}

        {/* TEXT MESSAGES */}
        <h2 className="font-bold text-2xl text-indigo-700">
          ⚡ Payment Successful ⚡
        </h2>
        <h2 className="font-bold text-2xl text-center px-4">
          Thanks for buying credits for Hiremate AI Mock Interviews
        </h2>
      </div>
    </>
  );
};

export default SuccessPage;

export const dynamic = "force-dynamic";
