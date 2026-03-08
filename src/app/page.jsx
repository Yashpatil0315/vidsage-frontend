"use client";
import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Play, Sparkles, MessageCircle, PlayCircle, Send } from 'lucide-react';
import api from '../lib/api';

const LandingPage = () => {
  const router = useRouter();

  useEffect(() => {
    // Automatically redirect to dashboard if the user is already logged in
    api.get("/user/me")
      .then(() => {
        router.replace("/dashbord");
      })
      .catch(() => {
        // Not authenticated, just stay on the landing page
      });
  }, [router]);

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      {/* Navigation */}
      <nav className="flex items-center justify-between px-4 md:px-8 py-3 md:py-4 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
            <Sparkles className="text-white w-5 h-5" />
          </div>
          <span className="font-bold text-xl tracking-tight">Vidsage</span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
          <a href="#" className="hover:text-indigo-600 transition-colors">Features</a>
          <a href="#" className="hover:text-indigo-600 transition-colors">Pricing</a>
          <a href="#" className="hover:text-indigo-600 transition-colors">Community</a>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/login" className="text-sm font-medium hover:text-indigo-600 transition-colors">Login</Link>
          <Link href="/register" className="bg-indigo-600 text-white px-5 py-2 rounded-full text-sm font-semibold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200">
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-12 md:pt-20 pb-16 md:pb-32 px-4 text-center bg-gradient-to-b from-indigo-50/50 to-white">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold uppercase tracking-wider mb-8">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-600"></span>
          </span>
          The Future of Collaborative Learning
        </div>

        <h1 className="text-3xl sm:text-5xl md:text-7xl font-extrabold tracking-tight mb-4 md:mb-6">
          Learn Smarter, <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-500">
            Together.
          </span>
        </h1>

        <p className="max-w-2xl mx-auto text-base md:text-lg text-slate-600 mb-6 md:mb-10 leading-relaxed px-2">
          Transform educational videos into interactive learning experiences with AI-powered collaboration.
          Upload, discuss, and master any subject.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-8 md:mb-16 px-4">
          <Link href="/register" className="w-full sm:w-auto px-8 py-4 bg-indigo-600 text-white rounded-xl font-bold text-lg hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 shadow-xl shadow-indigo-200 group">
            Get started for free
            <span className="group-hover:translate-x-1 transition-transform">→</span>
          </Link>
          <Link href="/login" className="w-full sm:w-auto px-8 py-4 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold text-lg hover:bg-slate-50 transition-all text-center">
            Sign in to account
          </Link>
        </div>

        {/* Video Placeholder */}
        <div className="max-w-5xl mx-auto relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-1000"></div>
          <div className="relative aspect-video rounded-2xl bg-gradient-to-br from-teal-100 to-indigo-100 flex items-center justify-center border border-white/20 shadow-2xl overflow-hidden">
            <div className="w-20 h-20 bg-white/40 backdrop-blur-md rounded-full flex items-center justify-center cursor-pointer hover:scale-110 transition-transform">
              <Play className="text-indigo-600 fill-indigo-600 ml-1" size={32} />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 md:py-24 px-4 md:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Designed for modern learners</h2>
          <p className="text-slate-500">Everything you need to turn passive watching into active understanding.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <FeatureCard
            icon={<Sparkles className="text-indigo-600" />}
            title="AI Question Answering"
            desc="Instant answers to your toughest questions. Our AI understands video context."
          />
          <FeatureCard
            icon={<MessageCircle className="text-indigo-600" />}
            title="Collaborative Discussions"
            desc="Study with friends or join global study groups. Share timestamps and notes."
          />
          <FeatureCard
            icon={<PlayCircle className="text-indigo-600" />}
            title="Interactive Video Tools"
            desc="Interactive quizzes, dynamic chaptering, and automated summaries."
          />
        </div>
      </section>
    </div>
  );
};

const FeatureCard = ({ icon, title, desc }) => (
  <div className="p-8 bg-slate-50/50 rounded-2xl border border-transparent hover:border-indigo-100 hover:bg-white transition-all group">
    <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
      {icon}
    </div>
    <h3 className="text-xl font-bold mb-3">{title}</h3>
    <p className="text-slate-600 leading-relaxed">{desc}</p>
  </div>
);

export default LandingPage;
