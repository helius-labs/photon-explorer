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
      {/* Line Through Center with File Tabs */}
      <div className="relative w-full flex items-center justify-center mt-4">
        {/* Left Line */}
        <div
          style={{
            width: "calc(50% - 200px)",
            height: 0,
            border: "1px solid #2D1611",
            position: "absolute",
            left: 0,
            top: "50%",
            transform: "translateY(-50%)",
          }}
        ></div>

        {/* File Tabs Container */}
        <div className="relative flex">
          {/* Powered by Helius Tab */}
          <div className="relative flex justify-center items-center bg-background border border-border-border-light py-2 px-4">

            <div className="flex items-center">
              <span className="text-[13px] font-['Geist Mono'] text-foreground">
                POWERED BY
              </span>
              <a
                href="https://www.helius.dev/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[13px] font-['Geist Mono'] underline text-foreground ml-2 flex items-center"
              >
                {/* SVG Image and HELIUS Text */}
                <div className="relative flex items-center mr-2">
                  <Image
                    src="/assets/poweredByHelius.svg"
                    alt="Powered by Helius"
                    width={16.14}
                    height={16}
                  />
                </div>
                HELIUS
              </a>
            </div>
          </div>

          {/* Social Icons Tab */}
          <div className="relative flex justify-center items-center bg-background border border-border-border-light py-2 px-4">
            
            <div className="flex items-center gap-3">
              {footerLinks.map((link, index) => (
                <Link
                  key={index}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-colors duration-200 hover:text-gray-400"
                >
                  {React.cloneElement(link.icon, {
                    className: "w-4 h-4 text-muted-foreground",
                  })}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Right Line */}
        <div
          style={{
            width: "calc(50% - 200px)",
            height: 0,
            border: "1px solid #2D1611",
            position: "absolute",
            right: 0,
            top: "50%",
            transform: "translateY(-50%)",
          }}
        ></div>
      </div>
      {/* Bottom Line Underneath File Tabs */}
      <div
        style={{
          width: "100%",
          height: 0,
          borderBottom: "1px solid #2D1611",
        }}
      ></div>

      {/* Vector Image */}
      <div className="w-full mt-4">
        <Image
          src="/assets/dottedFooter.svg"
          alt="Footer Design"
          width={2046}
          height={126}
          className="object-cover"
        />
      </div>
    </footer>
  );
};
