import React from "react";
import ReactMarkdown from "react-markdown";
import { motion } from "framer-motion";

export default function MessageBubble({ sender, text, timestamp }) {
  const isUser = sender === "user";

  const avatar = isUser
    ? "https://ui-avatars.com/api/?name=You&background=1E40AF&color=fff"
    : "https://ui-avatars.com/api/?name=AI&background=4B5563&color=fff";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className={`my-3 flex items-end gap-3 ${
        isUser ? "justify-end" : "justify-start"
      }`}
    >
      {/* Avatar */}
      {!isUser && (
        <img
          src={avatar}
          alt="bot"
          className="w-9 h-9 rounded-full shadow border"
        />
      )}

      {/* Message Bubble */}
      <div className={`max-w-xs`}>
        <div
          className={`px-4 py-2 rounded-2xl shadow-lg leading-relaxed break-words
          ${isUser ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-800"}
        `}
        >
          <ReactMarkdown
            components={{
              ul: ({ children }) => <ul className="list-disc pl-5">{children}</ul>,
              ol: ({ children }) => <ol className="list-decimal pl-5">{children}</ol>,
              code: ({ children }) => (
                <code className="bg-gray-300 text-gray-800 px-1 rounded">
                  {children}
                </code>
              ),
              strong: ({ children }) => (
                <strong className="font-bold">{children}</strong>
              ),
            }}
          >
            {text}
          </ReactMarkdown>
        </div>

        {/* Timestamp (Optional) */}
        {timestamp && (
          <p
            className={`text-xs mt-1 ${
              isUser ? "text-right text-gray-200" : "text-left text-gray-500"
            }`}
          >
            {timestamp}
          </p>
        )}
      </div>

      {/* User Avatar */}
      {isUser && (
        <img
          src={avatar}
          alt="you"
          className="w-9 h-9 rounded-full shadow border"
        />
      )}
    </motion.div>
  );
}
