'use client';

import { useState, FormEvent } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { useAuth } from '@/context/AuthContext';
import {
  GET_MY_PAYMENT_METHODS,
  ADD_PAYMENT_METHOD,
  DELETE_PAYMENT_METHOD,
} from '@/lib/graphql/operations';
import { useRouter } from 'next/navigation';

export default function PaymentsPage() {
  const { can } = useAuth();
  const router = useRouter();

  // Redirect non-admins
  if (!can('managePayments')) {
    router.replace('/dashboard');
    return null;
  }

  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    type: 'CREDIT_CARD',
    cardholderName: '',
    cardNumber: '',
    expiryMonth: '',
    expiryYear: '',
    isDefault: false,
    targetUserId: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const { data, loading, refetch } = useQuery(GET_MY_PAYMENT_METHODS);
  const paymentMethods = data?.myPaymentMethods || [];

  const [addPayment, { loading: adding }] = useMutation(ADD_PAYMENT_METHOD, {
    onCompleted: () => {
      setShowForm(false);
      setSuccess('Payment method added successfully.');
      setFormData({
        type: 'CREDIT_CARD', cardholderName: '', cardNumber: '',
        expiryMonth: '', expiryYear: '', isDefault: false, targetUserId: '',
      });
      refetch();
    },
    onError: (e) => setError(e.message),
  });

  const [deletePayment, { loading: deleting }] = useMutation(DELETE_PAYMENT_METHOD, {
    onCompleted: () => { setSuccess('Payment method removed.'); refetch(); },
    onError: (e) => setError(e.message),
  });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    await addPayment({
      variables: {
        input: {
          type: formData.type,
          cardholderName: formData.cardholderName,
          cardNumber: formData.cardNumber,
          expiryMonth: parseInt(formData.expiryMonth),
          expiryYear: parseInt(formData.expiryYear),
          isDefault: formData.isDefault,
          ...(formData.targetUserId ? { targetUserId: formData.targetUserId } : {}),
        },
      },
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Payment Methods</h1>
          <p className="text-gray-400 mt-1">Admin-only — manage payment cards</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary">
          {showForm ? 'Cancel' : '+ Add Card'}
        </button>
      </div>

      {error && (
        <div className="bg-red-900/30 border border-red-800 text-red-400 rounded-lg px-4 py-3 text-sm">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-green-900/30 border border-green-800 text-green-400 rounded-lg px-4 py-3 text-sm">
          {success}
        </div>
      )}

      {/* Add Card Form */}
      {showForm && (
        <div className="card border-orange-500/30">
          <h3 className="font-semibold text-white mb-4">Add New Payment Method</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Card Type</label>
                <select
                  className="input"
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                >
                  <option value="CREDIT_CARD">Credit Card</option>
                  <option value="DEBIT_CARD">Debit Card</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Cardholder Name</label>
                <input
                  className="input"
                  placeholder="Nick Fury"
                  value={formData.cardholderName}
                  onChange={(e) => setFormData({ ...formData, cardholderName: e.target.value })}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1">Card Number</label>
              <input
                className="input"
                placeholder="•••• •••• •••• 4242"
                maxLength={19}
                value={formData.cardNumber}
                onChange={(e) => setFormData({ ...formData, cardNumber: e.target.value })}
                required
              />
              <p className="text-xs text-gray-600 mt-1">Only last 4 digits will be stored</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Expiry Month</label>
                <input
                  className="input"
                  type="number"
                  placeholder="12"
                  min={1}
                  max={12}
                  value={formData.expiryMonth}
                  onChange={(e) => setFormData({ ...formData, expiryMonth: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Expiry Year</label>
                <input
                  className="input"
                  type="number"
                  placeholder="2027"
                  min={2024}
                  value={formData.expiryYear}
                  onChange={(e) => setFormData({ ...formData, expiryYear: e.target.value })}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1">
                Target User ID (optional — leave blank to add to your own account)
              </label>
              <input
                className="input"
                placeholder="User UUID"
                value={formData.targetUserId}
                onChange={(e) => setFormData({ ...formData, targetUserId: e.target.value })}
              />
            </div>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                className="accent-orange-500"
                checked={formData.isDefault}
                onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
              />
              <span className="text-sm text-gray-300">Set as default payment method</span>
            </label>

            <button type="submit" disabled={adding} className="btn-primary w-full">
              {adding ? 'Adding...' : 'Add Payment Method'}
            </button>
          </form>
        </div>
      )}

      {/* Payment Methods List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : paymentMethods.length === 0 ? (
        <div className="card border-gray-800 text-center py-16">
          <div className="text-4xl mb-3">💳</div>
          <p className="text-gray-400">No payment methods yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {paymentMethods.map((pm: any) => (
            <div key={pm.id} className="card border-gray-800 relative">
              {pm.isDefault && (
                <span className="badge-green absolute top-4 right-4">Default</span>
              )}
              <div className="text-3xl mb-3">
                {pm.type === 'CREDIT_CARD' ? '💳' : '🏦'}
              </div>
              <div className="font-semibold text-white text-lg">
                •••• •••• •••• {pm.lastFourDigits}
              </div>
              <div className="text-gray-400 text-sm mt-1">{pm.cardholderName}</div>
              <div className="text-gray-500 text-sm">
                {pm.type.replace('_', ' ')} · Expires {pm.expiryMonth}/{pm.expiryYear}
              </div>
              <button
                onClick={() => deletePayment({ variables: { id: pm.id } })}
                disabled={deleting}
                className="btn-danger text-sm mt-4 w-full"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="card border-yellow-800/50 bg-yellow-900/10">
        <p className="text-yellow-400 text-sm">
          ⚠️ <strong>Admin only:</strong> Payment methods can only be added or removed by
          the Admin (Nick Fury). Managers and Members can view their own cards but cannot
          modify them.
        </p>
      </div>
    </div>
  );
}
