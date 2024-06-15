import React from "react";
import {
  IconBook,
  IconBrandDiscordFilled,
  IconBrandGithubFilled,
  IconBrandX,
  IconBrandYoutube,
} from "@/components/Icons";
import Link from "next/link";

const footerLinks = [
  {
    href: "https://x.com/heliuslabs",
    icon: <IconBrandX />,
  },
  {
    href: "https://discord.gg/HjummjUXgq",
    icon: <IconBrandDiscordFilled />,
  },
  {
    href: "https://github.com/helius-labs",
    icon: <IconBrandGithubFilled />,
  },
  {
    href: "https://docs.helius.dev/",
    icon: <IconBook />,
  },
  {
    href: "https://www.youtube.com/@helius_labs",
    icon: <IconBrandYoutube />,
  },
];

export const Footer = () => {
  return (
    <footer className="bg-background shadow fixed bottom-0 w-full p-1 flex items-center">
      <div className="flex items-center w-1/3">
        <p className="text-sm leading-loose text-muted-foreground ml-2">
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
      <div className="flex justify-center w-1/3">
        <nav>
          <ul className="flex gap-4 list-none p-0 m-0">
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
      </div>
      <div className="w-1/3"></div>
    </footer>
  );
};
