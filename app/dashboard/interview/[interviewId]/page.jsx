"use client";

import { Button } from "@/components/ui/button";
import { Lightbulb, WebcamIcon } from "lucide-react";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import Webcam from "react-webcam";
import rocketLaunch from "@/public/rocketLaunch.json";
import Lottie from "lottie-react";

const Interview = ({ params }) => {
  const [interviewData, setInterviewData] = useState(null);
  const [webCamEnabled, setWebCamEnabled] = useState(false);
  const [loading, setLoading] = useState(true);

  /** ============================
   * FETCH INTERVIEW DETAILS
   * ============================ */
  useEffect(() => {
    fetchInterviewDetails();
  }, []);

  const fetchInterviewDetails = async () => {
    try {
      const response = await fetch(
        `/api/interview-details?mockId=${params.interviewId}`
      );

      if (!response.ok) throw new Error("Failed to load interview details");

      const data = await response.json();
      setInterviewData(data.interview || null);
    } catch (error) {
      console.error("❌ Error fetching interview details:", error);
    } finally {
      setLoading(false);
    }
  };

  /** ============================
   *  LOADING STATE
   * ============================ */
  if (loading || !interviewData) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh]">
        <div className="h-16 w-16 bg-gray-300 animate-pulse rounded-full" />
        <p className="text-gray-500 mt-4">Loading interview…</p>
      </div>
    );
  }

  return (
    <div className="my-10">
      <h2 className="font-bold text-2xl mb-6">Let's Get Started</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* LEFT SIDE — INTERVIEW DETAILS */}
        <div className="flex flex-col my-5 gap-6">
          {/* INTERVIEW CARD */}
          <div className="flex flex-col p-5 rounded-lg border gap-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-700">
                Job Role / Position:
              </h2>
              <p className="text-gray-600">{interviewData.jobPosition}</p>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-gray-700">
                Job Description / Tech Stack:
              </h2>
              <p className="text-gray-600">{interviewData.jobDescription}</p>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-gray-700">
                Years of Experience:
              </h2>
              <p className="text-gray-600">{interviewData.jobExperience}</p>
            </div>
          </div>

          {/* IMPORTANT INFO */}
          <div className="p-5 border rounded-lg border-yellow-400 bg-yellow-100">
            <h2 className="flex gap-2 items-center text-yellow-600 text-lg">
              <Lightbulb /> <strong>Important Information</strong>
            </h2>

            <p className="mt-4 text-sm text-yellow-700 leading-relaxed">
              This is a comprehensive <strong>3-Round AI Interview:</strong>
              <br /><br />
              🟦 <strong>Round 1:</strong> Hiring Manager — Problem Solving  
              <br />
              🟩 <strong>Round 2:</strong> Technical Recruiter — Coding Skills  
              <br />
              🟧 <strong>Round 3:</strong> Panel Lead — Communication Skills  
              <br /><br />
              Each round is evaluated by a different AI agent.  
              <br />
              <strong>Enable your webcam & microphone to begin.</strong>  
              (We DO NOT record or store any video.)
            </p>
          </div>
        </div>

        {/* RIGHT SIDE — WEBCAM */}
        <div className="flex flex-col items-center justify-center">
          {webCamEnabled ? (
            <Webcam
              mirrored={true}
              className="rounded-lg border shadow-md"
              onUserMedia={() => setWebCamEnabled(true)}
              onUserMediaError={() => setWebCamEnabled(false)}
              style={{ width: "100%", maxWidth: 350 }}
            />
          ) : (
            <>
              <WebcamIcon className="h-72 w-full p-16 bg-secondary rounded-lg border text-gray-400" />

              <Button
                variant="secondary"
                onClick={() => setWebCamEnabled(true)}
                className="w-full bg-slate-200 hover:border-primary hover:border mt-4"
              >
                Enable Web Cam and Microphone
              </Button>
            </>
          )}
        </div>
      </div>

      {/* START INTERVIEW BUTTON */}
      <div className="flex justify-end mt-10">
        <Link href={`/dashboard/interview/${params.interviewId}/start`}>
          <Button className="relative flex items-center gap-2 px-6 py-3 text-lg">
            <div className="absolute -left-6 -top-4 w-20 pointer-events-none">
              <Lottie animationData={rocketLaunch} loop className="w-full" />
            </div>
            Start Interview
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default Interview;
