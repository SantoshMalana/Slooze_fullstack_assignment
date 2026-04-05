export function formatCurrency(amount: number, country: string): string {
  if (!country) return `₹${amount.toFixed(2)}`;
  
  if (country === 'AMERICA' || country === 'US') {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount);
  }

  // Handle India (INR) as default / explicitly
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
  }).format(amount);
}
