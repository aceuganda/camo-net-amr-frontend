import Image from "next/image";
import Link from "next/link";
import { BookOpen, Compass, Home } from "lucide-react";

export default function NotFound() {
  return (
    <main
      style={{ backgroundImage: "url(/backgroundImageNet.webp)" }}
      className="relative min-h-screen overflow-hidden bg-slate-950 bg-cover bg-center bg-no-repeat"
    >
      <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(9,20,53,0.94)_0%,rgba(14,35,87,0.82)_35%,rgba(14,165,233,0.2)_100%)]" />
      <div className="absolute left-0 top-0 h-full w-full bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.18),_transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(0,185,241,0.2),_transparent_24%)]" />

      <div className="relative mx-auto flex min-h-screen w-full max-w-7xl items-center justify-center px-4 py-6 sm:px-6 lg:px-8">
        <div className="w-full max-w-6xl overflow-hidden rounded-[28px] border border-white/15 bg-white/95 shadow-2xl backdrop-blur-sm">
          <div className="flex flex-col gap-8 bg-slate-50 px-5 py-6 sm:px-8 sm:py-8 lg:grid lg:grid-cols-[1fr_0.95fr] lg:items-center lg:gap-10">
            <section className="order-2 lg:order-1">
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

              <p className="mt-8 text-sm font-semibold uppercase tracking-[0.35em] text-sky-600">
                Error 404
              </p>
              <h1 className="mt-4 max-w-2xl text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">
                The page you requested is not available.
              </h1>
              <p className="mt-5 max-w-xl text-base leading-7 text-slate-600">
                The link may be outdated, the page may have moved, or the address may be
                incorrect. Use one of the routes below to get back into the portal.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/"
                  className="inline-flex items-center gap-2 rounded-full bg-[#00b9f1] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#0aa6d8]"
                >
                  <Home className="h-4 w-4" />
                  Back To Home
                </Link>
                <Link
                  href="/datasets"
                  className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-sky-300 hover:text-sky-600"
                >
                  <Compass className="h-4 w-4" />
                  Browse Catalogue
                </Link>
                <Link
                  href="/guide"
                  className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-sky-300 hover:text-sky-600"
                >
                  <BookOpen className="h-4 w-4" />
                  Open Guide
                </Link>
              </div>
            </section>

            <div className="order-1 flex justify-center lg:order-2 lg:justify-end">
              <div className="relative w-full max-w-[30rem]">
                <div className="absolute left-1/2 top-1/2 h-56 w-56 -translate-x-1/2 -translate-y-1/2 rounded-full bg-sky-200/70 blur-3xl" />
                <svg
                  viewBox="0 0 520 420"
                  className="relative h-auto w-full"
                  role="img"
                  aria-label="Illustration of a missing route in the data portal"
                >
                  <defs>
                    <linearGradient id="panelGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#24408E" />
                      <stop offset="100%" stopColor="#00B9F1" />
                    </linearGradient>
                  </defs>

                  <circle cx="355" cy="110" r="74" fill="#E0F2FE" />
                  <circle cx="410" cy="164" r="18" fill="#BAE6FD" />

                  <rect x="92" y="74" width="336" height="244" rx="26" fill="white" stroke="#D7E2F0" strokeWidth="8" />
                  <rect x="92" y="74" width="336" height="54" rx="26" fill="url(#panelGradient)" />
                  <circle cx="126" cy="101" r="7" fill="white" fillOpacity="0.9" />
                  <circle cx="150" cy="101" r="7" fill="white" fillOpacity="0.7" />
                  <circle cx="174" cy="101" r="7" fill="white" fillOpacity="0.5" />

                  <rect x="126" y="156" width="124" height="16" rx="8" fill="#D6EEFB" />
                  <rect x="126" y="186" width="188" height="12" rx="6" fill="#E8F1F8" />
                  <rect x="126" y="208" width="154" height="12" rx="6" fill="#E8F1F8" />
                  <rect x="126" y="246" width="90" height="38" rx="19" fill="#00B9F1" />
                  <rect x="230" y="246" width="92" height="38" rx="19" fill="#E2E8F0" />

                  <g transform="translate(318 168)">
                    <circle cx="52" cy="52" r="52" fill="#EFF6FF" />
                    <path
                      d="M52 20c20.4 0 37 16.6 37 37S72.4 94 52 94 15 77.4 15 57h18c0 10.5 8.5 19 19 19s19-8.5 19-19-8.5-19-19-19V20Z"
                      fill="#24408E"
                    />
                    <rect x="45" y="43" width="14" height="30" rx="7" fill="#00B9F1" />
                    <rect x="45" y="79" width="14" height="14" rx="7" fill="#00B9F1" />
                  </g>

                  <g transform="translate(134 284)">
                    <rect x="0" y="0" width="240" height="82" rx="20" fill="#0F172A" />
                    <text
                      x="28"
                      y="34"
                      fill="#7DD3FC"
                      fontSize="18"
                      fontFamily="Arial, sans-serif"
                      fontWeight="700"
                    >
                      404
                    </text>
                    <text
                      x="28"
                      y="60"
                      fill="#E2E8F0"
                      fontSize="16"
                      fontFamily="Arial, sans-serif"
                    >
                      Route not found
                    </text>
                  </g>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
