import HomeCatalogue from "@/components/landingCatalogue";
import Image from "next/image";
import LogoHeader from "@/components/logosHeader";
import NavigationBar from "@/components/navigationBar";
import HomePage from "@/components/homePage";

export default function Home() {
  return (
    <div className="flex flex-col w-[100%] h-[100%]">
      <LogoHeader/>
      <NavigationBar/>
      <HomePage/>
    </div>
  );
}
