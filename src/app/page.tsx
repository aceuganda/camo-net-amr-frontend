import HomeCatalogue from "@/components/landingCatalogue";
import Image from "next/image";
import LogoHeader from "@/components/logosHeader";

export default function Home() {
  const images = [
    { src: "/logos/camonet.webp", alt: "CAMO-NET" },
    { src: "/logos/idiMak.webp", alt: "IDI Makererer" },
    { src: "/logos/ace.webp", alt: "ACE" },
    { src: "/logos/wellcome.webp", alt: "Wellcome Fund" },
  ];
  return (
    <div className="flex flex-col w-[100%] h-[100%]">
      <LogoHeader/>
      <HomeCatalogue />
    </div>
  );
}
