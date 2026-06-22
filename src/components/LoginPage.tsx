import React, { useState } from 'react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../firebase';
import { EventFlowLogo } from './EventFlowLogo';
import { Mail, Lock, ArrowLeft, LogIn, UserPlus } from 'lucide-react';

interface LoginPageProps {
  initialMode: 'login' | 'signup';
  onBackToLanding: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ initialMode, onBackToLanding }) => {
  const [isLoginMode, setIsLoginMode] = useState(initialMode === 'login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Email+Password Auth Handler
  const handleEmailAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg('Please specify both email and password.');
      return;
    }
    setErrorMsg('');
    setIsSubmitting(true);

    try {
      if (isLoginMode) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
    } catch (err: any) {
      console.error('Email Auth Error:', err);
      // Clean error messages for users
      if (err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found') {
        setErrorMsg('Invalid email or password combination.');
      } else if (err.code === 'auth/email-already-in-use') {
        setErrorMsg('An account already exists under this email address.');
      } else if (err.code === 'auth/weak-password') {
        setErrorMsg('Password should be at least 6 characters long.');
      } else {
        setErrorMsg(err.message || 'Authentication failed. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Google OAuth Popup Entry
  const handleGoogleSignIn = async () => {
    setErrorMsg('');
    setIsSubmitting(true);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err: any) {
      console.error('Google Sign-In Error:', err);
      if (err.code === 'auth/popup-blocked') {
        setErrorMsg('Sign-in popup block active. Please allow popups for this page.');
      } else if (err.code === 'auth/closed-by-user') {
        setErrorMsg('Sign-in was closed before completion.');
      } else {
        setErrorMsg(err.message || 'Google Authentication cancelled or failed.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div id="login-signup-container" className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md">
        {/* Back Link */}
        <button
          onClick={onBackToLanding}
          className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 mb-8 font-sans font-medium transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back to home
        </button>

        {/* Auth Card */}
        <div id="auth-card" className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-850 shadow-2xl p-8 sm:p-10">
          <div className="flex flex-col items-center text-center">
            <EventFlowLogo size="lg" className="mb-4" />
            <h2 className="font-sans font-black text-2xl text-slate-900 dark:text-white mt-1">
              {isLoginMode ? 'Welcome Back!' : 'Create Your Account'}
            </h2>
            <p className="font-sans text-sm text-slate-500 dark:text-slate-400 mt-2 max-w-xs">
              {isLoginMode 
                ? 'Sign in to coordinate and manage your real-time schedules.' 
                : 'Plan your events seamlessly. Singularity and performance.'}
            </p>
          </div>

          {errorMsg && (
            <div className="mt-6 p-4 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-450 rounded-xl text-xs font-sans font-medium">
              {errorMsg}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleEmailAuthSubmit} className="mt-8 space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-350 uppercase tracking-widest pl-1 mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                  <Mail className="h-5 w-5" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@email.com"
                  className="w-full pl-11 pr-4 py-3.5 bg-slate-50 dark:bg-slate-850/60 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 dark:focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-2xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-550 text-sm outline-none transition-all"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-350 uppercase tracking-widest pl-1 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                  <Lock className="h-5 w-5" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-11 pr-4 py-3.5 bg-slate-50 dark:bg-slate-850/60 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 dark:focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-2xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-550 text-sm outline-none transition-all"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 text-white font-sans font-semibold py-4 rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/10 transition-all hover:shadow-indigo-600/20 active:translate-y-[1px] cursor-pointer"
            >
              {isSubmitting ? (
                <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : isLoginMode ? (
                <>
                  <LogIn className="h-5 w-5" /> Sign In
                </>
              ) : (
                <>
                  <UserPlus className="h-5 w-5" /> Create Account
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200 dark:border-slate-800" />
            </div>
            <div className="relative flex justify-center text-xs uppercase pl-3 pr-3 font-bold font-sans tracking-widest text-slate-400 dark:text-slate-500 bg-white dark:bg-slate-900">
              Or Connect With
            </div>
          </div>

          {/* Google Sign In */}
          <button
            onClick={handleGoogleSignIn}
            disabled={isSubmitting}
            className="w-full bg-white dark:bg-slate-850/60 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-800 font-sans font-semibold py-3.5 rounded-2xl flex items-center justify-center gap-2 transition-all hover:scale-[1.01] cursor-pointer"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                className="fill-blue-500"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                className="fill-green-500"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.85z"
                className="fill-yellow-500"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.85c.87-2.6 3.3-4.53 6.16-4.53z"
                className="fill-red-500"
              />
            </svg>
            Continue with Google
          </button>

          {/* Toggle Block */}
          <div className="mt-8 text-center text-sm font-sans">
            <span className="text-slate-500 dark:text-slate-400">
              {isLoginMode ? 'New to EventFlow?' : 'Already have an account?'}
            </span>{' '}
            <button
              onClick={() => setIsLoginMode(!isLoginMode)}
              className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
            >
              {isLoginMode ? 'Create Account' : 'Sign In'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
