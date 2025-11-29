import { Lightbulb, Volume2 } from "lucide-react";
import React from "react";

const QuestionsSection = ({
  mockInterviewQuestion = [],
  activeQuestionIndex = 0,
  currentRound = 1,
}) => {
  /** ============================
   *  TEXT TO SPEECH
   * ============================ */
  const textToSpeech = (text) => {
    if (!text) return;

    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel(); // avoid overlapping voices
      const speech = new SpeechSynthesisUtterance(text);
      speech.rate = 1;
      speech.pitch = 1;
      speech.volume = 1;
      window.speechSynthesis.speak(speech);
    } else {
      alert("Sorry, your browser does not support text-to-speech.");
    }
  };

  /** ============================
   *  ROUND INSTRUCTIONS
   * ============================ */
  const getRoundInstructions = () => {
    switch (currentRound) {
      case 1:
        return "Focus on analytical thinking, decision-making, and situational judgment. Take your time to think through each scenario.";
      case 2:
        return "Demonstrate your technical skills and coding knowledge. For coding questions, you may use the code editor if needed.";
      case 3:
        return "Show your communication skills, clarity, and confidence. Structure your responses clearly and professionally.";
      default:
        return "Answer thoughtfully and demonstrate your skills.";
    }
  };

  /** ============================
   *  SAFE RENDERING CHECK
   * ============================ */
  const currentQuestion = mockInterviewQuestion[activeQuestionIndex];

  if (!mockInterviewQuestion || mockInterviewQuestion.length === 0) {
    return (
      <div className="p-5 border rounded-lg my-10 text-center text-gray-500">
        No questions available for this round.
      </div>
    );
  }

  return (
    <div className="p-5 border rounded-lg my-10 bg-white shadow-sm">
      {/* Question Navigation Pills */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {mockInterviewQuestion.map((_, index) => (
          <div
            key={index}
            className={`p-2 text-xs md:text-sm text-center rounded-full cursor-pointer transition-all
              ${
                activeQuestionIndex === index
                  ? "bg-primary text-white font-semibold shadow"
                  : "bg-secondary hover:bg-blue-100"
              }`}
          >
            Question #{index + 1}
          </div>
        ))}
      </div>

      {/* Question Text */}
      <h2 className="my-5 text-[15px] md:text-lg font-medium leading-relaxed">
        {currentQuestion?.question || "Question not available"}
      </h2>

      {/* Text-to-Speech Button */}
      <Volume2
        size={28}
        className="cursor-pointer text-primary hover:text-blue-600 transition-all"
        onClick={() => textToSpeech(currentQuestion?.question)}
      />

      {/* Instructions Panel */}
      <div className="border rounded-lg p-5 bg-blue-100 mt-10">
        <h2 className="flex gap-2 items-center text-primary font-semibold">
          <Lightbulb />
          Round {currentRound} Instructions:
        </h2>

        <p className="text-sm text-primary my-2 leading-relaxed">
          {getRoundInstructions()}
        </p>
        <p className="text-sm text-primary my-2 leading-relaxed">
          Click on <strong>Record Answer</strong> when you're ready to respond.
          At the end of the full interview, you’ll receive:
          <br />• A detailed feedback report  
          • Correct answers  
          • Comparison with your responses  
        </p>
      </div>
    </div>
  );
};

export default QuestionsSection;
