import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });
import Image from "next/image";

export const metadata: Metadata = {
  title: "Camo-net Data portal",
  description:
    "This portal gives a snippet of the data being handled in the camo-net project",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const images = [
    { src: "/logos/camonet.webp", alt: "CAMO-NET" },
    { src: "/logos/idiMak.webp", alt: "IDI Makererer" },
    { src: "/logos/ace.webp", alt: "ACE" },
    { src: "/logos/wellcome.webp", alt: "Wellcome Fund" },
   
  ];
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="flex flex-col w-[100%] h-[100%]">
          <div className="bg-white w-full h-auto pb-[1rem] flex items-center justify-around">
            {images.map((image) => (
              <div key={image.src} className="relative ">
                <Image src={image.src} alt={image.alt} className="object-scale-down w-[100%] max-h-[4.5rem] h-auto" 
      width={100}
      height={70} />
              </div>
            ))}
          </div>

          {children}
        </div>
      </body>
    </html>
  );
}
