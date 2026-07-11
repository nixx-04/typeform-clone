export async function apiFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const token = localStorage.getItem("auth_token");
  const headers = new Headers(options.headers || {});

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const res = await fetch(url, {
    ...options,
    headers,
  });

  if (res.status === 401 && token) {
    // Unauthorized expired token: Clear token and redirect to login
    localStorage.removeItem("auth_token");
    const hash = window.location.hash;
    // Don't loop-redirect on public views
    if (
      hash !== "#/login" &&
      hash !== "#/signup" &&
      !hash.startsWith("#/form/") &&
      hash !== "#/" &&
      hash !== "" &&
      !hash.startsWith("#/builder/") &&
      !hash.startsWith("#/results/")
    ) {
      window.location.hash = "#/login";
    }
  }

  return res;
}
