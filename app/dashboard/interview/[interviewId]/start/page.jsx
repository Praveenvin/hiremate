"use client";

import React, { useEffect, useState, useCallback } from "react";
import QuestionsSection from "./_components/QuestionsSection";
import RecordAnswerSection from "./_components/RecordAnswerSection";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";
import Link from "next/link";

const StartInterview = ({ params }) => {
  const [interviewData, setInterviewData] = useState(null);
  const [mockInterviewQuestion, setMockInterviewQuestion] = useState(null);
  const [currentRound, setCurrentRound] = useState(1);
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);
  const [roundCompleted, setRoundCompleted] = useState(false);
  const [loading, setLoading] = useState(true);

  /** ============================
   *  FETCH INTERVIEW DETAILS
   * ============================ */
  const fetchInterviewDetails = useCallback(async () => {
    try {
      const response = await fetch(
        `/api/interview-details?mockId=${params.interviewId}`
      );

      if (!response.ok) throw new Error("Failed to load interview");

      const data = await response.json();
      const interview = data.interview;

      setInterviewData(interview);

      const jsonData = JSON.parse(interview.jsonMockResp || "{}");
      setMockInterviewQuestion(jsonData);
    } catch (error) {
      console.error("❌ Error loading interview:", error);
    } finally {
      setLoading(false);
    }
  }, [params.interviewId]);

  useEffect(() => {
    fetchInterviewDetails();
  }, [fetchInterviewDetails]);

  /** ============================
   *  HELPERS
   * ============================ */
  const getCurrentRoundQuestions = () => {
    if (!mockInterviewQuestion) return [];
    return mockInterviewQuestion[`round${currentRound}`] || [];
  };

  const getCurrentRoundAgent = () => {
    switch (currentRound) {
      case 1:
        return "hiring_manager";
      case 2:
        return "technical_recruiter";
      case 3:
        return "panel_lead";
      default:
        return "hiring_manager";
    }
  };

  const getCurrentRoundTitle = () => {
    switch (currentRound) {
      case 1:
        return "🟦 Round 1 — Hiring Manager (Problem-Solving)";
      case 2:
        return "🟩 Round 2 — Technical Recruiter (Coding)";
      case 3:
        return "🟧 Round 3 — Panel Lead (Communication)";
      default:
        return "Interview Round";
    }
  };

  /** ============================
   *  NAVIGATION LOGIC
   * ============================ */
  const handleNextQuestion = () => {
    const questions = getCurrentRoundQuestions();
    if (activeQuestionIndex < questions.length - 1) {
      setActiveQuestionIndex((i) => i + 1);
    } else {
      setRoundCompleted(true);
    }
  };

  const handlePrevQuestion = () => {
    setActiveQuestionIndex((i) => Math.max(0, i - 1));
  };

  const handleNextRound = () => {
    if (currentRound < 3) {
      setCurrentRound((r) => r + 1);
      setActiveQuestionIndex(0);
      setRoundCompleted(false);
    }
  };

  const isLastRound = currentRound === 3;
  const questions = getCurrentRoundQuestions();

  /** ============================
   *  LOADING STATE
   * ============================ */
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh]">
        <div className="h-16 w-16 rounded-full bg-gray-300 animate-pulse" />
        <p className="mt-4 text-gray-500">Loading interview…</p>
      </div>
    );
  }

  if (!interviewData || !mockInterviewQuestion) {
    return (
      <div className="text-center p-10 text-gray-600">
        Failed to load interview. Try again later.
      </div>
    );
  }

  /** ============================
   *  ROUND COMPLETE SCREENS
   * ============================ */
  if (roundCompleted && !isLastRound) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-10">
        <h2 className="text-2xl font-bold mb-4">
          {getCurrentRoundTitle()} Completed!
        </h2>
        <p className="text-gray-600 mb-6">
          Great job finishing Round {currentRound}.  
          Click below to start the next round.
        </p>

        <Button onClick={handleNextRound} className="px-8 py-3">
          Start Round {currentRound + 1}
        </Button>
      </div>
    );
  }

  if (roundCompleted && isLastRound) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-10">
        <h2 className="text-3xl font-bold mb-4">🎉 Interview Completed!</h2>
        <p className="text-gray-600 mb-6">
          Amazing work! You've finished all 3 rounds.
        </p>

        <Link href={`/dashboard/interview/${interviewData.mockId}/feedback`}>
          <Button className="px-8 py-3">View Final Report</Button>
        </Link>
      </div>
    );
  }

  /** ============================
   *  MAIN INTERVIEW SCREEN
   * ============================ */
  return (
    <div className="pb-20">
      {/* Heading */}
      <div className="mb-6 text-center">
        <h2 className="text-xl font-semibold">{getCurrentRoundTitle()}</h2>
        <p className="text-gray-600">
          Question {activeQuestionIndex + 1} of {questions.length}
        </p>
      </div>

      {/* Split Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* LEFT — QUESTION */}
        <QuestionsSection
          mockInterviewQuestion={questions}
          activeQuestionIndex={activeQuestionIndex}
          currentRound={currentRound}
        />

        {/* RIGHT — RECORDING SECTION */}
        <RecordAnswerSection
          mockInterviewQuestion={questions}
          activeQuestionIndex={activeQuestionIndex}
          interviewData={interviewData}
          currentRound={currentRound}
          agentType={getCurrentRoundAgent()}
        />
      </div>

      {/* NAVIGATION BUTTONS */}
      <div className="flex justify-end flex-wrap gap-6 mt-10">
        {activeQuestionIndex > 0 && (
          <Button
            onClick={handlePrevQuestion}
            className="flex items-center gap-2"
          >
            <ArrowLeft size={18} /> Previous
          </Button>
        )}

        {activeQuestionIndex < questions.length - 1 && (
          <Button
            onClick={handleNextQuestion}
            className="flex items-center gap-2"
          >
            Next <ArrowRight size={18} />
          </Button>
        )}

        {activeQuestionIndex === questions.length - 1 && (
          <Button
            onClick={handleNextQuestion}
            className="flex items-center gap-2"
          >
            Complete Round {currentRound}
          </Button>
        )}
      </div>
    </div>
  );
};

export default StartInterview;
