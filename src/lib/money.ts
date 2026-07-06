export const toCents = (dollars: number) => Math.round(dollars * 100)
export const fromCents = (cents: number) => cents / 100
export const formatMoney = (cents: number, currency = 'USD') =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(cents / 100)
