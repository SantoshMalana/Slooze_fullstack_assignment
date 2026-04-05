'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation } from '@apollo/client';
import Link from 'next/link';
import { REGISTER_MUTATION } from '@/lib/graphql/operations';
import { useAuth } from '@/context/AuthContext';

export default function SignupPage() {
  const [form, setForm] = useState({
    displayName: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    country: 'INDIA',
  });
  const [error, setError] = useState('');
  const { login } = useAuth();
  const router = useRouter();

  const [registerMutation, { loading }] = useMutation(REGISTER_MUTATION);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (form.password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    try {
      const { data } = await registerMutation({
        variables: {
          input: {
            displayName: form.displayName,
            username: form.username,
            email: form.email,
            password: form.password,
            country: form.country,
          },
        },
      });
      login(data.register.accessToken, data.register.user);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message?.replace('ApolloError: ', '') || 'Registration failed. Please try again.');
    }
  };

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
            Join your<br />team today.
          </h1>
          <p className="text-orange-100 text-lg">
            Create your account and start ordering<br />
            with role-based access control.
          </p>
          <div className="mt-8 space-y-3">
            {[
              { icon: '🔒', text: 'Email OTP verification on every login' },
              { icon: '🌍', text: 'Country-based restaurant access' },
              { icon: '⚡', text: 'Instant access after registration' },
            ].map((item) => (
              <div key={item.text} className="flex items-center gap-3">
                <span className="text-xl">{item.icon}</span>
                <span className="text-orange-100 text-sm">{item.text}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="text-orange-200 text-sm">© 2024 Slooze. All rights reserved.</div>
      </div>

      {/* Right — Signup Form */}
      <div className="flex-1 flex flex-col justify-center px-6 py-12 lg:px-16 overflow-y-auto">
        <div className="max-w-md w-full mx-auto">

          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">S</span>
            </div>
            <span className="text-white font-bold text-xl">Slooze</span>
          </div>

          <h2 className="text-3xl font-bold text-white mb-2">Create account</h2>
          <p className="text-gray-400 mb-8">
            You'll be assigned as a <span className="text-orange-400 font-medium">Member</span>. OTP login required for security.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Full Name</label>
                <input
                  className="input"
                  name="displayName"
                  placeholder="e.g. John Doe"
                  value={form.displayName}
                  onChange={handleChange}
                  required
                  id="displayName"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Username</label>
                <input
                  className="input"
                  name="username"
                  placeholder="e.g. john_doe"
                  value={form.username}
                  onChange={handleChange}
                  required
                  autoComplete="username"
                  id="username"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Email Address</label>
              <input
                className="input"
                name="email"
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={handleChange}
                required
                autoComplete="email"
                id="email"
              />
              <p className="text-xs text-gray-600 mt-1">OTP codes will be sent here on each login</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Country</label>
              <select
                className="input"
                name="country"
                value={form.country}
                onChange={handleChange}
                id="country"
              >
                <option value="INDIA">🇮🇳 India</option>
                <option value="AMERICA">🇺🇸 America</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Password</label>
              <input
                className="input"
                name="password"
                type="password"
                placeholder="Min. 8 characters"
                value={form.password}
                onChange={handleChange}
                required
                autoComplete="new-password"
                id="password"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Confirm Password</label>
              <input
                className="input"
                name="confirmPassword"
                type="password"
                placeholder="Repeat your password"
                value={form.confirmPassword}
                onChange={handleChange}
                required
                autoComplete="new-password"
                id="confirmPassword"
              />
            </div>

            {error && (
              <div className="bg-red-900/30 border border-red-800 text-red-400 rounded-lg px-4 py-3 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              id="register-btn"
              className="btn-primary w-full py-3 text-base mt-2"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Creating account...
                </span>
              ) : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Already have an account?{' '}
            <Link href="/login" className="text-orange-400 hover:text-orange-300 font-medium transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
