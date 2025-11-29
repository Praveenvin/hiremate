"use client";
import React, { useEffect, useState } from "react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronsUpDown, House, Trophy, Target, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import Lottie from "lottie-react";
import NoResultFound from "@/public/NoResultFound.json";

const Feedback = ({ params }) => {
  const [feedbackList, setFeedbackList] = useState([]);
  const [roundReports, setRoundReports] = useState([]);
  const [finalReport, setFinalReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // ---------------------------------------------
  // Fetch Feedback for this Interview ID
  // ---------------------------------------------
  useEffect(() => {
    GetFeedback();
  }, []);

  const GetFeedback = async () => {
    try {
      const response = await fetch(`/api/feedback?mockId=${params.interviewId}`);
      if (!response.ok) throw new Error("Failed to fetch feedback");

      const data = await response.json();
      const answers = data.feedback || [];

      setFeedbackList(answers);

      if (answers.length > 0) {
        await generateRoundReports(answers);
        await generateFinalReport(answers);
      }
    } catch (error) {
      console.error("Error fetching Feedback:", error);
    } finally {
      setLoading(false);
    }
  };

  // ---------------------------------------------
  // Round-Based Reports
  // ---------------------------------------------
  const generateRoundReports = async (answers) => {
    const reports = [];

    for (let round = 1; round <= 3; round++) {
      const roundAnswers = answers.filter(a => a.roundNumber === round);
      if (roundAnswers.length === 0) continue;

      const avgScore = Math.round(
        roundAnswers.reduce((sum, a) => sum + a.overallScore, 0) / roundAnswers.length
      );

      let summaryReport = "";
      let strengths = "";
      let weaknesses = "";
      let recommendation = "";
      let agentType = "";

      if (round === 1) {
        agentType = "hiring_manager";
        summaryReport = `Round 1 completed with an average problem-solving score of ${avgScore}/100.`;
        recommendation = avgScore >= 75 ? "proceed" : "needs_improvement";
        strengths = avgScore >= 75 ? "Strong analytical and decision-making ability." : "Shows potential but needs more problem-solving practice.";
        weaknesses = avgScore < 75 ? "Could improve in tackling edge cases." : "Minor improvements possible.";
      }

      if (round === 2) {
        agentType = "technical_recruiter";
        summaryReport = `Round 2 completed with an average technical score of ${avgScore}/100.`;
        recommendation = avgScore >= 70 ? "proceed" : "needs_improvement";
        strengths = avgScore >= 70 ? "Good technical understanding." : "Understands basics but needs deeper technical clarity.";
        weaknesses = avgScore < 70 ? "Needs stronger coding fundamentals." : "Could improve efficiency.";
      }

      if (round === 3) {
        agentType = "panel_lead";
        summaryReport = `Round 3 completed with an average communication score of ${avgScore}/100.`;
        recommendation = avgScore >= 75 ? "proceed" : "needs_improvement";
        strengths = avgScore >= 75 ? "Clear communication skills." : "Good intent but needs better articulation.";
        weaknesses = avgScore < 75 ? "Could structure responses better." : "Minor clarity improvements needed.";
      }

      const report = {
        mockId: params.interviewId,
        roundNumber: round,
        agentType,
        averageScore: avgScore,
        summaryReport,
        recommendation,
        strengths,
        weaknesses,
        createdAt: new Date().toISOString(),
      };

      reports.push(report);

      // Save to backend (optional)
      try {
        await fetch("/api/round-reports", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(report),
        });
      } catch {
        console.warn("Unable to save round report (client cleanup mode).");
      }
    }

    setRoundReports(reports);
  };

  // ---------------------------------------------
  // Final Report (All Rounds Combined)
  // ---------------------------------------------
  const generateFinalReport = async (answers) => {
    if (!answers.length) return;

    const calc = (list) =>
      list.length
        ? Math.round(list.reduce((s, a) => s + a.overallScore, 0) / list.length)
        : 0;

    const round1Score = calc(answers.filter(a => a.roundNumber === 1));
    const round2Score = calc(answers.filter(a => a.roundNumber === 2));
    const round3Score = calc(answers.filter(a => a.roundNumber === 3));

    const overallScore = Math.round((round1Score + round2Score + round3Score) / 3);

    let hiringDecision = "";
    let strengths = "";
    let weaknesses = "";
    let improvementRoadmap = "";

    if (overallScore >= 80) {
      hiringDecision = "hire";
      strengths = "Strong performance across all rounds.";
      weaknesses = "Only minor improvements needed.";
      improvementRoadmap = "Enhance leadership and advanced technical expertise.";
    } else if (overallScore >= 70) {
      hiringDecision = "needs_improvement";
      strengths = "Good foundation and consistency.";
      weaknesses = "Needs improvement in specific problem-solving areas.";
      improvementRoadmap = "Focus on communication clarity and deepening technical skills.";
    } else {
      hiringDecision = "reject";
      strengths = "Shows willingness to learn.";
      weaknesses = "Needs stronger fundamentals across all domains.";
      improvementRoadmap = "Improve coding, communication, and structured thinking.";
    }

    const finalData = {
      mockId: params.interviewId,
      userEmail: answers[0]?.userEmail,
      round1Score,
      round2Score,
      round3Score,
      overallScore,
      hiringDecision,
      strengths,
      weaknesses,
      improvementRoadmap,
      createdAt: new Date().toISOString(),
    };

    setFinalReport(finalData);

    try {
      await fetch("/api/final-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(finalData),
      });
    } catch {
      console.warn("Unable to save final report (client cleanup mode).");
    }
  };

  // ---------------------------------------------
  // Round Icon
  // ---------------------------------------------
  const getRoundIcon = (round) => {
    switch (round) {
      case 1: return <Target className="h-5 w-5" />;
      case 2: return <Trophy className="h-5 w-5" />;
      case 3: return <MessageSquare className="h-5 w-5" />;
      default: return null;
    }
  };

  const getRoundTitle = (round) => {
    return (
      {
        1: "🟦 Round 1 — Hiring Manager (Problem-Solving)",
        2: "🟩 Round 2 — Technical Recruiter (Coding)",
        3: "🟧 Round 3 — Panel Lead (Communication)",
      }[round] || `Round ${round}`
    );
  };

  // ---------------------------------------------
  // Loading Screen
  // ---------------------------------------------
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Preparing your feedback report...</p>
        </div>
      </div>
    );
  }

  // ---------------------------------------------
  // MAIN UI
  // ---------------------------------------------
  return (
    <div className="p-10">
      {feedbackList.length === 0 ? (
        <div className="flex flex-col justify-center items-center">
          <Lottie animationData={NoResultFound} loop className="w-8/12 h-96" />
          <p className="font-bold">No Interview Feedback found!</p>
        </div>
      ) : (
        <>
          <h2 className="text-3xl font-bold text-green-500">🎉 Interview Complete!</h2>
          <h2 className="font-bold text-2xl mb-4">Your 3-Round Feedback Report</h2>

          {/* ---------------- FINAL REPORT ---------------- */}
          {finalReport && (
            <div className="bg-blue-50 p-6 rounded-lg mb-8 border">
              <h3 className="text-xl font-bold mb-4">📊 Final Interview Report</h3>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                <ScoreBox label="Problem-Solving" score={finalReport.round1Score} color="blue" />
                <ScoreBox label="Technical" score={finalReport.round2Score} color="green" />
                <ScoreBox label="Communication" score={finalReport.round3Score} color="purple" />
                <ScoreBox label="Overall" score={finalReport.overallScore} color="orange" />
              </div>

              <HiringDecisionBadge decision={finalReport.hiringDecision} />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <InfoBox title="💪 Strengths" text={finalReport.strengths} color="green" />
                <InfoBox title="🎯 Improvement Areas" text={finalReport.weaknesses} color="red" />
              </div>

              <InfoBox
                title="🚀 Improvement Roadmap"
                text={finalReport.improvementRoadmap}
                color="blue"
                className="mt-4"
              />
            </div>
          )}

          {/* ---------------- ROUND REPORTS ---------------- */}
          {roundReports.map((report, idx) => (
            <div key={idx} className="mb-6 border rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                {getRoundIcon(report.roundNumber)}
                <h3 className="font-semibold">{getRoundTitle(report.roundNumber)}</h3>
                <span className="ml-auto font-bold">{report.averageScore}/100</span>
              </div>
              <p className="text-sm text-gray-600">{report.summaryReport}</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mt-2">
                <div><strong className="text-green-700">Strengths:</strong> {report.strengths}</div>
                <div><strong className="text-red-700">Weaknesses:</strong> {report.weaknesses}</div>
              </div>
            </div>
          ))}

          {/* ---------------- QUESTION FEEDBACK ---------------- */}
          <h3 className="text-xl font-bold mt-6 mb-4">📝 Detailed Question Feedback</h3>

          {feedbackList.map((item, index) => (
            <Collapsible key={item._id || index} className="mt-4">
              <CollapsibleTrigger className="flex justify-between items-center p-3 bg-secondary border border-black rounded-lg w-full text-left hover:bg-gray-100">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium bg-blue-100 px-2 py-1 rounded">
                      Round {item.roundNumber}
                    </span>
                    <span className="text-sm text-gray-600">Question {index + 1}</span>
                  </div>
                  <p className="text-sm">{item.question}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold">{item.overallScore}/100</span>
                  <ChevronsUpDown />
                </div>
              </CollapsibleTrigger>

              <CollapsibleContent>
                <div className="p-4 bg-gray-50 rounded-lg mt-2 flex flex-col gap-4">
                  {/* Agent Scores */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {item.hiringManagerScore && (
                      <AgentCard
                        title="Hiring Manager"
                        score={item.hiringManagerScore}
                        feedback={item.hiringManagerFeedback}
                        color="blue"
                      />
                    )}
                    {item.technicalRecruiterScore && (
                      <AgentCard
                        title="Technical Recruiter"
                        score={item.technicalRecruiterScore}
                        feedback={item.technicalRecruiterFeedback}
                        color="green"
                      />
                    )}
                    {item.panelLeadScore && (
                      <AgentCard
                        title="Panel Lead"
                        score={item.panelLeadScore}
                        feedback={item.panelLeadFeedback}
                        color="purple"
                      />
                    )}
                  </div>

                  {/* User Answer */}
                  <QuestionBox title="Your Answer" text={item.userAns} />

                  {/* Correct Answer */}
                  <QuestionBox title="Expected Answer" text={item.correctAns} color="green" />
                </div>
              </CollapsibleContent>
            </Collapsible>
          ))}
        </>
      )}

      <div className="flex justify-center mt-10">
        <Button onClick={() => router.replace("/dashboard")} className="flex gap-2">
          <House /> Go Home
        </Button>
      </div>
    </div>
  );
};

export default Feedback;

// ---------------------------------------------
// Helper UI Components (clean, reusable)
// ---------------------------------------------
const ScoreBox = ({ label, score, color }) => (
  <div className="text-center bg-white border p-3 rounded">
    <div className={`text-2xl font-bold text-${color}-600`}>{score}/100</div>
    <div className="text-sm text-gray-600">{label}</div>
  </div>
);

const HiringDecisionBadge = ({ decision }) => {
  const styles = {
    hire: "bg-green-100 text-green-800",
    needs_improvement: "bg-yellow-100 text-yellow-800",
    reject: "bg-red-100 text-red-800",
  };

  return (
    <div className="my-3">
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${styles[decision]}`}>
        {decision === "hire" ? "✅ Hire" :
        decision === "needs_improvement" ? "⚠️ Needs Improvement" :
        "❌ Reject"}
      </span>
    </div>
  );
};

const InfoBox = ({ title, text, color }) => (
  <div className={`p-4 border rounded bg-${color}-50`}>
    <h4 className={`font-semibold text-${color}-700 mb-1`}>{title}</h4>
    <p className="text-sm">{text}</p>
  </div>
);

const AgentCard = ({ title, score, feedback, color }) => (
  <div className={`p-3 border rounded bg-${color}-50`}>
    <div className={`font-medium text-${color}-800`}>{title}</div>
    <div className="text-lg font-bold">{score}/100</div>
    <div className={`text-xs text-${color}-700 mt-1`}>{feedback}</div>
  </div>
);

const QuestionBox = ({ title, text, color }) => (
  <div>
    <h4 className="font-medium mb-1">{title}</h4>
    <div className={`p-3 border rounded bg-${color ? color + "-50" : "white"} text-sm`}>
      {text}
    </div>
  </div>
);
