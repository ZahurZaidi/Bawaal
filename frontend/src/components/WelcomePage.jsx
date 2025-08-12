import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

export default function WelcomePage() {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleCreateAgent = async () => {
    setLoading(true);
    const res = await fetch("/api/create-agent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt }),
    });
    const data = await res.json();
    setLoading(false);
    if (data.agentId) navigate(`/agent/${data.agentId}`);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 bg-[#1A1A2E] bg-gradient-to-br from-purple-900 via-blue-900 to-[#1A1A2E] text-white">
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="font-bold text-4xl md:text-5xl text-center mb-8 font-poppins"
        style={{ fontFamily: "Poppins, Inter, sans-serif" }}
      >
        Hey, welcome to Varia!
      </motion.h1>
      <motion.textarea
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        aria-label="Describe your AI agent"
        rows={3}
        value={prompt}
        onChange={e => setPrompt(e.target.value)}
        placeholder="Describe your AI agent (e.g., 'Create a customer support agent for my e-commerce store')."
        className="w-full max-w-xl p-6 text-lg bg-gray-800 text-white rounded-md border border-gray-700 focus:ring-2 focus:ring-purple-600 transition-all mb-6 shadow-md"
      />
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.98 }}
        disabled={loading || !prompt.trim()}
        onClick={handleCreateAgent}
        aria-label="Create AI agent"
        className="w-full max-w-xl py-4 font-bold text-lg rounded-md bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 transition-transform shadow-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        {loading ? "Creating..." : "Create Agent"}
      </motion.button>
    </div>
  );
}
