"use client";

import Image from "next/image";
import Link from "next/link";
import {
  GithubLogo,
  type Icon,
  LinkedinLogo,
  XLogo,
} from "@phosphor-icons/react";
import data from "./data.json";

type SocialIcon = "XLogo" | "LinkedinLogo" | "GithubLogo";

type FooterData = {
  tagline: string;
  columns: { title: string; links: { label: string; href: string }[] }[];
  social: { label: string; icon: SocialIcon; href: string }[];
  copyright: string;
};

const FOOTER: FooterData = data as never;

const SOCIAL_ICONS: Record<SocialIcon, Icon> = {
  XLogo,
  LinkedinLogo,
  GithubLogo,
};

export function Footer() {
  return (
    <footer className="bg-fleent-background pt-12 pb-10">
      <div className="mx-auto max-w-6xl px-6">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-[1.2fr_repeat(3,minmax(0,1fr))] md:gap-12">
          <div className="flex flex-col gap-3">
            <Link href="/" aria-label="Fleent" className="inline-flex">
              <Image
                src="/images/fleent.svg"
                alt="Fleent"
                width={64}
                height={20}
              />
            </Link>
            <p className="text-fleent-body tracking-wide text-fleent-mute">
              {FOOTER.tagline}
            </p>
          </div>

          {FOOTER.columns.map((col) => (
            <div key={col.title} className="flex flex-col gap-4">
              <h4 className="text-xs font-semibold tracking-[0.12em] text-fleent-ink uppercase">
                {col.title}
              </h4>
              <ul className="flex flex-col gap-2.5">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-fleent-body tracking-wide text-fleent-mute transition-colors duration-200 ease-out hover:text-fleent-ink"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col-reverse items-start justify-between gap-6 border-t border-black/8 pt-6 sm:flex-row sm:items-center">
          <p className="text-xs tracking-wide text-fleent-mute">
            {FOOTER.copyright}
          </p>
          <ul className="flex items-center gap-2">
            {FOOTER.social.map((s) => {
              const SocialIcon = SOCIAL_ICONS[s.icon];
              return (
                <li key={s.label}>
                  <Link
                    href={s.href}
                    aria-label={s.label}
                    className="inline-flex size-9 items-center justify-center rounded-full text-fleent-mute transition-colors duration-200 ease-out hover:bg-[#F3F3F3] hover:text-fleent-ink"
                  >
                    <SocialIcon size={18} weight="regular" />
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </footer>
  );
}
