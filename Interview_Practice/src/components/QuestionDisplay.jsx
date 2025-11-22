import React from "react";

const QuestionDisplay = ({ question, questionNumber, totalQuestions }) => {
  if (!question) return null;

  return (
    <div className="w-full bg-white shadow-md rounded-xl p-6 mb-6 border border-gray-200">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-700">
          Question {questionNumber}/{totalQuestions}
        </h2>
      </div>

      {/* Question Text */}
      <p className="text-xl font-medium text-gray-900 leading-relaxed">
        {question}
      </p>
    </div>
  );
};

export default QuestionDisplay;
