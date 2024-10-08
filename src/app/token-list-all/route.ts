export const runtime = "edge";
// File is over 2MB of data can not be cached :'(
// export const revalidate = 60 * 5; // 5 minutes

export async function GET() {
  const res = await fetch("https://token.jup.ag/all", {
    headers: {
      "Content-Type": "application/json",
    },
  });
  const data = await res.json();

  return Response.json({ data });
}
