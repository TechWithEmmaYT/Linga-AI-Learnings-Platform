"use client"
import Image from "next/image";
import { Button } from "@/components/ui/custom/button";

const footerLinks = [
  { label: "English", src: "/images/langs/english.png" },
  { label: "Spanish", src: "/images/langs/spanish.png" },
  { label: "French", src: "/images/langs/french.png" },
  { label: "German", src: "/images/langs/german.png" },
  { label: "Italian", src: "/images/langs/italian.png" },
  { label: "Portuguese", src: "/images/langs/portuguese.png" },
];

export const Footer = ({ hideList = false }: { hideList?: boolean }) => {
  return (
    <footer className="hidden h-20 w-full border-t-2 border-border p-2 lg:block">
      {!hideList && (
        <ul className="mx-auto flex h-full max-w-5xl items-center justify-evenly">
          {footerLinks.map((link) => (
            <li key={link.label} className="w-full">
              <Button
                size="lg"
                variant="ghost"
                className="w-full cursor-default text-muted-foreground"
              >
                <Image
                  src={link.src}
                  alt={link.label}
                  height={32}
                  width={40}
                  className="mr-4 rounded-md"
                />
                {link.label}
              </Button>
            </li>
          ))}
        </ul>
      )}
    </footer>
  );
};
