export const getAuthUserId = () => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("AURA_USER_ID");
  }
  return null;
};

export const setAuthUserId = (id: string) => {
  if (typeof window !== "undefined") {
    localStorage.setItem("AURA_USER_ID", id);
  }
};

export const clearAuthUserId = () => {
  if (typeof window !== "undefined") {
    localStorage.removeItem("AURA_USER_ID");
  }
};

export const fetcher = async (url: string) => {
  const userId = getAuthUserId();
  const res = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...(userId ? { "x-user-id": userId } : {}),
    },
  });

  if (!res.ok) {
    // DEMO MODE: If the backend fails (e.g. missing Supabase keys), 
    // we return empty arrays so the UI continues rendering gracefully instead of spinning forever.
    console.warn(`[Demo Mode] Failing API request intercepted for: ${url}`);
    return [];
  }

  const json = await res.json();
  return json.data;
};

export const fetchWithBody = async (url: string, method: string, body: any) => {
  const userId = getAuthUserId();
  const res = await fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(userId ? { "x-user-id": userId } : {}),
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    let errorData;
    try {
      errorData = await res.json();
    } catch (e) {
      errorData = {};
    }
    const error = new Error(errorData.error || "An error occurred during the request.");
    (error as any).info = errorData;
    (error as any).status = res.status;
    throw error;
  }

  const json = await res.json();
  return json.data;
};
