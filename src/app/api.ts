const BASE_URL = "https://aspp.onrender.com";
export async function apiRequest(endpoint: string, options?: any) {
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    headers: {
      "Content-Type": "application/json",
    },
    ...options,
  });

  if (!res.ok) {
    throw new Error(await res.text());
  }

  const text = await res.text();

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}