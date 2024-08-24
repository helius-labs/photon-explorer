import Link from "next/link";
import Image from "next/image";
import * as React from "react";

import {
  IconBook,
  IconDiscord,
  IconGithub,
  IconTwitterX,
  IconYoutube,
} from "@/components/Icons";

const footerLinks = [
  {
    href: "https://x.com/heliuslabs",
    icon: <IconTwitterX />,
  },
  {
    href: "https://discord.gg/HjummjUXgq",
    icon: <IconDiscord />,
  },
  {
    href: "https://github.com/helius-labs",
    icon: <IconGithub />,
  },
  {
    href: "https://docs.helius.dev/",
    icon: <IconBook />,
  },
  {
    href: "https://www.youtube.com/@helius_labs",
    icon: <IconYoutube />,
  },
];

export const Footer = () => {
  return (
    <footer className="w-full flex flex-col items-center bg-background p-2 shadow">
    <p className="text-sm leading-loose text-muted-foreground">
          Powered by{" "}
          <a
                href="https://www.helius.dev/"
                target="_blank"
                rel="noreferrer"
                className="font-medium underline underline-offset-4"
              >
                HELIUS
              </a>
              </p>
              <nav className="flex justify-end">
              <ul className="m-0 flex list-none gap-4 p-0">

              {footerLinks.map((link, index) => (
              <li key={index}>
                {React.cloneElement(link.icon, { className: "w-5 h-5" })}
                </li>
              ))}
            </ul>
          </nav>
    </footer>
  );
};
