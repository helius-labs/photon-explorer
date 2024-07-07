export function descriptionParser(description: string): string {
  if (description.includes("multiple accounts")) {
    return "UNKNOWN";
  }

  const swapMatch = description.match(
    /swapped ([\d.]+) (\w+) for ([\d.]+) (\w+)/,
  );
  if (swapMatch) {
    const token1 = swapMatch[2].length > 30 ? "Token" : swapMatch[2];
    const token2 = swapMatch[4].length > 30 ? "Token" : swapMatch[4];
    return `SWAPPED ${swapMatch[1]} ${token1} for ${swapMatch[3]} ${token2}`;
  }

  const transferMatch = description.match(/transferred ([\d.]+) (\w+) to/);
  if (transferMatch) {
    return `TRANSFERRED ${transferMatch[1]} ${transferMatch[2]}`;
  }

  const cNFTMatch = description.match(/minted a compressed nft/);
  if (cNFTMatch) {
    return `MINTED cNFT`;
  }

  const burnMatch = description.match(/burned ([\d.]+) (\w+)/);
  if (burnMatch) {
    return `BURNED ${burnMatch[1]} ${burnMatch[2]}`;
  }

  const mintMatch = description.match(/minted ([\d.]+) (\w+)/);
  if (mintMatch) {
    return `MINTED ${mintMatch[1]} ${mintMatch[2]}`;
  }

  return description;
}
