export async function postCanton<Response>(path: string, body: object): Promise<Response> {
  const response = await fetch(`/api/canton/${path}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const { error } = (await response.json().catch(() => ({}))) as { error?: string };
    throw new Error(error || `Canton request ${path} failed (${response.status})`);
  }

  return (await response.json()) as Response;
}
