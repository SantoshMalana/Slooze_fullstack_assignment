'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation } from '@apollo/client';
import { LOGIN_MUTATION } from '@/lib/graphql/operations';
import { useAuth } from '@/context/AuthContext';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const router = useRouter();

  const [loginMutation, { loading }] = useMutation(LOGIN_MUTATION);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const { data } = await loginMutation({ variables: { username, password } });
      login(data.login.accessToken, data.login.user);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Login failed. Check your credentials.');
    }
  };

  const quickLogin = (u: string) => {
    setUsername(u);
    setPassword('password123');
  };

  const demoUsers = [
    { username: 'nick_fury',       label: 'Nick Fury',        role: 'Admin',         country: '🌍' },
    { username: 'captain_marvel',  label: 'Captain Marvel',   role: 'Manager India',  country: '🇮🇳' },
    { username: 'captain_america', label: 'Captain America',  role: 'Manager US',     country: '🇺🇸' },
    { username: 'thanos',          label: 'Thanos',           role: 'Member India',   country: '🇮🇳' },
    { username: 'thor',            label: 'Thor',             role: 'Member India',   country: '🇮🇳' },
    { username: 'travis',          label: 'Travis',           role: 'Member US',      country: '🇺🇸' },
  ];

  return (
    <div className="min-h-screen bg-gray-950 flex">
      {/* Left — Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-orange-600 via-orange-500 to-amber-500 flex-col justify-between p-12">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center">
              <span className="text-orange-500 font-bold text-lg">S</span>
            </div>
            <span className="text-white font-bold text-2xl">Slooze</span>
          </div>
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

      {/* Right — Login Form */}
      <div className="flex-1 flex flex-col justify-center px-6 py-12 lg:px-16">
        <div className="max-w-md w-full mx-auto">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-10 lg:hidden">
            <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">S</span>
            </div>
            <span className="text-white font-bold text-xl">Slooze</span>
          </div>

          <h2 className="text-3xl font-bold text-white mb-2">Welcome back</h2>
          <p className="text-gray-400 mb-8">Sign in to your account</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">
                Username
              </label>
              <input
                className="input"
                placeholder="e.g. nick_fury"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                autoComplete="username"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">
                Password
              </label>
              <input
                className="input"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </div>

            {error && (
              <div className="bg-red-900/30 border border-red-800 text-red-400 rounded-lg px-4 py-3 text-sm">
                {error}
              </div>
            )}

            <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-base">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Signing in...
                </span>
              ) : (
                'Sign in'
              )}
            </button>
          </form>

          {/* Quick login for demo */}
          <div className="mt-8">
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-3">
              Quick login — demo users
            </p>
            <div className="grid grid-cols-2 gap-2">
              {demoUsers.map((u) => (
                <button
                  key={u.username}
                  onClick={() => quickLogin(u.username)}
                  className="text-left bg-gray-900 hover:bg-gray-800 border border-gray-800 hover:border-gray-700 rounded-lg px-3 py-2.5 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{u.country}</span>
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
        </div>
      </div>
    </div>
  );
}
