"use client";

import { TokenInfoWithPubkey } from "@/hooks/useGetAccountTokens";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function TokenCard({ token }: { token: TokenInfoWithPubkey }) {
  return (
    <tr className="hover:bg-secondary transition duration-300 ease-in-out">
      <td className="py-4 pl-4 sm:pl-6 lg:pl-8">
        <Avatar className="h-12 w-12">
          <AvatarImage src={token?.logoURI || "/default-token-icon.svg"} alt={token?.name} />
          <AvatarFallback>
            {token.name?.slice(0, 1)}
            {token.name?.slice(-1)}
          </AvatarFallback>
        </Avatar>
      </td>
      <td className="py-4 pl-0 pr-4 sm:pr-8">
        <div className="text-sm font-medium">
          {token.name || token.info.mint}
        </div>
        <div className="text-sm text-gray-400">
          {token.symbol}
        </div>
      </td>
      <td className="py-4 pl-0 pr-4 text-right sm:pr-8 sm:text-left lg:pr-20">
        <div className="text-sm">
          {(token.info.tokenAmount?.uiAmount || 0).toLocaleString(undefined, { maximumFractionDigits: 9 })}
        </div>
      </td>
      <td className="py-4 pl-0 pr-8 text-sm lg:pr-20">
        ${token.info.tokenPrice?.toFixed(2) || "N/A"}
      </td>
      <td className="py-4 pl-0 pr-4 text-right text-sm sm:pr-6 lg:pr-8">
        ${((token.info.tokenAmount?.uiAmount || 0) * (token.info.tokenPrice || 0)).toFixed(2)}
      </td>
    </tr>
  );
}
