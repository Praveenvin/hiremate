"use client";

import React from "react";
import AddNewInterview from "./_components/AddNewInterview";
import InterviewList from "./_components/InterviewList";
import YourCredits from "./_components/YourCredits";
import Profile from "./_components/Profile";

const Dashboard = () => {
  return (
    <div className="p-5 md:p-10">
      {/* Title */}
      <h2 className="font-bold text-2xl">Dashboard</h2>
      <p className="text-gray-500">Create and start your AI mock interview</p>

      {/* Profile Section */}
      <div className="my-8">
        <Profile />
      </div>

      {/* Grid: New Interview + (Optional) Credits */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-5">
        <AddNewInterview />

        {/* Empty placeholder column removed for cleaner UI */}
        {/* <div></div> */}

        {/* Credits disabled by you, kept commented safely */}
        {/* <YourCredits /> */}
      </div>

      {/* Interviews List */}
      <InterviewList />
    </div>
  );
};

export default Dashboard;

// Keep dynamic rendering exactly as you had it
export const dynamic = "force-dynamic";
