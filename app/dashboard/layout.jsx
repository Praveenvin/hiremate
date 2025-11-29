"use client";

import React, { Suspense, useEffect, useState } from "react";
import Header from "./_components/Header";
import { useUser } from "@/lib/simpleAuth";
import { UserInfoContext } from "@/context/UserInfoContext";
import Loading from "./loading.js";

// NOTE: Old DB imports preserved (they were originally commented)
// import { db } from "@/utils/db";
// import { UserDetails } from "@/utils/schema";
// import { eq } from "drizzle-orm";

const DashboardLayout = ({ children }) => {
  const [userInfo, setUserInfo] = useState(null);
  const [paymentResult, setPaymentResult] = useState(null);
  const { user } = useUser();

  useEffect(() => {
    async function GetUserInfo() {
      try {
        if (!user?.email) return;

        const response = await fetch(
          `/api/user-info?email=${encodeURIComponent(user.email)}`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch user info");
        }

        const data = await response.json();

        if (data?.userInfo) {
          setUserInfo(data.userInfo);
          console.log("Fetched User Info:", data.userInfo);
        }
      } catch (error) {
        console.error("Error Fetching UserInfo:", error);
      }
    }

    GetUserInfo();
  }, [user]);

  return (
    <UserInfoContext.Provider
      value={{ userInfo, setUserInfo, paymentResult, setPaymentResult }}
    >
      <Suspense fallback={<Loading />}>
        <div className="min-h-screen w-full">
          {/* Dashboard Header */}
          <Header />

          {/* Dashboard Page Content */}
          <div className="mx-5 md:mx-20 lg:mx-36 py-5">{children}</div>
        </div>
      </Suspense>
    </UserInfoContext.Provider>
  );
};

export default DashboardLayout;
