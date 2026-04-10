const PAYSTACK_API = "https://api.paystack.co";

export async function paystackRequest<T>(
  secretKey: string,
  method: string,
  path: string,
  body?: Record<string, unknown>
): Promise<T> {
  const res = await fetch(`${PAYSTACK_API}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${secretKey}`,
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json();

  if (!res.ok || !data.status) {
    throw new Error(data.message || `Paystack API error: ${res.status}`);
  }

  return data.data as T;
}
