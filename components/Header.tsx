import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, Home } from "lucide-react";

export function JinsoLogo() {
  return (
    <Link href="/" aria-label="Jinso Live home" className="brand-logo focus-ring">
      <Image src="/jinso-logo.png" alt="Jinso" width={2560} height={673} priority />
    </Link>
  );
}

export function BookDemo({ compact: _compact = false }: { compact?: boolean }) {
  const url = process.env.NEXT_PUBLIC_CALENDLY_URL || "https://calendly.com/jinso-camilo/30min";
  return (
    <a className="book-button focus-ring" href={url} target="_blank" rel="noreferrer">
      Talk to Us <ArrowUpRight size={17} aria-hidden="true" />
    </a>
  );
}

export function Header({ trail }: { trail?: string }) {
  return (
    <header className="site-header">
      <div className="header-inner">
        <JinsoLogo />
        <div className="crumbs" aria-label="Breadcrumb">
          <Link href="/" className="crumb-home focus-ring"><Home size={16} /> Home</Link>
          {trail && <><span aria-hidden="true">›</span><span>{trail}</span></>}
        </div>
        <div className="header-spacer" />
        <BookDemo />
      </div>
    </header>
  );
}
