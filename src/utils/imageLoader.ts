const normalizeSrc = (src: string): string => {
  return src.startsWith("/") ? src.slice(1) : src;
};

export default function cloudflareLoader({
  src,
  width,
  quality,
}: {
  src: string;
  width: number;
  quality?: number;
}): string {
  const fileExtension = src.split(".").pop()?.toLowerCase();
  const shouldBypassLoader = ["png", "svg"].includes(fileExtension || "");

  if (shouldBypassLoader) {
    return src;
  }

  const params = [`width=${width}`, `quality=${quality || 75}`, "format=auto"];
  return `https://cdn.helius-rpc.com/cdn-cgi/image/${params.join(",")}/${normalizeSrc(src)}`;
}
