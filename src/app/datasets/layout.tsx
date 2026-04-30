
import NavigationBar from "@/components/navigationBar";
import SiteFooter from "@/components/siteFooter";

export default function DatasetLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative max-md:z-0">
      <div className="relative max-md:z-5">
        <NavigationBar />
      </div>
      <main className="relative max-md:-z-10">
        {children}
      </main>
      <SiteFooter />
    </div>
  );
}
