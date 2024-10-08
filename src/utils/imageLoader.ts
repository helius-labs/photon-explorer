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
  const params = [`width=${width}`];
  if (quality) {
    params.push(`quality=${quality}`);
  }

  return `https://cdn.helius-rpc.com/cdn-cgi/image/${params.join(",")}/${normalizeSrc(src)}`;
}
