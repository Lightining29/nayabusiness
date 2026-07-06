export async function apiRequest(url, options = {}) {
  let response;

  try {
    response = await fetch(url, options);
  } catch (error) {
    // Network-level failure (server down, no internet, CORS preflight blocked)
    throw new Error(
      'Cannot connect to the server. Please check your internet connection or try again in a moment.'
    );
  }

  const contentType = response.headers.get('content-type') || '';
  let data = null;

  if (contentType.includes('application/json')) {
    try {
      data = await response.json();
    } catch {
      data = null;
    }
  } else {
    const text = await response.text().catch(() => '');
    data = text ? { error: text } : null;
  }

  if (!response.ok) {
    throw new Error(data?.error || data?.message || `Request failed with status ${response.status}.`);
  }

  return data;
}
