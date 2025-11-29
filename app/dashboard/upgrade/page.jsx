"use client";

import React, { useState } from "react";
import { UpdateUserPaymentSecretKey } from "@/app/_Serveractions";
import planData from "@/utils/planData";
import { useUser } from "@/lib/simpleAuth";
import { loadStripe } from "@stripe/stripe-js";
import axios from "axios";
import { Loader } from "lucide-react";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

const Upgrade = () => {
  const { user } = useUser();
  const [loading, setLoading] = useState(false);

  /** ---------------------------------------
   *  Create Stripe Checkout Session
   *  --------------------------------------- */
  const createStripeSession = async () => {
    if (!user?.email) {
      toast.error("Please log in before purchasing credits.");
      return;
    }

    setLoading(true);

    try {
      const stripe = await stripePromise;
      if (!stripe) {
        toast.error("Stripe failed to initialize.");
        setLoading(false);
        return;
      }

      // Generate unique payment secret key
      const paymentSecretKey = uuidv4();

      // Save payment secret key to DB
      await UpdateUserPaymentSecretKey(user.email, paymentSecretKey);

      // Create checkout session
      const checkoutSession = await axios.post("/api/checkout_sessions", {
        items: {
          title: "12 Credits",
          price: 1,
        },
        email: user.email,
        paymentSecretKey,
      });

      // Redirect user to Stripe Checkout
      const result = await stripe.redirectToCheckout({
        sessionId: checkoutSession.data.id,
      });

      if (result?.error) {
        console.log(result.error.message);
        toast.error(result.error.message);
      }

    } catch (error) {
      console.error("Error creating checkout session:", error);
      toast.error("Checkout failed. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-10">
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-8 sm:items-center">
          {planData.map((item, index) => (
            <div
              key={index}
              className="rounded-2xl border border-gray-200 p-6 shadow-sm sm:px-8 lg:p-12"
            >
              <div className="text-center">
                <h2 className="text-lg font-medium text-gray-900">
                  {item.name}
                </h2>

                <p className="mt-2 sm:mt-4">
                  <strong className="text-3xl font-bold text-gray-900 sm:text-4xl">
                    {item.cost} $
                  </strong>
                </p>
              </div>

              {/* Features */}
              <ul className="mt-6 space-y-2">
                {item.offering.map((offer, idx) => (
                  <li key={idx} className="flex items-center gap-1">
                    <span className="text-gray-700">{offer.value}</span>
                  </li>
                ))}
              </ul>

              {/* Buy Button */}
              {item.cost > 0 && (
                <button
                  disabled={loading}
                  onClick={createStripeSession}
                  className="mt-8 w-full rounded-full border border-indigo-600 bg-white px-12 py-3 text-sm font-medium text-indigo-600 text-center hover:ring-1 hover:ring-indigo-600 active:text-indigo-500 transition cursor-pointer"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader className="animate-spin h-4 w-4" />
                      Loading…
                    </span>
                  ) : (
                    "Buy Now"
                  )}
                </button>
              )}
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};

export default Upgrade;
