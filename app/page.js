"use client";

import { useEffect } from "react";
import { useUser } from "@/lib/simpleAuth";
import LandingPage from "./_Serveractions/LandingPage";
import { toast } from "sonner";

// Correct path ✔
import { addUserDetailsToDB } from "./actions/addUserDetails";

export default function Home() {
  const { user, isSignedIn } = useUser();

  useEffect(() => {
    async function handleUser() {
      if (user && isSignedIn) {
        const email = user?.primaryEmailAddress?.emailAddress;
        const result = await addUserDetailsToDB(email);

        if (result?.success) {
          toast.success("User details synced");
        }
      }
    }

    handleUser();
  }, [user, isSignedIn]);

  return (
    <div className="w-full">
      <LandingPage />
    </div>
  );
}
