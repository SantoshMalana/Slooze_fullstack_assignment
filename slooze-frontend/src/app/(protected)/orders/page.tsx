'use client';

import { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { useAuth } from '@/context/AuthContext';
import {
  GET_MY_ORDERS,
  GET_MY_PAYMENT_METHODS,
  CHECKOUT_ORDER,
  CANCEL_ORDER,
} from '@/lib/graphql/operations';
import { formatCurrency } from '@/lib/utils';
import clsx from 'clsx';

const statusStyles: Record<string, string> = {
  CREATED:   'badge-yellow',
  PAID:      'badge-green',
  CANCELLED: 'badge-red',
};

export default function OrdersPage() {
  const { can } = useAuth();
  const [checkoutOrderId, setCheckoutOrderId] = useState<string | null>(null);
  const [selectedPaymentId, setSelectedPaymentId] = useState('');
  const [actionError, setActionError] = useState('');

  const { data: ordersData, loading: ordersLoading, refetch } = useQuery(GET_MY_ORDERS);
  const { data: paymentsData } = useQuery(GET_MY_PAYMENT_METHODS);

  const orders = ordersData?.myOrders || [];
  const paymentMethods = paymentsData?.myPaymentMethods || [];

  const [checkoutOrder, { loading: checkingOut }] = useMutation(CHECKOUT_ORDER, {
    onCompleted: () => { setCheckoutOrderId(null); refetch(); },
    onError: (e) => setActionError(e.message),
  });

  const [cancelOrder, { loading: cancelling }] = useMutation(CANCEL_ORDER, {
    onCompleted: () => refetch(),
    onError: (e) => setActionError(e.message),
  });

  const handleCheckout = async () => {
    if (!checkoutOrderId || !selectedPaymentId) return;
    setActionError('');
    await checkoutOrder({
      variables: { orderId: checkoutOrderId, paymentMethodId: selectedPaymentId },
    });
  };

  const handleCancel = async (orderId: string) => {
    setActionError('');
    await cancelOrder({ variables: { orderId } });
  };

  if (ordersLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Orders</h1>
        <p className="text-gray-400 mt-1">Manage and track your food orders</p>
      </div>

      {actionError && (
        <div className="bg-red-900/30 border border-red-800 text-red-400 rounded-lg px-4 py-3 text-sm">
          {actionError}
        </div>
      )}

      {/* Checkout Modal */}
      {checkoutOrderId && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold text-white mb-4">Checkout Order</h3>

            {paymentMethods.length === 0 ? (
              <p className="text-gray-400 text-sm">
                No payment methods available. Ask Admin to add one.
              </p>
            ) : (
              <>
                <p className="text-gray-400 text-sm mb-4">Select a payment method:</p>
                <div className="space-y-2 mb-6">
                  {paymentMethods.map((pm: any) => (
                    <label
                      key={pm.id}
                      className={clsx(
                        'flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors',
                        selectedPaymentId === pm.id
                          ? 'border-orange-500 bg-orange-500/10'
                          : 'border-gray-700 hover:border-gray-600'
                      )}
                    >
                      <input
                        type="radio"
                        name="payment"
                        value={pm.id}
                        checked={selectedPaymentId === pm.id}
                        onChange={() => setSelectedPaymentId(pm.id)}
                        className="accent-orange-500"
                      />
                      <div>
                        <div className="text-sm font-medium text-white">
                          {pm.type === 'CREDIT_CARD' ? '💳' : '🏦'} •••• {pm.lastFourDigits}
                        </div>
                        <div className="text-xs text-gray-500">
                          {pm.cardholderName} · Expires {pm.expiryMonth}/{pm.expiryYear}
                        </div>
                      </div>
                      {pm.isDefault && (
                        <span className="ml-auto badge-green text-xs">Default</span>
                      )}
                    </label>
                  ))}
                </div>
              </>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setCheckoutOrderId(null)}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
              <button
                onClick={handleCheckout}
                disabled={!selectedPaymentId || checkingOut}
                className="btn-primary flex-1"
              >
                {checkingOut ? 'Processing...' : 'Confirm Payment'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Orders List */}
      {orders.length === 0 ? (
        <div className="card border-gray-800 text-center py-16">
          <div className="text-4xl mb-3">📭</div>
          <p className="text-gray-400">No orders found.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order: any) => (
            <div key={order.id} className="card border-gray-800">
              {/* Order Header */}
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="font-semibold text-white text-lg">
                    {order.restaurant.name}
                  </div>
                  <div className="text-sm text-gray-500 mt-0.5">
                    {order.restaurant.cuisine} ·{' '}
                    {order.restaurant.country === 'INDIA' ? '🇮🇳' : '🇺🇸'}{' '}
                    {order.restaurant.country}
                  </div>
                  <div className="text-xs text-gray-600 mt-1">
                    Order ID: {order.id.slice(0, 8)}... ·{' '}
                    {new Date(order.createdAt).toLocaleString()}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xl font-bold text-white">
                    {formatCurrency(order.totalAmount, order.restaurant.country)}
                  </span>
                  <span className={statusStyles[order.status]}>{order.status}</span>
                </div>
              </div>

              {/* Order Items */}
              <div className="bg-gray-800/50 rounded-lg p-3 mb-4">
                <div className="space-y-1">
                  {order.orderItems.map((item: any) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span className="text-gray-300">
                        {item.menuItem.name} × {item.quantity}
                      </span>
                      <span className="text-gray-400">
                        {formatCurrency(item.price, order.restaurant.country)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment info if paid */}
              {order.payment && (
                <div className="text-sm text-gray-500 mb-4">
                  💳 Paid with •••• {order.payment.lastFourDigits} (
                  {order.payment.cardholderName})
                </div>
              )}

              {/* Action Buttons */}
              {order.status === 'CREATED' && (
                <div className="flex gap-3">
                  {can('checkout') && (
                    <button
                      onClick={() => {
                        setCheckoutOrderId(order.id);
                        setSelectedPaymentId('');
                        setActionError('');
                      }}
                      className="btn-primary text-sm"
                    >
                      Checkout & Pay
                    </button>
                  )}
                  {can('cancelOrder') && (
                    <button
                      onClick={() => handleCancel(order.id)}
                      disabled={cancelling}
                      className="btn-danger text-sm"
                    >
                      {cancelling ? 'Cancelling...' : 'Cancel Order'}
                    </button>
                  )}
                  {!can('checkout') && !can('cancelOrder') && (
                    <p className="text-sm text-gray-500 italic">
                      Waiting for Manager/Admin to process this order.
                    </p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
