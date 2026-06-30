import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Check, Zap, Menu, X, Brain, TrendingUp, UtensilsCrossed, Dumbbell, BellRing, BarChart3 } from 'lucide-react';

// Navbar Component
function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <motion.header
      className={`fixed top-0 z-50 w-full transition-all duration-300 ${
        scrolled
          ? 'border-b border-[#e9e5ff] bg-white/80 backdrop-blur-xl'
          : 'border-b border-transparent bg-transparent'
      }`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="mx-auto flex max-w-[1400px] items-center justify-between px-6 py-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-[1rem] border border-black/20 bg-gradient-to-br from-[#4112d0] via-[#5a3be7] to-[#818cf8] p-[2px] shadow-[0_12px_28px_rgba(90,59,231,0.24)] group-hover:shadow-[0_16px_36px_rgba(90,59,231,0.32)] transition-all">
            <div className="flex h-full w-full items-center justify-center rounded-[0.8rem] bg-white">
              <img
                src="/promptpal_logo.png"
                alt="Promptpal logo"
                className="h-6 w-6 rounded-lg object-contain"
                onError={(e) => { e.target.style.display = 'none'; }}
              />
            </div>
          </div>
          <span style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 700, fontSize: 16, color: '#4112d0', letterSpacing: '-0.01em' }} className="hidden sm:inline text-sm">
            Promptpal
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-2 rounded-full border border-[#e9e5ff] bg-white/70 px-2 py-2 shadow-[0_8px_30px_rgba(90,59,231,0.06)] backdrop-blur-sm">
          <a href="#features" className="rounded-full px-4 py-2 text-sm font-medium text-[#474555] transition hover:bg-[#f1ecfa] hover:text-[#4112d0]">
            Features
          </a>
          <a href="#why" className="rounded-full px-4 py-2 text-sm font-medium text-[#474555] transition hover:bg-[#f1ecfa] hover:text-[#4112d0]">
            Why Promptpal
          </a>
          <a href="#how" className="rounded-full px-4 py-2 text-sm font-medium text-[#474555] transition hover:bg-[#f1ecfa] hover:text-[#4112d0]">
            How It Works
          </a>
        </nav>

        {/* Auth Buttons */}
        <div className="hidden md:flex items-center gap-3">
          <Link
            to="/login"
            className="rounded-full px-4 py-2 text-sm font-medium text-[#474555] transition hover:bg-[#f1ecfa] hover:text-[#4112d0]"
          >
            Log In
          </Link>
          <Link
            to="/signup"
            className="rounded-full bg-gradient-to-r from-[#4112d0] to-[#5a3be7] px-5 py-2 text-sm font-semibold text-white shadow-[0_10px_24px_rgba(90,59,231,0.25)] transition hover:shadow-[0_14px_32px_rgba(90,59,231,0.35)] hover:scale-[1.03]"
          >
            Sign Up
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2 text-[#4112d0]"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="md:hidden border-t border-[#e9e5ff] bg-white px-6 py-4 space-y-4"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <a href="#features" className="block text-sm font-medium text-[#474555] hover:text-[#4112d0]">
              Features
            </a>
            <a href="#why" className="block text-sm font-medium text-[#474555] hover:text-[#4112d0]">
              Why Promptpal
            </a>
            <a href="#how" className="block text-sm font-medium text-[#474555] hover:text-[#4112d0]">
              How It Works
            </a>
            <div className="flex gap-2 pt-2">
              <Link to="/login" className="flex-1 rounded-full px-3 py-2 text-sm font-medium text-center text-[#474555] bg-[#f1ecfa]">
                Log In
              </Link>
              <Link to="/signup" className="flex-1 rounded-full px-3 py-2 text-sm font-semibold text-center text-white bg-gradient-to-r from-[#4112d0] to-[#5a3be7]">
                Sign Up
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}

// Hero Section Component
function HeroSection() {
  return (
    <section className="relative min-h-screen overflow-hidden bg-[#fcf8ff] pt-24">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full blur-3xl bg-gradient-to-r from-[#4112d0]/20 via-[#5a3be7]/15 to-transparent" />
        <div className="absolute -bottom-40 -right-40 h-96 w-96 rounded-full blur-3xl bg-gradient-to-l from-[#818cf8]/20 to-transparent" />
      </div>

      <div className="relative z-10 mx-auto max-w-[1400px] px-6 py-20 lg:py-24">
        <div className="flex flex-col items-center text-center space-y-10 md:space-y-12">
          {/* Logo Center */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.1 }}
          >
            <div className="relative flex h-24 w-24 items-center justify-center rounded-[2rem] border border-black/20 bg-gradient-to-br from-[#4112d0] via-[#5a3be7] to-[#818cf8] p-1 shadow-[0_16px_48px_rgba(90,59,231,0.32)]">
              <div className="flex h-full w-full items-center justify-center rounded-[1.8rem] bg-white">
                <img
                  src="/promptpal_logo.png"
                  alt="Promptpal logo"
                  className="h-16 w-16 rounded-2xl object-contain"
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
              </div>
            </div>
          </motion.div>

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="max-w-3xl space-y-8 rounded-[2rem] border border-white/80 bg-white/70 px-6 py-10 shadow-[0_30px_90px_rgba(90,59,231,0.12)] backdrop-blur-xl sm:px-10 lg:px-14 lg:py-12"
          >
            <div>
              <motion.div
                className="inline-flex items-center gap-2 rounded-full border border-[#818cf8]/30 bg-[#818cf8]/10 px-4 py-2 mb-4"
                whileHover={{ scale: 1.05 }}
              >
                <Zap size={16} className="text-[#5a3be7]" />
                <span className="text-xs font-semibold text-[#4112d0]">Personalized AI Intelligence</span>
              </motion.div>

              <h1 style={{ fontFamily: "'Manrope', sans-serif" }} className="text-5xl md:text-6xl lg:text-7xl font-800 text-[#1c1a24] leading-[1.05] tracking-[-0.03em] mb-6">
                Your Wellness.
                <br />
                <span className="bg-gradient-to-r from-[#4112d0] via-[#5a3be7] to-[#818cf8] bg-clip-text text-transparent">
                  Personalized by AI.
                </span>
              </h1>

              <p className="mx-auto max-w-2xl text-lg leading-relaxed text-[#5f5b6f] md:text-xl">
                Get AI-powered wellness recommendations tailored to your age, skin type, hair type, and body goals. Track your progress free for 21 days.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link
                  to="/signup"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#4112d0] to-[#5a3be7] px-8 py-4 font-semibold text-white shadow-lg shadow-[#5a3be7]/40 hover:shadow-[0_16px_40px_rgba(90,59,231,0.5)] transition-all"
                >
                  Start Your AI Analysis
                  <ArrowRight size={18} />
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <a
                  href="#features"
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-[#818cf8] bg-white px-8 py-4 font-semibold text-[#4112d0] hover:bg-[#f7f1ff] transition-all"
                >
                  Explore Features
                  <ArrowRight size={18} />
                </a>
              </motion.div>
            </div>

            <p className="text-sm text-[#787587] text-center">
              ✨ Free 21-day tracking • No credit card required
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// Features Section Component
function FeaturesSection() {
  const features = [
    {
      icon: '✨',
      title: 'AI Skin Intelligence',
      description: 'Personalized skincare guidance powered by advanced AI analysis of your unique skin type.',
      gradient: 'from-cyan-500/10 to-blue-500/10',
      borderGradient: 'from-cyan-400 to-blue-400',
    },
    {
      icon: '💫',
      title: 'Hair Wellness Tracking',
      description: 'Adaptive hair recommendations for scalp health, growth, and styling based on your needs.',
      gradient: 'from-violet-500/10 to-purple-500/10',
      borderGradient: 'from-violet-400 to-purple-400',
    },
    {
      icon: '💪',
      title: 'Body Wellness Optimization',
      description: 'Fitness and wellness routines tailored to your goals with real-time progress tracking.',
      gradient: 'from-emerald-500/10 to-teal-500/10',
      borderGradient: 'from-emerald-400 to-teal-400',
    },
    {
      icon: '📊',
      title: 'Smart Progress Tracking',
      description: 'Monitor improvements using AI-powered wellness scoring and detailed analytics.',
      gradient: 'from-amber-500/10 to-orange-500/10',
      borderGradient: 'from-amber-400 to-orange-400',
    },
    {
      icon: '🛍️',
      title: 'Smart Product Recommendations',
      description: 'Curated product suggestions matched to your skincare, hair, and wellness needs.',
      gradient: 'from-pink-500/10 to-rose-500/10',
      borderGradient: 'from-pink-400 to-rose-400',
    },
  ];

  return (
    <section id="features" className="relative py-24 bg-white lg:py-28">
      <div className="mx-auto max-w-[1400px] px-6">
        {/* Section Header */}
        <motion.div
          className="mb-16 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#818cf8]/30 bg-[#818cf8]/10 px-4 py-2">
            <Zap size={16} className="text-[#5a3be7]" />
            <span className="text-xs font-semibold uppercase tracking-[0.24em] text-[#4112d0]">Core Features</span>
          </div>
          <h2 style={{ fontFamily: "'Manrope', sans-serif" }} className="text-4xl md:text-5xl font-800 text-[#1c1a24] mb-4 tracking-[-0.02em]">
            Personalized to You
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-[#787587]">
            Every recommendation is powered by AI that learns your unique profile.
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, i) => (
            <motion.div
              key={i}
              className={`group rounded-[1.75rem] border border-[#e9e5ff] bg-gradient-to-br ${feature.gradient} p-7 shadow-[0_18px_60px_rgba(90,59,231,0.08)] backdrop-blur-sm transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_24px_70px_rgba(90,59,231,0.15)] hover:border-[#818cf8] cursor-pointer`}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -8 }}
            >
              <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">{feature.icon}</div>
              <h3 style={{ fontFamily: "'Manrope', sans-serif" }} className="text-xl font-700 text-[#1c1a24] mb-3">
                {feature.title}
              </h3>
              <p className="text-[#787587] leading-relaxed">
                {feature.description}
              </p>
              <div className={`mt-4 h-1 rounded-full bg-gradient-to-r ${feature.borderGradient} w-0 group-hover:w-12 transition-all duration-500`} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Why PromptPal Section
function WhyPromptPalSection() {
  const benefits = [
    { icon: '👤', title: 'Personalized by Age', description: 'AI learns from your age group wellness patterns' },
    { icon: '🎯', title: 'Skin Type Analysis', description: 'Tailored skincare routines for your unique skin' },
    { icon: '💇', title: 'Hair Type Matching', description: 'Specific hair health recommendations' },
    { icon: '🏋️', title: 'Body Goal Tracking', description: 'Fitness routines aligned with your objectives' },
  ];

  return (
    <section id="why" className="relative py-24 bg-gradient-to-b from-[#fcf8ff] to-white lg:py-28">
      <div className="mx-auto max-w-[1400px] px-6">
        <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] items-center rounded-[2.5rem] border border-[#e9e5ff] bg-white/80 p-8 shadow-[0_24px_80px_rgba(90,59,231,0.08)] backdrop-blur-md md:p-10 lg:p-12">
          {/* Left: Heading */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 style={{ fontFamily: "'Manrope', sans-serif" }} className="text-5xl md:text-6xl font-800 text-[#1c1a24] leading-[1.1] tracking-[-0.03em]">
              Smart. Personalized.
              <br />
              AI-Powered Wellness.
            </h2>
          </motion.div>

          {/* Right: Content & Features */}
          <motion.div
            className="space-y-8"
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <p className="text-lg text-[#5f5b6f] leading-relaxed">
              Promptpal:Personalized Skin,Hair and Body Wellness combines advanced AI intelligence with personalized wellness systems to create adaptive daily routines specifically designed for your modern lifestyle. No generic advice. No one-size-fits-all solutions. Just intelligent, personalized wellness backed by real product recommendations.
            </p>

            {/* Benefits Grid */}
            <div className="grid grid-cols-2 gap-6">
              {benefits.map((benefit, i) => (
                <motion.div
                  key={i}
                  className="rounded-[1.25rem] border border-[#e9e5ff] bg-gradient-to-br from-[#4112d0]/6 to-[#5a3be7]/6 p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_16px_45px_rgba(90,59,231,0.12)]"
                  whileHover={{ y: -4, scale: 1.01 }}
                >
                  <div className="text-3xl mb-3">{benefit.icon}</div>
                  <h4 style={{ fontFamily: "'Manrope', sans-serif" }} className="font-700 text-[#1c1a24] mb-2">{benefit.title}</h4>
                  <p className="text-sm text-[#787587]">{benefit.description}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// How It Works Section
function HowItWorksSection() {
  const steps = [
    {
      number: '01',
      title: 'Share Your Profile',
      description: 'Tell us your age, skin type, hair type, and body wellness goals. Our AI learns what matters to you.',
      icon: '📝',
    },
    {
      number: '02',
      title: 'Get Personalized Plans',
      description: 'Receive AI-powered skincare, haircare, and fitness routines tailored to you. Plus curated product recommendations.',
      icon: '🎯',
    },
    {
      number: '03',
      title: 'Track & Improve',
      description: 'Follow your personalized plan for 21 days free. See real results with AI-powered progress tracking and smart reminders.',
      icon: '✅',
    },
  ];

  return (
    <section id="how" className="relative py-24 bg-white lg:py-28">
      <div className="mx-auto max-w-[1400px] px-6">
        {/* Section Header */}
        <motion.div
          className="mb-16 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 style={{ fontFamily: "'Manrope', sans-serif" }} className="text-4xl md:text-5xl font-800 text-[#1c1a24] mb-4">
            How It Works
          </h2>
          <p className="text-lg text-[#787587] max-w-2xl mx-auto">
            Get your personalized wellness plan in three simple steps.
          </p>
        </motion.div>

        {/* Steps */}
        <div className="grid gap-8 md:grid-cols-3 relative">
          {/* Connecting Lines (visible on desktop) */}
          <div className="hidden md:block absolute top-32 left-[8%] right-[8%] h-1 bg-gradient-to-r from-transparent via-[#818cf8]/30 to-transparent" />

          {steps.map((step, i) => (
            <motion.div
              key={i}
              className="relative"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              viewport={{ once: true }}
            >
              {/* Number Circle */}
              <motion.div
                className="absolute top-0 left-0 h-16 w-16 rounded-full bg-gradient-to-br from-[#4112d0] to-[#5a3be7] shadow-lg shadow-[#5a3be7]/30 flex items-center justify-center text-2xl font-800 text-white z-10"
                whileHover={{ scale: 1.2, rotate: 360 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                {step.icon}
              </motion.div>

              {/* Card */}
              <div className="rounded-[1.75rem] border border-[#e9e5ff] bg-gradient-to-br from-white to-[#f7f1ff] p-8 pt-24 shadow-[0_16px_50px_rgba(15,23,42,0.04)] transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_24px_60px_rgba(90,59,231,0.12)]">
                <span style={{ fontFamily: "'Manrope', sans-serif" }} className="text-sm font-700 text-[#4112d0]">{step.number}</span>
                <h3 style={{ fontFamily: "'Manrope', sans-serif" }} className="text-2xl font-700 text-[#1c1a24] mt-3 mb-3">
                  {step.title}
                </h3>
                <p className="text-[#787587] leading-relaxed">
                  {step.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}



// Future Scope Section
function FutureScopeSection() {
  const futureFeatures = [
    {
      icon: Brain,
      title: 'AI Wellness Coach',
      description: 'Personal AI coach that continuously adapts your wellness routine based on your habits and progress.',
    },
    {
      icon: TrendingUp,
      title: 'AI Progress Analysis',
      description: 'Advanced AI insights to identify trends, improvements and wellness patterns over time.',
    },
    {
      icon: UtensilsCrossed,
      title: 'AI Meal Planner',
      description: 'Personalized daily meal recommendations generated according to body goals, allergies and nutrition requirements.',
    },
    {
      icon: Dumbbell,
      title: 'AI Workout Planner',
      description: 'AI-generated workout plans customized for fitness level, body goals and daily activity.',
    },
    {
      icon: BellRing,
      title: 'Smart AI Reminders',
      description: 'Intelligent reminders for skincare, workouts, hydration, sleep and healthy routines.',
    },
    {
      icon: BarChart3,
      title: 'Premium Analytics Dashboard',
      description: 'Comprehensive wellness analytics with long-term progress tracking and advanced health insights.',
    },
  ];

  return (
    <section className="relative py-24 bg-gradient-to-b from-white to-[#fcf8ff] lg:py-28">
      <div className="mx-auto max-w-[1400px] px-6">
        <motion.div
          className="mb-14 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#818cf8]/30 bg-[#818cf8]/10 px-4 py-2">
            <Zap size={16} className="text-[#5a3be7]" />
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#4112d0]">Future Scope</span>
          </div>
          <h2 style={{ fontFamily: "'Manrope', sans-serif" }} className="text-4xl md:text-5xl font-800 text-[#1c1a24] mb-4">
            Where Promptpal Is Headed
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-[#787587]">
            A visionary roadmap of intelligent features designed to make wellness guidance even more adaptive, personal, and actionable.
          </p>
        </motion.div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {futureFeatures.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                className="group relative overflow-hidden rounded-[1.75rem] border border-[#e9e5ff] bg-white/80 p-8 shadow-[0_16px_50px_rgba(90,59,231,0.08)] backdrop-blur-sm transition-all duration-500 hover:-translate-y-2 hover:border-[#818cf8] hover:shadow-[0_24px_70px_rgba(90,59,231,0.16)]"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.06 }}
                viewport={{ once: true }}
                whileHover={{ y: -8, scale: 1.02 }}
              >
                <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#4112d0] via-[#5a3be7] to-[#818cf8]" />
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl border border-[#e9e5ff] bg-gradient-to-br from-[#4112d0]/10 to-[#5a3be7]/10 text-[#4112d0] transition-transform duration-300 group-hover:scale-110">
                  <Icon size={20} />
                </div>
                <h3 style={{ fontFamily: "'Manrope', sans-serif" }} className="mb-3 text-xl font-700 text-[#1c1a24]">
                  {feature.title}
                </h3>
                <p className="leading-relaxed text-[#787587]">{feature.description}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// CTA Section
function CTASection() {
  return (
    <section className="relative py-24 bg-white lg:py-28">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full blur-3xl bg-gradient-to-r from-[#4112d0]/20 via-[#5a3be7]/15 to-transparent" />
        <div className="absolute -bottom-40 -right-40 h-96 w-96 rounded-full blur-3xl bg-gradient-to-l from-[#818cf8]/20 to-transparent" />
      </div>

      <div className="relative z-10 mx-auto max-w-[1200px] px-6">
        <motion.div
          className="rounded-[2rem] border border-[#e9e5ff] bg-gradient-to-br from-[#4112d0]/12 via-[#5a3be7]/10 to-[#818cf8]/12 px-8 py-16 text-center shadow-[0_24px_80px_rgba(90,59,231,0.10)] backdrop-blur-xl md:px-12 md:py-20"
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 style={{ fontFamily: "'Manrope', sans-serif" }} className="text-4xl md:text-5xl font-800 text-[#1c1a24] mb-4">
            Ready to Transform
            <br />
            <span className="bg-gradient-to-r from-[#4112d0] via-[#5a3be7] to-[#818cf8] bg-clip-text text-transparent">
              Your Wellness?
            </span>
          </h2>
          <p className="text-lg text-[#787587] max-w-2xl mx-auto mb-8">
            Get AI-powered recommendations in minutes. Track free for 21 days. No credit card required.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link
                to="/signup"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#4112d0] to-[#5a3be7] px-8 py-4 font-semibold text-white shadow-lg shadow-[#5a3be7]/40 hover:shadow-[0_16px_40px_rgba(90,59,231,0.5)] transition-all"
              >
                Get Started
                <ArrowRight size={18} />
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link
                to="/login"
                className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-[#4112d0] bg-white px-8 py-4 font-semibold text-[#4112d0] hover:bg-[#f7f1ff] transition-all"
              >
                Sign In
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// Footer Component
function Footer() {
  return (
    <footer className="border-t border-[#e9e5ff] bg-white py-10">
      <div className="mx-auto flex max-w-[1400px] items-center justify-center px-6">
        <a
          href="mailto:promptpalwellness@gmail.com"
          className="rounded-full border border-[#e9e5ff] bg-[#faf8ff] px-5 py-2.5 text-sm font-medium text-[#4112d0] shadow-sm transition hover:-translate-y-0.5 hover:bg-[#f1ecfa] hover:text-[#5a3be7]"
        >
          promptpalwellness@gmail.com
        </a>
      </div>
    </footer>
  );
}

// Main Landing Page
export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#fcf8ff] overflow-hidden" style={{ fontFamily: "'Inter', sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;600;700;800&family=Inter:wght@400;500;600;700&display=swap');`}</style>
      
      <Navbar />
      <HeroSection />
      <FeaturesSection />
      <WhyPromptPalSection />
      <HowItWorksSection />
      <FutureScopeSection />
      <CTASection />
      <Footer />
    </div>
  );
}
