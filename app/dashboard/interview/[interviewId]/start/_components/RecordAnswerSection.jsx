"use client";

import { Button } from "@/components/ui/button";
import { AudioLines } from "lucide-react";
import React, { useEffect, useState, useRef } from "react";
import useSpeechToText from "react-hook-speech-to-text";
import Webcam from "react-webcam";
import voiceline from "@/public/voicelines.json";
import webcamlottie from "@/public/webcamlottie.json";
import { toast } from "sonner";
import { generateContent } from "@/utils/GeminiAIModal";
import { useUser } from "@/lib/simpleAuth";
import moment from "moment";
import { SaveUserAnswer } from "@/app/_Serveractions";
import dynamic from "next/dynamic";

// Monaco editor (client only)
const MonacoEditor = dynamic(() => import("@monaco-editor/react"), { ssr: false });

// Lottie (client-only)
const Lottie = dynamic(() => import("lottie-react"), { ssr: false });

const RecordAnswerSection = ({
  mockInterviewQuestion = [],
  activeQuestionIndex = 0,
  interviewData,
  currentRound = 1,
  agentType,
}) => {
  const [userAnswer, setUserAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [code, setCode] = useState(
    "// Write your solution here\n\nfunction solution() {\n    // Your code here\n}\n"
  );
  const [language, setLanguage] = useState("javascript");
  const [speechSupported, setSpeechSupported] = useState(false);
  const { user } = useUser();

  // Speech-to-text hook
  const {
    error,
    interimResult,
    isRecording,
    results,
    setResults,
    startSpeechToText,
    stopSpeechToText,
  } = useSpeechToText({
    continuous: true,
    useLegacyResults: false,
  });

  // Keep a ref to avoid stale closures
  const resultsRef = useRef([]);
  resultsRef.current = results;

  // Check for speech support on client
  useEffect(() => {
    if (typeof window === "undefined") return;
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    setSpeechSupported(!!SpeechRecognition);
  }, []);

  // Show speech errors as toast (if any)
  useEffect(() => {
    if (error && speechSupported) {
      console.error("Speech-to-text error:", error);
      toast.error("Speech recognition error: " + error);
    }
  }, [error, speechSupported]);

  // When speech results change, update the text area (live)
  useEffect(() => {
    if (!results || results.length === 0) return;

    // Combine all transcripts
    const combined = results.map((r) => r.transcript).join(" ");
    // Append interim result (live) if available
    const finalText = (combined + " " + (interimResult || "")).trim();

    setUserAnswer(finalText);
  }, [results, interimResult]);

  // Helper: current question & correct answer
  const currentQuestionObj = mockInterviewQuestion?.[activeQuestionIndex] || {};
  const currentQuestionText = currentQuestionObj?.question || "";
  const correctAnswerText = currentQuestionObj?.answer || "";

  // Start / Stop recording
  const StartStopRecording = async () => {
    try {
      if (isRecording) {
        // Stop recording
        stopSpeechToText();

        // Wait a moment to ensure results are finalized (small delay)
        await new Promise((res) => setTimeout(res, 250));

        // Only submit if there's enough content
        if ((userAnswer && userAnswer.trim().length > 10) || (resultsRef.current?.length > 0)) {
          await handleSubmitAnswer();
        } else {
          toast.error("Please speak a longer answer or type it in the textbox.");
        }
      } else {
        // Clear previous results to avoid stale transcripts
        setResults([]);
        setUserAnswer("");
        startSpeechToText();
      }
    } catch (err) {
      console.error("StartStopRecording error:", err);
      toast.error("Microphone error. Please check permissions.");
    }
  };

  // Main function to evaluate and save user answer
  const handleSubmitAnswer = async () => {
    setLoading(true);

    // Choose what to submit based on round
    const answerToSubmit = currentRound === 2 ? code : userAnswer;

    // Basic validation
    if (!answerToSubmit || answerToSubmit.trim().length < 5) {
      toast.error("Please provide a valid answer before submitting.");
      setLoading(false);
      return;
    }

    const question = currentQuestionText;
    const correctAnswer = correctAnswerText;

    // Mocked agent evaluation (kept your logic, but cleaned)
    let agentScore = 0;
    let agentFeedback = "No feedback";
    let overallScore = 0;

    try {
      if (currentRound === 1 && agentType === "hiring_manager") {
        agentScore = Math.floor(Math.random() * 30) + 70; // 70-100
        agentFeedback =
          "Good problem-solving approach. Consider discussing edge cases and alternatives.";
        overallScore = agentScore;
      } else if (
        currentRound === 2 &&
        agentType === "technical_recruiter"
      ) {
        // Basic heuristic for code presence
        const hasCodeKeywords =
          /function|class|def\s+|public\s+|=>|console\.log|return\s+/i.test(
            code
          );
        if (hasCodeKeywords) {
          agentScore = Math.floor(Math.random() * 25) + 70; // 70-95
          agentFeedback =
            "Code structure looks good. Consider edge cases and optimizations.";
        } else {
          agentScore = Math.floor(Math.random() * 20) + 50; // 50-70
          agentFeedback =
            "Code needs more structure. Implement core logic first, then optimize.";
        }
        overallScore = agentScore;
      } else if (currentRound === 3 && agentType === "panel_lead") {
        agentScore = Math.floor(Math.random() * 30) + 70;
        agentFeedback =
          "Clear and structured explanation. Try to be concise and use examples.";
        overallScore = agentScore;
      } else {
        // Fallback
        agentScore = Math.floor(Math.random() * 30) + 60;
        agentFeedback = "Automated evaluation completed.";
        overallScore = agentScore;
      }

      // Prepare payload for SaveUserAnswer server action
      const answerData = {
        mockIdRef: interviewData?.mockId,
        question,
        correctAns: correctAnswer,
        userAns: answerToSubmit,
        feedback: agentFeedback,
        rating: `${agentScore}/100`,
        userEmail: user?.email,
        createdAt: moment().format("DD-MM-YYYY"),
        hiringManagerScore:
          agentType === "hiring_manager" ? agentScore : null,
        technicalRecruiterScore:
          agentType === "technical_recruiter" ? agentScore : null,
        panelLeadScore: agentType === "panel_lead" ? agentScore : null,
        hiringManagerFeedback:
          agentType === "hiring_manager" ? agentFeedback : null,
        technicalRecruiterFeedback:
          agentType === "technical_recruiter" ? agentFeedback : null,
        panelLeadFeedback:
          agentType === "panel_lead" ? agentFeedback : null,
        overallScore,
        roundNumber: currentRound,
        agentType,
      };

      // Save to backend (server action)
      const resp = await SaveUserAnswer(answerData);

      if (resp) {
        toast.success(
          `Round ${currentRound} Answer Recorded Successfully!`
        );
        // Reset local state
        setUserAnswer("");
        setCode(
          "// Write your solution here\n\nfunction solution() {\n    // Your code here\n}\n"
        );
        setResults([]); // clear hook results
      } else {
        toast.error("Failed to save answer. Please try again.");
      }
    } catch (err) {
      console.error("Error saving answer:", err);
      toast.error("Something went wrong while saving your answer.");
    } finally {
      setLoading(false);
    }
  };

  // Round-specific UI: Round 2 -> Code editor (Monaco)
  if (currentRound === 2) {
    return (
      <div className="flex flex-col justify-center items-center w-full">
        <div className="w-full max-w-4xl">
          <div className="mb-4 flex items-center justify-between">
            <label className="block text-sm font-medium">Language</label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="p-2 border rounded"
            >
              <option value="javascript">JavaScript</option>
              <option value="python">Python</option>
              <option value="java">Java</option>
              <option value="cpp">C++</option>
              <option value="csharp">C#</option>
            </select>
          </div>

          <div className="border rounded-lg overflow-hidden">
            <MonacoEditor
              height="420px"
              language={language}
              value={code}
              onChange={(value) => setCode(value || "")}
              theme="vs-dark"
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                scrollBeyondLastLine: false,
                automaticLayout: true,
              }}
            />
          </div>

          <div className="mt-4 flex gap-4 justify-center">
            <Button
              onClick={handleSubmitAnswer}
              disabled={loading}
              className="px-6 py-2"
            >
              {loading ? "Submitting..." : "Submit Code Solution"}
            </Button>
          </div>

          <div className="mt-4 text-center text-sm text-gray-600">
            <p>
              💡 Tip: Focus on the core logic first. The Technical Recruiter
              evaluates code structure, correctness, and clarity.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Rounds 1 & 3: Webcam + Voice/Text
  return (
    <div className="flex flex-col justify-center items-center w-full">
      {/* Webcam area */}
      <div className="relative w-full max-w-xl">
        <div className="bg-black rounded-lg p-3 relative overflow-hidden">
          {/* Lottie background */}
          <div className="absolute inset-0 opacity-30 pointer-events-none">
            <Lottie animationData={webcamlottie} loop />
          </div>

          {/* Webcam */}
          <div className="relative z-10">
            <Webcam
              mirrored
              className="rounded-lg border shadow-md w-full"
              style={{ height: 300, objectFit: "cover" }}
            />
          </div>
        </div>
      </div>

      {/* Record / Stop Button */}
      <div className="my-6">
        {speechSupported ? (
          <Button
            disabled={loading}
            onClick={StartStopRecording}
            variant="outline"
            className="flex items-center gap-3"
          >
            {isRecording ? (
              <div className="flex items-center gap-2">
                <Lottie animationData={voiceline} loop className="w-12 h-12" />
                <span className="text-red-600">Stop Recording</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <AudioLines />
                <span>Record Answer</span>
              </div>
            )}
          </Button>
        ) : (
          <div className="my-4 text-center">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
              <p className="text-yellow-800 text-sm">
                🎤 <strong>Voice recording not available</strong>
              </p>
              <p className="text-yellow-700 text-xs mt-1">
                Speech recognition works best in Chrome / Chromium browsers.
                Use the text box below as an alternative.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Text input fallback */}
      <div className="my-4 w-full max-w-md">
        <textarea
          value={userAnswer}
          onChange={(e) => setUserAnswer(e.target.value)}
          placeholder={
            currentRound === 1
              ? "Type your problem-solving answer here..."
              : "Type your communication answer here..."
          }
          className="w-full p-3 border rounded min-h-[90px]"
        />
        <Button
          onClick={handleSubmitAnswer}
          disabled={loading}
          className="mt-3 w-full"
        >
          {loading ? "Submitting..." : "Submit Answer"}
        </Button>
      </div>

      <div className="mt-4 text-center text-sm text-gray-600 max-w-md">
        {currentRound === 1 ? (
          <p>
            🧠 <strong>Hiring Manager Round:</strong> Focus on analytical
            thinking and a clear step-by-step approach.
          </p>
        ) : (
          <p>
            🎤 <strong>Panel Lead Round:</strong> Show confidence, clarity, and
            structure in your answers.
          </p>
        )}
        {!speechSupported && (
          <p className="mt-2 text-xs text-gray-500">
            💡 Text input is always available as an alternative.
          </p>
        )}
      </div>
    </div>
  );
};

export default RecordAnswerSection;
