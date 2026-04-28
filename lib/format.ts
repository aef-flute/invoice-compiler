export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr + "T00:00:00");
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatDateInput(dateStr: string): string {
  // Ensure YYYY-MM-DD format for input[type=date]
  return dateStr.slice(0, 10);
}

export function todayString(): string {
  return new Date().toISOString().slice(0, 10);
}

export function addDays(dateStr: string, days: number): string {
  const date = new Date(dateStr + "T00:00:00");
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

export function getQuarter(dateStr: string): { year: number; quarter: number } {
  const date = new Date(dateStr + "T00:00:00");
  const month = date.getMonth();
  return {
    year: date.getFullYear(),
    quarter: Math.floor(month / 3) + 1,
  };
}
