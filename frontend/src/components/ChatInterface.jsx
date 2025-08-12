import React, { useState } from "react";
import { motion } from "framer-motion";

export default function ChatInterface({ agentId }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    setLoading(true);
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ agentId, message: input }),
    });
    const data = await res.json();
    setMessages([...messages, { role: "user", text: input }, { role: "agent", text: data.reply }]);
    setInput("");
    setLoading(false);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto mb-4">
        {messages.map((msg, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mb-2 p-4 rounded-lg shadow-md ${
              msg.role === "user"
                ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white self-end"
                : "bg-gray-800 text-gray-200 self-start"
            }`}
          >
            {msg.text}
          </motion.div>
        ))}
      </div>
      <form
        className="flex gap-2"
        onSubmit={e => {
          e.preventDefault();
          if (input.trim()) sendMessage();
        }}
      >
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          className="flex-1 bg-gray-800 border border-gray-700 rounded-md p-3 text-lg focus:ring-2 focus:ring-blue-600"
          placeholder="Type your message..."
          aria-label="Chat input"
        />
        <motion.button
          type="submit"
          whileHover={{ scale: 1.05 }}
          className="bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold py-2 px-6 rounded-md hover:scale-105 transition-transform shadow-md"
          disabled={loading}
        >
          Send
        </motion.button>
      </form>
    </div>
  );
}
