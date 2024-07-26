import { PublicKey } from "@solana/web3.js";
import { BigNumber } from "bignumber.js";
import React from "react";
import Image from "next/image";

import { useGetTokenListStrict } from "@/hooks/jupiterTokenList";

import cloudflareLoader from "@/utils/imageLoader";
import noLogoImg from "@/../public/assets/noLogoImg.svg";

export function TokenBalanceDelta({
  mint,
  delta,
}: {
  mint: PublicKey;
  delta: BigNumber;
}) {
  const { data: tokenList } = useGetTokenListStrict();
  const token = tokenList?.find((t) => t.address === mint.toBase58());

  let avatarSrc = "";
  let avatarAlt = "";
  if (token) {
    avatarSrc = token.logoURI || "";
    avatarAlt = token.name || "";
  }

  if (delta.gt(0)) {
    return (
      <div className="inline-flex items-center gap-2 text-[#06D6A0] cursor-default">
        {avatarSrc && (
          <Image
          loader={cloudflareLoader}
          src={avatarSrc}
          alt={avatarAlt}
          width={24}
          height={24}
          loading="eager"
          onError={(event: any) => {
            event.target.id = "noLogoImg";
            event.target.srcset = noLogoImg.src;
          }}
          className="h-6 w-6 rounded-full"
          />
        )}
        <span>
          +
          {new Intl.NumberFormat("en-US", { maximumFractionDigits: 7 }).format(
            delta.toNumber(),
          )}{" "}
          {token && token.symbol ? token.symbol : "token(s)"}
        </span>
      </div>
    );
  } else if (delta.lt(0)) {
    return (
      <div className="inline-flex items-center gap-2 text-[#EF476F] cursor-default">
        {avatarSrc && (
          <Image
          loader={cloudflareLoader}
          src={avatarSrc}
          alt={avatarAlt}
          width={24}
          height={24}
          loading="eager"
          onError={(event: any) => {
            event.target.id = "noLogoImg";
            event.target.srcset = noLogoImg.src;
          }}
          className="h-6 w-6 rounded-full"
          />
        )}
        <span>
          {new Intl.NumberFormat("en-US", { maximumFractionDigits: 7 }).format(
            delta.toNumber(),
          )}{" "}
          {token && token.symbol ? token.symbol : "token(s)"}
        </span>
      </div>
    );
  }

  return (
    <div className="inline-flex items-center gap-2">
      {avatarSrc && (
        <Image
        loader={cloudflareLoader}
        src={avatarSrc}
        alt={avatarAlt}
        width={24}
        height={24}
        loading="eager"
        onError={(event: any) => {
          event.target.id = "noLogoImg";
          event.target.srcset = noLogoImg.src;
        }}
        className="h-6 w-6 rounded-full"
        />
      )}
      <span>
        {0} {token && token.symbol ? token.symbol : "token(s)"}
      </span>
    </div>
  );
}
