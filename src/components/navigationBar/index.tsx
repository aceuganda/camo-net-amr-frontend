"use client";

import Link from "next/link";
import { useQueryClient } from '@tanstack/react-query';
import { HomeIcon, MagnifyingGlassIcon } from "@radix-ui/react-icons";
import { useEffect, useState } from "react";
import { logout } from "@/lib/hooks/useAuth";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useSearch } from "@/context/searchContext";
import { useUserInfor } from "@/lib/hooks/useAuth";
import { useMutation } from "@tanstack/react-query";
import dynamic from "next/dynamic";
const DotsLoader = dynamic(() => import("../ui/dotsLoader"), { ssr: false });

const NavigationBar = () => {
  const pathname = usePathname();
  const queryClient = useQueryClient();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [admin, setAdmin] = useState(false);
  const router = useRouter();
  const { searchTerm, setSearchTerm } = useSearch();
  const { data, error } = useUserInfor(); 
  const {isSuccess:logoutSuccess, isPending:logoutPending, mutate:logoutFn} = useMutation({
    mutationFn: logout,
  });

  useEffect(() => {
    if (data?.data) {
      const roles = data.data.user.roles;
      setAdmin(roles.includes('admin'));
      setIsLoggedIn(data.data.logged_in);
    }
  }, [data, error]);

  useEffect(() => {
    if(logoutSuccess){
      queryClient.invalidateQueries({ queryKey: ['user_info'] });
      setAdmin(false);
      setIsLoggedIn(false);
      router.push('/')
    } 
  }, [logoutSuccess,router]);

  const isActive = (path: string) => pathname === path;

  const handleLogout = async (e:any) => {
    e.preventDefault()
    setAdmin(false);
    setIsLoggedIn(false);
    logoutFn();
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
        <Link
          href={isLoggedIn ? "/datasets/access" : "/authenticate"}
          className={`flex flex-row items-center justify-center text-nowrap ${
            pathname.includes("/datasets/access") ? "text-[#00B9F1]" : "text-white"
          }`}
        >
          <span className="ml-2 w-full">Data Access</span>
        </Link>
        <Link
          href={'/guide'}
          className={`flex flex-row items-center justify-center text-nowrap ${
            pathname.includes("/guide") ? "text-[#00B9F1]" : "text-white"
          }`}
        >
          <span className="ml-2 w-full">User Guide</span>
        </Link>
        {admin===true ? <Link
          href={isLoggedIn ? "/datasets/admin" : "/authenticate"}
          className={`flex flex-row items-center justify-center text-nowrap ${
            pathname.includes("/datasets/admin") ? "text-[#00B9F1]" : "text-white"
          }`}
        >
          <span className="ml-2 w-full">Admin</span>
        </Link>:null}
      </div>

      <div className="flex flex-row items-center gap-[2rem] justify-center">
        <div className="relative max-md:hidden">
          <input
            type="text"
            placeholder="Search name or category..."
            className="p-[5px] placeholder:pl-[20px] rounded-[12px] text-[12px] border-[1px] border-white pr-10 md:min-w-[30rem] bg-transparent shadow-custom"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {!searchTerm && <MagnifyingGlassIcon className="absolute left-2 bottom-[7px] w-4 h-4 text-white" />}
        </div>

        {isLoggedIn ? (
          <button onClick={handleLogout}>{logoutPending ?<DotsLoader/>:"LOGOUT"}</button>
        ) : (
          <Link href="/authenticate">LOGIN</Link>
        )}
      </div>
    </div>
  );
};

export default NavigationBar;
