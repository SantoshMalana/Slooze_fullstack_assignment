'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import clsx from 'clsx';

const navLinks = [
  { href: '/dashboard',   label: 'Dashboard' },
  { href: '/restaurants', label: 'Restaurants' },
  { href: '/orders',      label: 'My Orders' },
  { href: '/payments',    label: 'Payments' },
];

const roleBadgeStyles: Record<string, string> = {
  ADMIN:   'badge-orange',
  MANAGER: 'badge-blue',
  MEMBER:  'badge-green',
};

export default function Navbar() {
  const { user, logout, can } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  // Payments page only visible to admin
  const visibleLinks = navLinks.filter((link) => {
    if (link.href === '/payments') return can('managePayments');
    return true;
  });

  return (
    <nav className="bg-gray-900 border-b border-gray-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold text-sm">S</span>
            </div>
            <span className="text-white font-bold text-lg">Slooze</span>
          </Link>

          {/* Nav Links */}
          <div className="hidden md:flex items-center gap-1">
            {visibleLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={clsx(
                  'px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                  pathname === link.href
                    ? 'bg-gray-800 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800'
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* User section */}
          {user && (
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2.5">
                <div className="text-right">
                  <div className="text-sm font-medium text-white">{user.displayName}</div>
                  <div className="text-xs text-gray-500">
                    {user.country === 'INDIA' ? '🇮🇳' : '🇺🇸'} {user.country}
                  </div>
                </div>
                <span className={roleBadgeStyles[user.role]}>{user.role}</span>
              </div>
              <button
                onClick={handleLogout}
                className="text-gray-400 hover:text-white text-sm px-3 py-2 rounded-lg hover:bg-gray-800 transition-colors"
              >
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
