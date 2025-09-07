"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const ShoutoutBanner = () => {
  const messages = [
    " Say goodbye to information overload!",
    "Summarize large documents instantly!",
    "Share insights with secure links!",
    "Boost productivity & collaboration!"
  ];

  const [currentText, setCurrentText] = useState("");
  const [index, setIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);


  const router = useRouter();

  const handleStart = () => {
    router.push("/features");
  };

  // Typing animation
  useEffect(() => {
    if (charIndex < messages[index].length) {
      const timeout = setTimeout(() => {
        setCurrentText((prev) => prev + messages[index][charIndex]);
        setCharIndex((prev) => prev + 1);
      }, 50);
      return () => clearTimeout(timeout);
    } else {
      // Wait before switching to next message
      const timeout = setTimeout(() => {
        setCurrentText("");
        setCharIndex(0);
        setIndex((prev) => (prev + 1) % messages.length);
      }, 2000);
      return () => clearTimeout(timeout);
    }
  }, [charIndex, index]);





  return (
    <section className="relative w-full min-h-[70vh] flex flex-col justify-center items-center text-center px-6 overflow-hidden">
      {/* Gradient background effect */}
      <div className="absolute inset-0  opacity-20 blur-3xl "></div>

      {/* Animated text */}
      <h1 className="text-3xl md:text-5xl font-extrabold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent animate-gradient-x drop-shadow-md p-2">
        {currentText}
        <span className="border-r-2 border-current ml-1 animate-pulse"></span>
      </h1>

      {/* Subtext */}
      <p className="mt-6 text-lg md:text-xl text-gray-700 max-w-2xl">
        Brief-Link helps you transform lengthy transcripts into concise, shareable summaries.  
      </p>

      {/* Call to Action Button */}
      <button
        onClick={handleStart}
        className="mt-8 px-8 py-3 rounded-xl text-lg font-semibold bg-black text-white relative overflow-hidden group"
      >
        <span className="relative z-10">Get Started</span>
        <span className="absolute inset-0 bg-gradient-to-r from-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out"></span>
      </button>
    </section>
  );
};

export default ShoutoutBanner;
