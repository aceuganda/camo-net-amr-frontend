import HomeCatalogue from "@/components/landingCatalogue";
import Image from "next/image";

export default function LogoHeader() {
  const images = [
    { src: "/logos/camonet.webp", alt: "CAMO-NET" },
    { src: "/logos/idiMak.webp", alt: "IDI Makererer" },
    { src: "/logos/ace.webp", alt: "ACE" },
    { src: "/logos/wellcome.webp", alt: "Wellcome Fund" },
  ];
  return (
      <div className="bg-white w-full h-auto pb-[1rem] flex items-center justify-around">
        {images.map((image) => (
          <div key={image.src} className="relative ">
            <Image
              src={image.src}
              alt={image.alt}
              className="object-scale-down w-[100%] max-h-[4.5rem] h-auto"
              width={100}
              height={70}
            />
          </div>
        ))}
      </div>
  );
}
