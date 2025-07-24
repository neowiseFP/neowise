export function extractTickerFrom(text: string): string | null {
  const match = text.match(/\b([A-Z]{2,5})\b/);
  return match ? match[1] : null;
}