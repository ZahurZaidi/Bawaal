import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import ChatInterface from "./ChatInterface";

const TABS = ["Manage Agent", "Chat", "Knowledge Base"];

export default function AgentPage() {
  const { agentId } = useParams();
  const [tab, setTab] = useState(TABS[0]);
  const navigate = useNavigate();

  // TODO: Fetch agent details, etc.

  return (
    <div className="min-h-screen bg-[#1A1A2E] flex flex-col">
      <header className="flex items-center p-6 bg-gradient-to-r from-purple-600 to-blue-600 shadow-md">
        <button
          onClick={() => navigate("/")}
          aria-label="Back to welcome"
          className="mr-4 text-white hover:text-blue-200 transition"
        >
          ← Back
        </button>
        <h2 className="font-bold text-2xl md:text-3xl text-white">Agent Name</h2>
      </header>
      <div className="flex flex-1">
        {/* Sidebar */}
        <nav className="w-56 bg-[#0F172A] p-6 flex flex-col gap-4 shadow-md rounded-lg">
          {TABS.map(t => (
            <motion.button
              key={t}
              onClick={() => setTab(t)}
              whileHover={{ scale: 1.05 }}
              className={`py-2 px-4 rounded-md font-bold text-lg text-left transition-all ${
                tab === t
                  ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white"
                  : "bg-gray-800 text-gray-300"
              }`}
              aria-label={t}
            >
              {t}
            </motion.button>
          ))}
        </nav>
        {/* Main Content */}
        <motion.div
          key={tab}
          initial={{ x: 40, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="flex-1 p-8"
        >
          {tab === "Manage Agent" && (
            <div className="bg-gray-900 rounded-lg shadow-md p-8 text-gray-200">
              {/* Agent details form */}
              <form className="flex flex-col gap-4">
                <input className="bg-gray-800 border border-gray-700 rounded-md p-3 text-lg focus:ring-2 focus:ring-purple-600" placeholder="Agent Name" />
                <textarea className="bg-gray-800 border border-gray-700 rounded-md p-3 text-lg focus:ring-2 focus:ring-purple-600" placeholder="Agent Description" />
                <button className="self-end bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold py-2 px-6 rounded-md hover:scale-105 transition-transform shadow-md">Save</button>
              </form>
            </div>
          )}
          {tab === "Chat" && <ChatInterface agentId={agentId} />}
          {tab === "Knowledge Base" && (
            <div className="bg-gray-900 rounded-lg shadow-md p-8 text-gray-200">
              {/* File upload/input */}
              <form className="flex flex-col gap-4">
                <input type="file" className="bg-gray-800 border border-gray-700 rounded-md p-3 text-lg focus:ring-2 focus:ring-blue-600" aria-label="Upload file" />
                <textarea className="bg-gray-800 border border-gray-700 rounded-md p-3 text-lg focus:ring-2 focus:ring-blue-600" placeholder="Paste knowledge text here" />
                <button className="self-end bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold py-2 px-6 rounded-md hover:scale-105 transition-transform shadow-md">Upload</button>
              </form>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
