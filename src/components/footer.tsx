import Link from "next/link";
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
    <footer className="sticky bottom-0 top-[100vh] z-20 flex w-full items-center justify-between bg-background p-2 shadow">
      <div className="flex items-center">
        <p className="text-sm leading-loose text-muted-foreground">
          Powered by{" "}
          <a
            href="https://www.helius.dev/"
            target="_blank"
            rel="noreferrer"
            className="font-medium underline underline-offset-4"
          >
            Helius
          </a>
          .
        </p>
      </div>
      <nav className="flex justify-end">
        <ul className="m-0 flex list-none gap-4 p-0">
          {footerLinks.map((link, index) => (
            <li key={index}>
              <Link
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="transition-colors duration-200 hover:text-gray-400"
              >
                {React.cloneElement(link.icon, { className: "w-5 h-5" })}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </footer>
  );
};
