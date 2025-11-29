"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useUser } from "@/lib/simpleAuth";
import InterviewItemCard from "./InterviewItemCard";
import Loading from "./Loading";
import NoDataFound from "./NoDataFound";

// Old DB imports preserved as you had them
// import { db } from "@/utils/db";
// import { MOCKInterview } from "@/utils/schema";
// import { desc, eq } from "drizzle-orm";

const InterviewList = () => {
  const [interviewList, setInterviewList] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useUser();

  const GetInterviewList = useCallback(async () => {
    if (!user?.email) return;

    try {
      setLoading(true);

      const response = await fetch(
        `/api/interviews?email=${encodeURIComponent(user.email)}`
      );

      if (!response.ok) throw new Error("Failed to fetch interviews");

      const data = await response.json();

      console.log("MOCKInterview 🚀", data.interviews);

      setInterviewList(data.interviews || []);
    } catch (error) {
      console.error("Error Fetching Interview List", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    GetInterviewList();
  }, [GetInterviewList]);

  return (
    <div>
      <h2 className="font-semibold text-lg mb-4">
        Previous Hiremate Mock Interviews
      </h2>

      {loading ? (
        <Loading />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 my-3">
          {interviewList?.length > 0 ? (
            interviewList.map((interview) => (
              <InterviewItemCard
                key={interview?.id || interview?.interviewId}
                interview={interview}
                refreshCallBack={GetInterviewList}
              />
            ))
          ) : (
            <div className="col-span-3">
              <NoDataFound message="No interviews found! Please add a new interview." />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default InterviewList;
