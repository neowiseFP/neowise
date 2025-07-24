export async function resolveTicker(input: string): Promise<string | null> {
  const query = input.trim().toLowerCase();

  const url = `https://query1.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(
    query
  )}&quotesCount=1`;

  try {
    const res = await fetch(url);
    const json = await res.json();
    const result = json.quotes?.[0];

    if (result?.symbol) {
      return result.symbol;
    }

    return null;
  } catch (error) {
    console.error("Failed to resolve ticker:", error);
    return null;
  }
}