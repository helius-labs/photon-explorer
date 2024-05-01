"use client";

import NextLink, { LinkProps } from "next/link";
import React from "react";
import { useCluster } from "../cluster-provider";
import { getBaseUrl } from "@/lib/utils";

const Link = React.forwardRef<
  HTMLAnchorElement,
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
