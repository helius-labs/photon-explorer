"use client";

import NextLink, { LinkProps } from "next/link";
import React from "react";
import { useCluster } from "@/providers/cluster-provider";
import { getBaseUrl } from "@/utils/common";

const Link = React.forwardRef<
  HTMLAnchorElement,
  Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, keyof LinkProps> &
  LinkProps & {
    children?: React.ReactNode;
  }
>((props, ref) => {
  const { href, children, ...otherProps } = props;
  const { cluster } = useCluster();

  // Always set cluster query param
  const url = new URL(href as string, getBaseUrl());
  url.searchParams.set("cluster", cluster);

  return (
    <NextLink ref={ref} href={`${url}`} {...otherProps}>
      {children}
    </NextLink>
  );
});

Link.displayName = "Link";

export default Link;
