"use client";

import React, { useContext, useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader } from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import { useUser } from "@/lib/simpleAuth";
import moment from "moment";
import { useRouter } from "next/navigation";
import { CreateInterview } from "@/app/_Serveractions";
import { UserInfoContext } from "@/context/UserInfoContext";

const AddNewInterview = () => {
  const [Lottie, setLottie] = useState(null);
  const [AddNew, setAddNew] = useState(null);

  const { userInfo, setUserInfo } = useContext(UserInfoContext);
  const [openDialog, setOpenDialog] = useState(false);

  const [jobPosition, setJobPosition] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [jobExperience, setJobExperience] = useState("");

  const [loading, setLoading] = useState(false);
  const [jsonResponse, setJsonResponse] = useState([]);

  const router = useRouter();
  const { user } = useUser();

  // ⚡ Load Lottie only on client
  useEffect(() => {
    import("lottie-react").then((module) => setLottie(() => module.default));
    import("@/public/AddNew.json").then((module) => setAddNew(module.default));
  }, []);

  /** ============================
   *  HANDLE SUBMIT
   * ===========================*/
  const onSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);

    console.log(jobPosition, jobDescription, jobExperience);

    // Try to fetch user resume for personalized interview
    let resumeData = null;
    try {
      const resumeResponse = await fetch(
        `/api/resume/data?email=${encodeURIComponent(user?.email)}`
      );

      if (resumeResponse.ok) {
        const resJson = await resumeResponse.json();
        resumeData = resJson.resumeData;
        console.log("Resume Found:", resumeData);
      }
    } catch (e) {
      console.log("Resume fetch failed:", e);
    }

    /** ============================
     *  BUILD AI PROMPT
     * ===========================*/
    let InputPrompt = `job position: ${jobPosition}, Job Description: ${jobDescription}, Year of Experience: ${jobExperience}.`;

    if (resumeData) {
      InputPrompt += `\n\nCandidate Profile:`;

      if (resumeData.skills) {
        InputPrompt += `\nSkills: ${
          typeof resumeData.skills === "string"
            ? resumeData.skills
            : JSON.stringify(resumeData.skills)
        }`;
      }

      if (resumeData.experience) {
        InputPrompt += `\nExperience: ${resumeData.experience.substring(
          0,
          500
        )}`;
      }

      if (resumeData.projects) {
        InputPrompt += `\nProjects: ${resumeData.projects.substring(0, 500)}`;
      }

      InputPrompt += `

Generate a complete 3-round interview structure with 5 questions per round:

🟦 ROUND 1 — Hiring Manager Round  
🟩 ROUND 2 — Technical Recruiter Round  
🟧 ROUND 3 — Panel Lead Round  

Return ONLY JSON:
{
  "round1": [...],
  "round2": [...],
  "round3": [...]
}`;
    } else {
      InputPrompt += `
Generate a complete 3-round interview structure with 5 questions per round.
Return ONLY JSON:
{
  "round1": [...],
  "round2": [...],
  "round3": [...]
}`;
    }

    console.log("FINAL PROMPT:", InputPrompt);

    try {
      // ✨ Mock JSON (your original)
      const MockJsonResp = JSON.stringify({
        round1: [
          {
            question:
              "Describe a challenging project you worked on and how you overcame obstacles.",
            answer:
              "Should show problem-solving, leadership, and adaptability.",
            type: "problem_solving",
          },
          {
            question:
              "How would you handle a delayed project deadline with limited resources?",
            answer:
              "Demonstrate prioritization, communication, and decision-making.",
            type: "problem_solving",
          },
          {
            question:
              "Tell me about a time you made a difficult technical decision.",
            answer:
              "Look for structured thinking and justification of the choice.",
            type: "problem_solving",
          },
          {
            question:
              "How do you approach debugging complex system failures?",
            answer: "Expect systematic thinking steps.",
            type: "problem_solving",
          },
          {
            question: "How do you evaluate new tools/frameworks?",
            answer: "Expect clarity, pros/cons, research approach.",
            type: "problem_solving",
          },
        ],
        round2: [
          {
            question: "Reverse a linked list.",
            answer: "Expect iterative/recursive O(n) solution.",
            type: "coding",
          },
          {
            question: "SQL query for second-highest salary.",
            answer: "Subquery or window function.",
            type: "coding",
          },
          {
            question: "Explain controlled React form component.",
            answer:
              "Expect understanding of state, re-render and controlled inputs.",
            type: "coding",
          },
          {
            question: "Build a TTL-based cache.",
            answer: "Expect Map, expiry, cleanup strategy.",
            type: "coding",
          },
          {
            question: "Check if parentheses are balanced.",
            answer: "Stack-based solution expected.",
            type: "coding",
          },
        ],
        round3: [
          {
            question:
              "Explain a technical concept to a non-technical stakeholder.",
            answer:
              "Look for clarity, simplification, analogy use, communication.",
            type: "communication",
          },
          {
            question: "How do you respond to criticism?",
            answer:
              "Expect maturity, willingness to learn, growth mindset.",
            type: "communication",
          },
          {
            question: "How do you mentor juniors?",
            answer:
              "Expect empathy, structured guidance, leadership qualities.",
            type: "communication",
          },
          {
            question: "How do you manage remote team communication?",
            answer: "Expect clarity, tools, asynchronous updates.",
            type: "communication",
          },
          {
            question: "Convince others to adopt your idea.",
            answer: "Expect confidence, reasoning, structure.",
            type: "communication",
          },
        ],
      });

      setJsonResponse(MockJsonResp);

      // Save to DB
      const interviewData = {
        mockId: uuidv4(),
        jsonMockResp: MockJsonResp,
        jobPosition,
        jobDescription,
        jobExperience,
        createdBy: user?.email,
        createdAt: moment().format("DD-MM-YYYY"),
      };

      const resp = await CreateInterview(interviewData);

      if (resp) {
        setOpenDialog(false);
        router.push("/dashboard/interview/" + resp[0]?.mockId);
      }
    } catch (error) {
      console.error("AI Generation Error:", error);
    }

    setLoading(false);
  };

  return (
    <div>
      {/* Add New Section */}
      <div
        className="p-10 border-2 border-dashed border-primary rounded-lg bg-secondary hover:scale-105 hover:shadow-md cursor-pointer transition-all"
        onClick={() => setOpenDialog(true)}
      >
        <h2 className="flex justify-center items-center font-medium text-lg text-center">
          {Lottie && AddNew ? (
            <Lottie animationData={AddNew} loop className="h-16" />
          ) : (
            <div className="h-16 w-16 bg-gray-300 rounded animate-pulse"></div>
          )}
          Add New
        </h2>
      </div>

      {/* Dialog */}
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl">
              Tell us more about your interview
            </DialogTitle>
            <DialogDescription>
              Add job details — Position, Description & Experience
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={onSubmit}>
            <div className="mt-7 my-3">
              <label className="font-semibold">Job Role / Position</label>
              <Input
                onChange={(e) => setJobPosition(e.target.value)}
                placeholder="Ex. Full Stack Developer"
                required
              />
            </div>

            <div className="mt-7 my-3">
              <label className="font-semibold">
                Job Description / Tech Stack
              </label>
              <Textarea
                onChange={(e) => setJobDescription(e.target.value)}
                required
                placeholder="Ex. React, Angular, NodeJS, SQL"
              />
            </div>

            <div className="mt-7 my-3">
              <label className="font-semibold">Years of Experience</label>
              <Input
                onChange={(e) => setJobExperience(e.target.value)}
                required
                placeholder="Ex. 3"
                type="number"
                max="30"
                min="0"
              />
            </div>

            {/* Buttons */}
            <div className="flex gap-5 justify-end">
              <Button
                onClick={() => setOpenDialog(false)}
                type="button"
                variant="ghost"
                disabled={loading}
                className={`hover:border hover:border-gray-500 ${
                  loading && "hidden"
                }`}
              >
                Cancel
              </Button>

              <Button type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <Loader className="animate-spin mr-2" /> Generating from AI
                  </>
                ) : (
                  "Start Interview"
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AddNewInterview;
