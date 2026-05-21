export async function POST() {
  const response = Response.json({
    success: true,
  });

  response.headers.set(
    "Set-Cookie",
    "token=; Path=/; HttpOnly; Max-Age=0; SameSite=Lax"
  );

  return response;
}