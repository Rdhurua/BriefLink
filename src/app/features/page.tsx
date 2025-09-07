"use client";
import Navbar from "../components/Navbar";
import Features from "../components/Features";

export default function FeaturesPage() {
  return (
    <>
      <Navbar />
      <section className="mt-12 px-6">
        <Features />
      </section>
    </>
  );
}
