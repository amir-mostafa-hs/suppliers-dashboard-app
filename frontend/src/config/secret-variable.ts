interface Variables {
  api_url: string;
}

export const SECRET_VARIABLES: Variables = {
  api_url: import.meta.env.VITE_API_URL || "http://localhost:4000",
};
