import HomeCatalogue from "@/components/landingCatalogue";
import { link } from "fs";
import Image from "next/image";
import Link from "next/link";

export default function LogoHeader() {
  const images = [
    { src: "/logos/cnetug.webp", alt: "", link: "https://camonet.org" },
    { src: "/logos/idmak.webp", alt: " ", link: "https://idi.mak.ac.ug"  },
    { src: "/logos/ace.webp", alt: "ACE", link: "https://ace.ac.ug"  },
    { src: "/logos/welc.webp", alt: "", link: "https://wellcome.org"  },
  ];
  return (
      <div className="bg-white w-full h-auto pb-[1rem] flex items-center justify-around">
        {images.map((image) => (
          <Link href={image.link} key={image.src} className="relative ">
            <Image
              src={image.src}
              alt={image.alt}
              className="object-scale-down w-[100%] max-h-[4.5rem] h-auto"
              width={100}
              height={70}
            />
          </Link>
        ))}
      </div>
  );
}
