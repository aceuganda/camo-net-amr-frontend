"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import React from "react";

type AuthShellProps = {
  title: string;
  subtitle?: string;
  backHref?: string;
  backLabel?: string;
  children: React.ReactNode;
  contentClassName?: string;
  backgroundClassName?: string;
};

export default function AuthShell({
  title,
  subtitle,
  backHref = "/",
  backLabel = "Back",
  children,
  contentClassName = "",
  backgroundClassName,
}: AuthShellProps) {
  return (
    <div
      style={backgroundClassName ? undefined : { backgroundImage: "url(/backgroundImageNet.webp)" }}
      className={`relative min-h-screen overflow-hidden bg-cover bg-center bg-no-repeat ${
        backgroundClassName ?? "bg-slate-950"
      }`}
    >
      {!backgroundClassName && (
        <>
          <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(9,20,53,0.94)_0%,rgba(14,35,87,0.82)_35%,rgba(14,165,233,0.2)_100%)]" />
          <div className="absolute left-0 top-0 h-full w-full bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.18),_transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(0,185,241,0.2),_transparent_24%)]" />
        </>
      )}

      <div className="relative mx-auto flex min-h-screen w-full max-w-7xl items-center justify-center px-4 py-6 sm:px-6 lg:px-8">
        <div className="w-full max-w-5xl overflow-hidden rounded-[28px] border border-white/15 bg-white/95 shadow-2xl backdrop-blur-sm">
          <div className="flex flex-col gap-4 border-b border-slate-200 bg-white px-5 py-5 sm:px-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center justify-between gap-4">
              <Link href="/" className="inline-flex items-center">
                <Image
                  src="/logos/amrdbblue.png"
                  alt="AMRDB"
                  width={148}
                  height={52}
                  className="h-10 w-auto object-contain sm:h-11"
                  priority
                />
              </Link>
              <Link
                href={backHref}
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-sky-300 hover:text-sky-600 lg:hidden"
              >
                <ArrowLeft className="h-4 w-4" />
                {backLabel}
              </Link>
            </div>

            <div className="min-w-0 flex-1 lg:px-6">
              <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">
                {title}
              </h1>
              {subtitle ? (
                <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500">
                  {subtitle}
                </p>
              ) : null}
            </div>

            <Link
              href={backHref}
              className="hidden items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-sky-300 hover:text-sky-600 lg:inline-flex"
            >
              <ArrowLeft className="h-4 w-4" />
              {backLabel}
            </Link>
          </div>

          <div className={`bg-slate-50 px-4 py-5 sm:px-8 sm:py-8 ${contentClassName}`}>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
