import React from 'react';
import { motion } from 'motion/react';
import { EventFlowLogo } from './EventFlowLogo';
import { Calendar, Users, Briefcase, MapPin, CheckSquare, MessageSquareCode, ArrowRight } from 'lucide-react';

interface LandingPageProps {
  onNavigateToAuth: (mode: 'login' | 'signup') => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigateToAuth }) => {
  return (
    <div id="landing-page" className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-150 transition-colors duration-300">
      {/* Navigation Header */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center">
            <EventFlowLogo size="md" />
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => onNavigateToAuth('login')}
              className="text-sm font-semibold text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            >
              Sign In
            </button>
            <button
              onClick={() => onNavigateToAuth('signup')}
              className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-all shadow-md shadow-indigo-600/10 hover:shadow-indigo-600/20 active:translate-y-[1px]"
            >
              Get Started
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-10 lg:py-16 overflow-hidden px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-gradient-to-tr from-indigo-50 to-indigo-100/30 dark:from-indigo-950/20 dark:to-slate-950 -z-10" />
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center px-3 py-1.5 rounded-full bg-indigo-100 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-900 text-indigo-700 dark:text-indigo-300 font-sans text-xs font-semibold uppercase tracking-wider mb-8"
          >
            Plan, Manage & Execute Events Seamlessly
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="font-sans font-black text-4xl sm:text-5xl lg:text-6.5xl tracking-tight leading-none text-slate-900 dark:text-white max-w-4xl mx-auto"
          >
            Manage Events in <span className="text-indigo-600 dark:text-indigo-400">Real-Time</span> with Live AI Automation
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-6 font-sans text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed"
          >
            A robust web-based Event Management system that unites venues, vendors, clients, staff, and live checklist custom boards. Work naturally using our Gemini AI assistant.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.45 }}
            className="mt-10 flex flex-wrap justify-center gap-4"
          >
            <button
              onClick={() => onNavigateToAuth('signup')}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-sans font-medium px-6 py-3.5 rounded-2xl flex items-center gap-2 group shadow-xl shadow-indigo-600/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              Start Planning Free <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={() => onNavigateToAuth('login')}
              className="bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-white font-sans font-medium px-6 py-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 transition-all hover:scale-[1.02]"
            >
              Access Organizer Dashboard
            </button>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 bg-white dark:bg-slate-900 px-4 sm:px-6 lg:px-8 border-y border-slate-100 dark:border-slate-800">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="font-sans font-extrabold text-3xl sm:text-4xl text-slate-900 dark:text-white tracking-tight">
              A Complete Platform for Professionals & Individuals
            </h2>
            <p className="mt-4 font-sans text-slate-500 dark:text-slate-400">
              Everything in sync, instantly. No app store downloads or complex installers required.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div id="feature-card-1" className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-indigo-500 dark:hover:border-indigo-500 transition-all">
              <div className="h-12 w-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-5">
                <Calendar className="h-6 w-6" />
              </div>
              <h3 className="font-sans font-bold text-lg text-slate-900 dark:text-white">Interactive Calendars</h3>
              <p className="mt-2 font-sans text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                Track scheduling conflicts, list events in monthly or weekly views, and immediately access details by hovering or tapping dates.
              </p>
            </div>

            {/* Feature 2 */}
            <div id="feature-card-2" className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-indigo-500 dark:hover:border-indigo-500 transition-all">
              <div className="h-12 w-12 rounded-xl bg-teal-50 dark:bg-teal-950/60 flex items-center justify-center text-teal-600 dark:text-teal-400 mb-5">
                <Users className="h-6 w-6" />
              </div>
              <h3 className="font-sans font-bold text-lg text-slate-900 dark:text-white">Client Management (CRM)</h3>
              <p className="mt-2 font-sans text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                Log detailed client records, custom booking conditions, notes, and correspondence histories for effortless single or bulk planning.
              </p>
            </div>

            {/* Feature 3 */}
            <div id="feature-card-3" className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-indigo-500 dark:hover:border-indigo-500 transition-all">
              <div className="h-12 w-12 rounded-xl bg-amber-50 dark:bg-amber-950/60 flex items-center justify-center text-amber-600 dark:text-amber-400 mb-5">
                <CheckSquare className="h-6 w-6" />
              </div>
              <h3 className="font-sans font-bold text-lg text-slate-900 dark:text-white">Custom Flexible Checklists</h3>
              <p className="mt-2 font-sans text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                Organize details inside each event by building custom headings (e.g. Catering, Logistics, Decor), and adding status-tracked sub-tasks.
              </p>
            </div>

            {/* Feature 4 */}
            <div id="feature-card-4" className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-indigo-500 dark:hover:border-indigo-500 transition-all">
              <div className="h-12 w-12 rounded-xl bg-rose-50 dark:bg-rose-950/60 flex items-center justify-center text-rose-600 dark:text-rose-400 mb-5">
                <MapPin className="h-6 w-6" />
              </div>
              <h3 className="font-sans font-bold text-lg text-slate-900 dark:text-white">Venues & Vendors Directories</h3>
              <p className="mt-2 font-sans text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                Coordinate full directories of partner venues and vendors, tracking capacity boundaries, pricing indexes, and linked services.
              </p>
            </div>

            {/* Feature 5 */}
            <div id="feature-card-5" className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-indigo-500 dark:hover:border-indigo-500 transition-all">
              <div className="h-12 w-12 rounded-xl bg-blue-50 dark:bg-blue-950/60 flex items-center justify-center text-blue-600 dark:text-blue-400 mb-5">
                <Briefcase className="h-6 w-6" />
              </div>
              <h3 className="font-sans font-bold text-lg text-slate-900 dark:text-white">Staffing Control Boards</h3>
              <p className="mt-2 font-sans text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                Register internal coordinators or external staff members, assign them to active events, track allocated hours and schedules.
              </p>
            </div>

            {/* Feature 6 */}
            <div id="feature-card-6" className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-indigo-500 dark:hover:border-indigo-500 transition-all">
              <div className="h-12 w-12 rounded-xl bg-purple-50 dark:bg-purple-950/60 flex items-center justify-center text-purple-600 dark:text-purple-400 mb-5">
                <MessageSquareCode className="h-6 w-6" />
              </div>
              <h3 className="font-sans font-bold text-lg text-slate-900 dark:text-white">Gemini Conversational Agent</h3>
              <p className="mt-2 font-sans text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                Type simple natural language instructions into our AI Chat panel to add clients, query budget reports, or assign items instantly.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-100 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-850 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center">
            <EventFlowLogo size="sm" />
          </div>
          <p className="font-sans text-xs text-slate-500 dark:text-slate-400">
            © 2026 EventFlow. Designed with ultra-high fidelity for organizers and clients alike.
          </p>
        </div>
      </footer>
    </div>
  );
};
