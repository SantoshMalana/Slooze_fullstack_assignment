'use client';

import { useState, FormEvent, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useMutation } from '@apollo/client';
import Link from 'next/link';
import { LOGIN_MUTATION, VERIFY_OTP_MUTATION } from '@/lib/graphql/operations';
import { useAuth } from '@/context/AuthContext';

type Step = 'credentials' | 'otp';

export default function LoginPage() {
  const [step, setStep] = useState<Step>('credentials');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [userId, setUserId] = useState('');
  const [maskedEmail, setMaskedEmail] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const justRegistered = searchParams.get('registered') === 'true';
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const [loginMutation, { loading: loggingIn }] = useMutation(LOGIN_MUTATION);
  const [verifyOtp, { loading: verifying }] = useMutation(VERIFY_OTP_MUTATION);

  // Step 1: Username + password
  const handleCredentials = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const { data } = await loginMutation({ variables: { username, password } });
      const result = data.login;

      if (!result.requiresOtp) {
        // Demo / seeded user → direct login, no OTP needed
        login(result.accessToken, result.user);
        router.push('/dashboard');
      } else {
        // Registered user → show OTP step
        setUserId(result.userId);
        setMaskedEmail(result.maskedEmail);
        setStep('otp');
      }
    } catch (err: any) {
      setError(err.message?.replace('ApolloError: ', '') || 'Invalid credentials. Please try again.');
    }
  };

  // Step 2: OTP verify (only for registered new users)
  const handleVerifyOtp = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    const otp = otpDigits.join('');
    if (otp.length < 6) { setError('Please enter the complete 6-digit code.'); return; }
    try {
      const { data } = await verifyOtp({ variables: { userId, otp } });
      login(data.verifyOtp.accessToken, data.verifyOtp.user);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message?.replace('ApolloError: ', '') || 'Invalid OTP. Please try again.');
      setOtpDigits(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newDigits = [...otpDigits];
    newDigits[index] = value.slice(-1);
    setOtpDigits(newDigits);
    if (value && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    const newDigits = [...otpDigits];
    pasted.split('').forEach((ch, i) => { if (i < 6) newDigits[i] = ch; });
    setOtpDigits(newDigits);
    inputRefs.current[Math.min(pasted.length, 5)]?.focus();
  };

  const quickLogin = (u: string) => { setUsername(u); setPassword('password123'); };

  const demoUsers = [
    { username: 'nick_fury',       label: 'Nick Fury',        role: 'Admin',         flag: '🌍' },
    { username: 'captain_marvel',  label: 'Captain Marvel',   role: 'Manager India',  flag: '🇮🇳' },
    { username: 'captain_america', label: 'Captain America',  role: 'Manager US',     flag: '🇺🇸' },
    { username: 'thanos',          label: 'Thanos',           role: 'Member India',   flag: '🇮🇳' },
    { username: 'thor',            label: 'Thor',             role: 'Member India',   flag: '🇮🇳' },
    { username: 'travis',          label: 'Travis',           role: 'Member US',      flag: '🇺🇸' },
  ];

  return (
    <div className="min-h-screen bg-gray-950 flex">
      {/* Left — Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-orange-600 via-orange-500 to-amber-500 flex-col justify-between p-12">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center">
            <span className="text-orange-500 font-bold text-lg">S</span>
          </div>
          <span className="text-white font-bold text-2xl">Slooze</span>
        </div>
        <div>
          <h1 className="text-5xl font-bold text-white leading-tight mb-4">
            Food ordering<br />made smart.
          </h1>
          <p className="text-orange-100 text-lg">
            Role-based access. Country-aware teams.<br />
            One platform for your whole organisation.
          </p>
        </div>
        <div className="text-orange-200 text-sm">© 2024 Slooze. All rights reserved.</div>
      </div>

      {/* Right — Auth Form */}
      <div className="flex-1 flex flex-col justify-center px-6 py-12 lg:px-16">
        <div className="max-w-md w-full mx-auto">

          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-10 lg:hidden">
            <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">S</span>
            </div>
            <span className="text-white font-bold text-xl">Slooze</span>
          </div>

          {/* ─── STEP 1: Credentials ─── */}
          {step === 'credentials' && (
            <>
              <h2 className="text-3xl font-bold text-white mb-2">Welcome back</h2>
              <p className="text-gray-400 mb-8">Sign in to your account</p>

              {justRegistered && (
                <div className="mb-6 bg-green-900/30 border border-green-800 text-green-400 rounded-lg px-4 py-3 text-sm">
                  ✅ Account created! Please sign in to receive your login OTP.
                </div>
              )}

              <form onSubmit={handleCredentials} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">Username</label>
                  <input
                    className="input"
                    placeholder="e.g. nick_fury"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    autoComplete="username"
                    id="username"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">Password</label>
                  <input
                    className="input"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                    id="password"
                  />
                </div>

                {error && (
                  <div className="bg-red-900/30 border border-red-800 text-red-400 rounded-lg px-4 py-3 text-sm">
                    {error}
                  </div>
                )}

                <button type="submit" disabled={loggingIn} id="signin-btn" className="btn-primary w-full py-3 text-base">
                  {loggingIn ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Loading...
                    </span>
                  ) : 'Sign In / Send OTP'}
                </button>
              </form>

              <p className="text-center text-sm text-gray-500 mt-6">
                New to Slooze?{' '}
                <Link href="/signup" className="text-orange-400 hover:text-orange-300 font-medium transition-colors">
                  Create an account
                </Link>
              </p>

              {/* Quick login for demo */}
              <div className="mt-8">
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-px flex-1 bg-gray-800" />
                  <p className="text-xs text-gray-500 uppercase tracking-wider">Demo users</p>
                  <div className="h-px flex-1 bg-gray-800" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {demoUsers.map((u) => (
                    <button
                      key={u.username}
                      onClick={() => quickLogin(u.username)}
                      id={`quick-${u.username}`}
                      className="text-left bg-gray-900 hover:bg-gray-800 border border-gray-800 hover:border-orange-800/50 rounded-lg px-3 py-2.5 transition-all"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-base">{u.flag}</span>
                        <div>
                          <div className="text-xs font-medium text-white">{u.label}</div>
                          <div className="text-xs text-gray-500">{u.role}</div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
                <p className="text-xs text-gray-600 mt-2">Password for all: password123</p>
              </div>
            </>
          )}

          {/* ─── STEP 2: OTP verification (new registered users only) ─── */}
          {step === 'otp' && (
            <>
              <div className="mb-8">
                <div className="w-14 h-14 bg-orange-500/10 border border-orange-500/30 rounded-2xl flex items-center justify-center mb-5">
                  <span className="text-3xl">📧</span>
                </div>
                <h2 className="text-3xl font-bold text-white mb-2">Check your email</h2>
                <p className="text-gray-400">
                  We sent a 6-digit code to<br />
                  <span className="text-orange-400 font-medium">{maskedEmail}</span>
                </p>
              </div>

              <form onSubmit={handleVerifyOtp} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-3">Enter your code</label>
                  <div className="flex gap-2 justify-between" onPaste={handleOtpPaste}>
                    {otpDigits.map((digit, i) => (
                      <input
                        key={i}
                        ref={(el) => { inputRefs.current[i] = el; }}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(i, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(i, e)}
                        id={`otp-${i}`}
                        className="w-12 h-14 text-center text-2xl font-bold bg-gray-900 border border-gray-700 rounded-xl text-white focus:border-orange-500 focus:ring-1 focus:ring-orange-500 focus:outline-none transition-colors"
                      />
                    ))}
                  </div>
                </div>

                {error && (
                  <div className="bg-red-900/30 border border-red-800 text-red-400 rounded-lg px-4 py-3 text-sm">
                    {error}
                  </div>
                )}

                <button type="submit" disabled={verifying} id="verify-btn" className="btn-primary w-full py-3 text-base">
                  {verifying ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Verifying...
                    </span>
                  ) : 'Verify & Sign In'}
                </button>
              </form>

              <div className="mt-6 flex items-center gap-4">
                <button
                  onClick={() => { setStep('credentials'); setError(''); setOtpDigits(['','','','','','']); }}
                  className="text-sm text-gray-500 hover:text-gray-300 transition-colors"
                  id="back-btn"
                >
                  ← Back
                </button>
                <span className="text-gray-700">·</span>
                <button
                  onClick={() => handleCredentials({ preventDefault: () => {} } as FormEvent)}
                  className="text-sm text-orange-500 hover:text-orange-400 transition-colors"
                  id="resend-btn"
                >
                  Resend code
                </button>
              </div>
              <p className="text-xs text-gray-600 mt-3">Code expires in 10 minutes.</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
