import { NFT } from "@/types/nft";
import { shorten } from "@/utils/common";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

export default function NFTDetails({ nft }: { nft: NFT }) {
  return (
    <div className="flex flex-col space-y-4 w-full md:mr-4 text-xs">
      <div className="flex flex-row items-center justify-end space-x-6 text-muted-foreground">
      <div className="flex flex-col items-center">
          {nft.verified && (
            <Badge variant="outline">Verified</Badge>
          )}
        </div>
        <div className="flex flex-col items-center">
          <span className="font-semibold">Collection</span>
          <span>
            {nft.collection ? (
              <Link href={`/address/${nft.collection}`} className="text-secondary hover:underline">
                {shorten(nft.collection)}
              </Link>
            ) : (
              "N/A"
            )}
          </span>
        </div>
        <div className="flex flex-col items-center">
          <span className="font-semibold">Owner</span>
          <span>
            {nft.owner ? (
              <Link href={`/address/${nft.owner}`} className="text-secondary hover:underline">
                {shorten(nft.owner)}
              </Link>
            ) : (
              "N/A"
            )}
          </span>
        </div>
        <div className="flex flex-col items-center">
          <span className="font-semibold">Mint Authority</span>
          <span>
            {nft.mintAuthority ? (
              <Link href={`/address/${nft.mintAuthority}`} className="text-secondary hover:underline">
                {shorten(nft.mintAuthority)}
              </Link>
            ) : (
              "N/A"
            )}
          </span>
        </div>
      </div>
    </div>
  );
}
