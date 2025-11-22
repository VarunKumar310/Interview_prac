const BASE_URL = "http://localhost:8000"; // change if backend differs

export const api = {
  post: async (endpoint, data) => {
    try {
      const response = await fetch(`${BASE_URL}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      return await response.json();
    } catch (err) {
      console.error("API POST Error:", err);
      return { error: true };
    }
  },

  get: async (endpoint) => {
    try {
      const response = await fetch(`${BASE_URL}${endpoint}`);
      return await response.json();
    } catch (err) {
      console.error("API GET Error:", err);
      return { error: true };
    }
  },
};
