'use client';

import { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { useAuth } from '@/context/AuthContext';
import { GET_RESTAURANTS, CREATE_ORDER, GET_MY_ORDERS } from '@/lib/graphql/operations';
import clsx from 'clsx';

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  isAvailable: boolean;
}

interface Restaurant {
  id: string;
  name: string;
  cuisine: string;
  address: string;
  country: string;
  menuItems: MenuItem[];
}

interface CartItem {
  menuItem: MenuItem;
  quantity: number;
}

export default function RestaurantsPage() {
  const { user } = useAuth();
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [error, setError] = useState('');

  const { data, loading } = useQuery(GET_RESTAURANTS);
  const restaurants: Restaurant[] = data?.restaurants || [];

  const [createOrder, { loading: ordering }] = useMutation(CREATE_ORDER, {
    refetchQueries: [{ query: GET_MY_ORDERS }],
  });

  const addToCart = (item: MenuItem) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.menuItem.id === item.id);
      if (existing) {
        return prev.map((c) =>
          c.menuItem.id === item.id ? { ...c, quantity: c.quantity + 1 } : c
        );
      }
      return [...prev, { menuItem: item, quantity: 1 }];
    });
  };

  const removeFromCart = (itemId: string) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.menuItem.id === itemId);
      if (existing && existing.quantity > 1) {
        return prev.map((c) =>
          c.menuItem.id === itemId ? { ...c, quantity: c.quantity - 1 } : c
        );
      }
      return prev.filter((c) => c.menuItem.id !== itemId);
    });
  };

  const cartTotal = cart.reduce((sum, c) => sum + c.menuItem.price * c.quantity, 0);
  const cartCount = cart.reduce((sum, c) => sum + c.quantity, 0);

  const handleSelectRestaurant = (r: Restaurant) => {
    setSelectedRestaurant(r);
    setCart([]);
    setOrderSuccess(false);
    setError('');
  };

  const handlePlaceOrder = async () => {
    if (!selectedRestaurant || cart.length === 0) return;
    setError('');
    try {
      await createOrder({
        variables: {
          input: {
            restaurantId: selectedRestaurant.id,
            items: cart.map((c) => ({
              menuItemId: c.menuItem.id,
              quantity: c.quantity,
            })),
          },
        },
      });
      setCart([]);
      setOrderSuccess(true);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const groupedItems = selectedRestaurant?.menuItems.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, MenuItem[]>);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Restaurants</h1>
        <p className="text-gray-400 mt-1">
          Showing restaurants in{' '}
          <span className="text-orange-400">
            {user?.role === 'ADMIN' ? 'all countries' : user?.country}
          </span>
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Restaurant List */}
        <div className="lg:col-span-1 space-y-3">
          {restaurants.map((r) => (
            <button
              key={r.id}
              onClick={() => handleSelectRestaurant(r)}
              className={clsx(
                'w-full text-left card border transition-all',
                selectedRestaurant?.id === r.id
                  ? 'border-orange-500 bg-orange-500/5'
                  : 'border-gray-800 hover:border-gray-700'
              )}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-semibold text-white">{r.name}</div>
                  <div className="text-sm text-gray-400 mt-0.5">{r.cuisine}</div>
                  <div className="text-xs text-gray-600 mt-1">{r.address}</div>
                </div>
                <span className={r.country === 'INDIA' ? 'badge-orange' : 'badge-blue'}>
                  {r.country === 'INDIA' ? '🇮🇳' : '🇺🇸'}
                </span>
              </div>
            </button>
          ))}
        </div>

        {/* Menu + Cart */}
        <div className="lg:col-span-2">
          {!selectedRestaurant ? (
            <div className="card border-gray-800 flex items-center justify-center py-24 text-center">
              <div>
                <div className="text-4xl mb-3">👈</div>
                <p className="text-gray-400">Select a restaurant to view its menu</p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Menu */}
              <div className="card border-gray-800">
                <h2 className="text-xl font-bold text-white mb-6">
                  {selectedRestaurant.name} — Menu
                </h2>

                {orderSuccess && (
                  <div className="mb-4 bg-green-900/30 border border-green-800 text-green-400 rounded-lg px-4 py-3 text-sm">
                    ✅ Order placed successfully! Check My Orders to track it.
                  </div>
                )}
                {error && (
                  <div className="mb-4 bg-red-900/30 border border-red-800 text-red-400 rounded-lg px-4 py-3 text-sm">
                    {error}
                  </div>
                )}

                {Object.entries(groupedItems || {}).map(([category, items]) => (
                  <div key={category} className="mb-6">
                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                      {category}
                    </h3>
                    <div className="space-y-3">
                      {items.map((item) => {
                        const cartItem = cart.find((c) => c.menuItem.id === item.id);
                        return (
                          <div
                            key={item.id}
                            className="flex items-center justify-between py-3 border-b border-gray-800 last:border-0"
                          >
                            <div className="flex-1 mr-4">
                              <div className="font-medium text-white">{item.name}</div>
                              <div className="text-sm text-gray-500 mt-0.5">
                                {item.description}
                              </div>
                              <div className="text-orange-400 font-semibold mt-1">
                                {item.price >= 100
                                  ? `₹${item.price}`
                                  : `$${item.price.toFixed(2)}`}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {cartItem ? (
                                <>
                                  <button
                                    onClick={() => removeFromCart(item.id)}
                                    className="w-8 h-8 rounded-full bg-gray-800 hover:bg-gray-700 flex items-center justify-center text-white font-bold transition-colors"
                                  >
                                    −
                                  </button>
                                  <span className="w-6 text-center font-semibold text-white">
                                    {cartItem.quantity}
                                  </span>
                                  <button
                                    onClick={() => addToCart(item)}
                                    className="w-8 h-8 rounded-full bg-orange-500 hover:bg-orange-600 flex items-center justify-center text-white font-bold transition-colors"
                                  >
                                    +
                                  </button>
                                </>
                              ) : (
                                <button
                                  onClick={() => addToCart(item)}
                                  disabled={!item.isAvailable}
                                  className="btn-primary text-sm py-1.5 px-3 disabled:opacity-40"
                                >
                                  {item.isAvailable ? 'Add' : 'Unavailable'}
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              {/* Cart Summary */}
              {cart.length > 0 && (
                <div className="card border-orange-500/30 bg-orange-500/5">
                  <h3 className="font-semibold text-white mb-4">
                    Your Cart ({cartCount} items)
                  </h3>
                  <div className="space-y-2 mb-4">
                    {cart.map((c) => (
                      <div key={c.menuItem.id} className="flex justify-between text-sm">
                        <span className="text-gray-300">
                          {c.menuItem.name} × {c.quantity}
                        </span>
                        <span className="text-white font-medium">
                          {c.menuItem.price >= 100
                            ? `₹${(c.menuItem.price * c.quantity).toFixed(0)}`
                            : `$${(c.menuItem.price * c.quantity).toFixed(2)}`}
                        </span>
                      </div>
                    ))}
                    <div className="border-t border-gray-700 pt-2 flex justify-between font-semibold">
                      <span className="text-white">Total</span>
                      <span className="text-orange-400">
                        {cartTotal >= 100
                          ? `₹${cartTotal.toFixed(0)}`
                          : `$${cartTotal.toFixed(2)}`}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={handlePlaceOrder}
                    disabled={ordering}
                    className="btn-primary w-full"
                  >
                    {ordering ? 'Placing Order...' : 'Place Order'}
                  </button>
                  <p className="text-xs text-gray-500 mt-2 text-center">
                    Order will be created. Checkout requires Admin/Manager.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
