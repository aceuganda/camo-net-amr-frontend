"use client";

import Link from "next/link";
import { HomeIcon, MagnifyingGlassIcon } from "@radix-ui/react-icons";
import { useEffect, useState } from "react";
import { logout } from "@/lib/hooks/useAuth";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useSearch } from "@/context/searchContext";

const NavigationBar = () => {
  const pathname = usePathname();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter();
  const { searchTerm, setSearchTerm } = useSearch();

  const [roles, setRoles] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Safe to use localStorage
      const storedRoles = localStorage.getItem('amr_user_roles');
      setRoles(storedRoles);
    }
  }, []);
  const isActive = (path: string) => pathname === path;
  useEffect(() => {
    const token = localStorage.getItem("access_token");
    setIsLoggedIn(!!token);
  }, []);

  const handleLogout = async () => {
    const logMeOut = await logout();
    if (logMeOut) {
      setIsLoggedIn(false);
      toast.message("Logged out successfully");
      router.push("/");
    }
  };

  return (
    <div className="bg-[#24408E] max-sm:text-[10px] w-full h-[2.5rem] flex justify-between items-center px-[1rem] text-white">
      <div className="w-[40%] flex gap-[1rem] items-start">
        <Link
          href="/"
          className={`flex flex-row items-center justify-center ${
            isActive("/") ? "text-[#00B9F1]" : "text-white"
          }`}
        >
          <HomeIcon /> <span className="ml-2">Home</span>
        </Link>
        <Link
          href="/datasets"
          className={`flex flex-row items-center justify-center ${
            isActive("/datasets") ? "text-[#00B9F1]" : "text-white"
          }`}
        >
          <span className="ml-2">Catalogue</span>
        </Link>
        {/* <Link href="/projects" className={`flex flex-row items-center justify-center ${isActive('/') ? 'text-[#00B9F1]' : 'text-white'}`}>
          <span className="ml-2">Projects</span>
        </Link> */}
        <Link
          href={isLoggedIn ? "/datasets/access" : "/auth"}
          className={`flex flex-row items-center justify-center  text-nowrap ${
            pathname.includes("/datasets/access") ? "text-[#00B9F1]" : "text-white"
          }`}
        >
          <span className="ml-2 w-full">Data Access</span>
        </Link>
        {roles?.includes('admin') && <Link
          href={isLoggedIn ? "/datasets/admin" : "/auth"}
          className={`flex flex-row items-center justify-center  text-nowrap ${
            pathname.includes("/datasets/admin") ? "text-[#00B9F1]" : "text-white"
          }`}
        >
          <span className="ml-2 w-full">Admin</span>
        </Link>}
      </div>

      <div className="flex flex-row items-center gap-[2rem] justify-center">
        <div className="relative max-sm:hidden ">
          <input
            type="text"
            placeholder="Search name or category..."
            className="p-[5px] placeholder:pl-[20px] rounded-[12px] text-[12px] border-[1px] border-white pr-10 md:min-w-[30rem] bg-transparent  shadow-custom"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {!searchTerm  && <MagnifyingGlassIcon className="absolute left-2 bottom-[7px]  w-4 h-4 text-white" />}
        </div>

        {isLoggedIn ? (
          <button onClick={handleLogout}>LOGOUT</button>
        ) : (
          <Link href="/auth">LOGIN</Link>
        )}
      </div>
    </div>
  );
};

export default NavigationBar;
