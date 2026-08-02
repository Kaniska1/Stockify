const API_URL =
  import.meta.env.VITE_API_URL ??
  "http://localhost:5000/api";

interface ApiOptions extends RequestInit {
  token?: string;
}

export default async function api<T>(
  endpoint: string,
  options: ApiOptions = {}
): Promise<T> {
  const { token, headers, ...requestOptions } = options;

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...requestOptions,
    headers: {
      "Content-Type": "application/json",
      ...(token
        ? { Authorization: `Bearer ${token}` }
        : {}),
      ...headers,
    },
  });

  const body = await response
    .json()
    .catch(() => null);

  if (!response.ok) {
    throw new Error(
      body?.message ||
      `Request failed with status ${response.status}`
    );
  }

  return body as T;
}