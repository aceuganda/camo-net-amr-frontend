import Image from "next/image";
import Link from "next/link";

export default function SiteFooter() {
  return (
    <footer className="w-full overflow-hidden bg-[#16316F] text-white">
      <div className="relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(96,165,250,0.22),_transparent_38%),radial-gradient(circle_at_bottom_right,_rgba(14,165,233,0.18),_transparent_32%)]" />
        <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid gap-10 border-b border-white/15 pb-10 lg:grid-cols-[1.3fr_0.8fr_0.9fr]">
            <div className="max-w-xl">
              <Image
                src="/logos/amrdbwhite.png"
                alt="AMRDB"
                width={140}
                height={52}
                className="h-11 w-auto object-contain"
              />
              <p className="mt-5 text-sm leading-7 text-blue-100/90">
                AMRDB is a dedicated antimicrobial resistance data portal that
                connects researchers, policy teams, and public health
                stakeholders to trusted datasets and practical insights.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href="/datasets"
                  className="rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-[#16316F] transition hover:bg-blue-50"
                >
                  Explore datasets
                </Link>
                <Link
                  href="/datasets/access"
                  className="rounded-full border border-white/25 px-5 py-2.5 text-sm font-semibold text-white transition hover:border-white/50 hover:bg-white/10"
                >
                  Request access
                </Link>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-200">
                Quick Links
              </h3>
              <div className="mt-5 flex flex-col gap-3 text-sm text-blue-50">
                <Link href="/" className="transition hover:text-white">
                  Home
                </Link>
                <Link href="/datasets" className="transition hover:text-white">
                  Dataset catalogue
                </Link>
                <Link
                  href="/datasets/access"
                  className="transition hover:text-white"
                >
                  Access requests
                </Link>
                <Link href="/models" className="transition hover:text-white">
                  Models
                </Link>
                <Link
                  href="/authenticate/privacy-policy"
                  className="transition hover:text-white"
                >
                  Privacy policy
                </Link>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-200">
                Contact
              </h3>
              <div className="mt-5 space-y-3 text-sm leading-6 text-blue-50">
                <p>CAMO-Net Uganda Hub</p>
                <p>
                  Infectious Diseases Institute, P.O. Box 22418, Kampala,
                  Uganda
                </p>
                <p>Wellcome Trust supported AMR data initiative</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 pt-5 text-xs text-blue-200 sm:flex-row sm:items-center sm:justify-between">
            <p>© 2024 CAMO-Net Uganda Hub. All rights reserved.</p>
            <div className="flex flex-col gap-2 sm:items-end">
              <p>
                Built to improve access to antimicrobial resistance data and
                evidence.
              </p>
              <Link
                href="/authenticate/privacy-policy"
                className="text-blue-100 transition hover:text-white"
              >
                Privacy policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
