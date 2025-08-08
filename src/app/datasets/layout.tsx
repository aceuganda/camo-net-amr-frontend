
import LogoHeader from "@/components/logosHeader";
import NavigationBar from "@/components/navigationBar";



export default function DatasetLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative max-md:z-0">
      <LogoHeader />
      <div className="relative max-md:z-5 ">
        <NavigationBar />
      </div>
      <main className="relative max-md:-z-10">
        {children}
      </main>
    </div>
  );
}
