'use client';

import Link from 'next/link';
import { useQuery } from '@apollo/client';
import { useAuth } from '@/context/AuthContext';
import { GET_MY_ORDERS } from '@/lib/graphql/operations';

const statCards = (orders: any[]) => [
  {
    label: 'Total Orders',
    value: orders.length,
    color: 'text-orange-400',
    bg: 'bg-orange-500/10 border-orange-500/20',
  },
  {
    label: 'Active Orders',
    value: orders.filter((o) => o.status === 'CREATED').length,
    color: 'text-blue-400',
    bg: 'bg-blue-500/10 border-blue-500/20',
  },
  {
    label: 'Completed',
    value: orders.filter((o) => o.status === 'PAID').length,
    color: 'text-green-400',
    bg: 'bg-green-500/10 border-green-500/20',
  },
  {
    label: 'Cancelled',
    value: orders.filter((o) => o.status === 'CANCELLED').length,
    color: 'text-red-400',
    bg: 'bg-red-500/10 border-red-500/20',
  },
];

const statusStyles: Record<string, string> = {
  CREATED:   'badge-yellow',
  PAID:      'badge-green',
  CANCELLED: 'badge-red',
};

export default function DashboardPage() {
  const { user, can } = useAuth();
  const { data, loading } = useQuery(GET_MY_ORDERS);
  const orders = data?.myOrders || [];
  const recentOrders = orders.slice(0, 5);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">
          Welcome back, {user?.displayName} 👋
        </h1>
        <p className="text-gray-400 mt-1">
          {user?.role} · {user?.country === 'INDIA' ? '🇮🇳 India' : '🇺🇸 America'}
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards(orders).map((s) => (
          <div key={s.label} className={`card border ${s.bg}`}>
            <div className={`text-3xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-gray-400 text-sm mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link
            href="/restaurants"
            className="card border-gray-800 hover:border-orange-500/50 hover:bg-gray-800/50 transition-all group cursor-pointer"
          >
            <div className="text-2xl mb-3">🍽️</div>
            <div className="font-semibold text-white group-hover:text-orange-400 transition-colors">
              Browse Restaurants
            </div>
            <div className="text-gray-500 text-sm mt-1">
              View menus and place orders
            </div>
          </Link>

          <Link
            href="/orders"
            className="card border-gray-800 hover:border-blue-500/50 hover:bg-gray-800/50 transition-all group cursor-pointer"
          >
            <div className="text-2xl mb-3">📋</div>
            <div className="font-semibold text-white group-hover:text-blue-400 transition-colors">
              My Orders
            </div>
            <div className="text-gray-500 text-sm mt-1">
              Track and manage your orders
            </div>
          </Link>

          {can('managePayments') && (
            <Link
              href="/payments"
              className="card border-gray-800 hover:border-green-500/50 hover:bg-gray-800/50 transition-all group cursor-pointer"
            >
              <div className="text-2xl mb-3">💳</div>
              <div className="font-semibold text-white group-hover:text-green-400 transition-colors">
                Payment Methods
              </div>
              <div className="text-gray-500 text-sm mt-1">
                Manage cards (Admin only)
              </div>
            </Link>
          )}
        </div>
      </div>

      {/* Recent Orders */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Recent Orders</h2>
          <Link href="/orders" className="text-orange-400 hover:text-orange-300 text-sm">
            View all →
          </Link>
        </div>

        {loading ? (
          <div className="card border-gray-800 flex items-center justify-center py-12">
            <div className="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : recentOrders.length === 0 ? (
          <div className="card border-gray-800 text-center py-12">
            <div className="text-4xl mb-3">🛒</div>
            <p className="text-gray-400">No orders yet.</p>
            <Link href="/restaurants" className="btn-primary mt-4 inline-block">
              Order Now
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {recentOrders.map((order: any) => (
              <div
                key={order.id}
                className="card border-gray-800 flex items-center justify-between"
              >
                <div>
                  <div className="font-medium text-white">{order.restaurant.name}</div>
                  <div className="text-sm text-gray-500 mt-0.5">
                    {order.orderItems.length} item{order.orderItems.length !== 1 ? 's' : ''} ·{' '}
                    {new Date(order.createdAt).toLocaleDateString()}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="font-semibold text-white">
                      ₹{order.totalAmount.toFixed(2)}
                    </div>
                  </div>
                  <span className={statusStyles[order.status]}>{order.status}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Role Permissions Card */}
      <div className="card border-gray-800">
        <h3 className="font-semibold text-white mb-4">Your Permissions</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'View Restaurants', allowed: true },
            { label: 'Create Orders',    allowed: true },
            { label: 'Checkout & Pay',   allowed: can('checkout') },
            { label: 'Cancel Orders',    allowed: can('cancelOrder') },
            { label: 'Manage Payments',  allowed: can('managePayments') },
          ].map((p) => (
            <div
              key={p.label}
              className={`rounded-lg px-3 py-2.5 text-sm border ${
                p.allowed
                  ? 'bg-green-900/20 border-green-800/50 text-green-400'
                  : 'bg-gray-800/50 border-gray-700/50 text-gray-600'
              }`}
            >
              <span className="mr-1.5">{p.allowed ? '✓' : '✗'}</span>
              {p.label}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
