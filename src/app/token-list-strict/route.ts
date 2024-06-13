export const runtime = "edge";
export const revalidate = 60 * 60; // 1 hour

export async function GET() {
  const res = await fetch("https://token.jup.ag/strict", {
    headers: {
      "Content-Type": "application/json",
    },
  });
  const data = await res.json();

  return Response.json({ data });
}
