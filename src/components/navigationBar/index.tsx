"use client";

import Link from "next/link";
import { useQueryClient } from '@tanstack/react-query';
import { HomeIcon, MagnifyingGlassIcon, PersonIcon, HamburgerMenuIcon, Cross1Icon} from "@radix-ui/react-icons";
import { useEffect, useState } from "react";
import { logout } from "@/lib/hooks/useAuth";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
// import { toast } from "sonner";
import { useSearch } from "@/context/searchContext";
import { useUserInfor } from "@/lib/hooks/useAuth";
import { useMutation } from "@tanstack/react-query";
import dynamic from "next/dynamic";
const DotsLoader = dynamic(() => import("../ui/dotsLoader"), { ssr: false });

import { appMenuSteps } from "../GuideTour/steps";

const GuideTour = dynamic(() => import("@/components/GuideTour"), { ssr: false });

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

  const [dropdownOpen, setDropdownOpen] = useState(isActive("/") ? true : false);

  const handleLogout = async (e:any) => {
    e.preventDefault()
    setAdmin(false);
    setIsLoggedIn(false);
    logoutFn();
  };

  return (
    <>
    <div className="bg-[#24408E] max-sm:text-[10px] w-full h-[2.5rem] flex justify-between items-center px-[1rem] text-white">
      <div className="w-[60%] flex gap-[0.4rem] sm:gap-[1rem] items-start">
      <div className="md:hidden relative">
          <button className="transition-all" onClick={() => setDropdownOpen(!dropdownOpen)}>
            {!dropdownOpen ? <HamburgerMenuIcon className="w-6 h-6" /> :  <Cross1Icon className="w-6 h-6" />}
          </button>
          {dropdownOpen && (
            <div className="absolute w-[10rem] top-full left-0 bg-[#24408E] p-2 z-40 rounded shadow-lg flex flex-col gap-2">
              <Link href="/" className={` ${isActive("/") ? "text-[#00B9F1]" : "text-white"}`}>Home</Link>
              <Link href="/datasets" className={` ${isActive("/datasets") ? "text-[#00B9F1]" : "text-white"}`}>Catalogue</Link>
              <Link className={` ${isActive("/datasets/access") ? "text-[#00B9F1]" : "text-white"}`} href={isLoggedIn ? "/datasets/access" : "/authenticate" }>Data Access</Link>
              <Link href="/datasets/publication" className={` ${isActive("/datasets/publication") ? "text-[#00B9F1]" : "text-white"}`}>Publications</Link>
              <Link href="/datasets/external" className={`${isActive("/datasets/external") ? "text-[#00B9F1]" : "text-white"}`}>Contribute</Link>
              {admin && <Link href="/datasets/admin" className={`${isActive("/datasets/admin") ? "text-[#00B9F1]" : "text-white"}`}>Admin</Link>}
            </div>
          )}
        </div>
        
        <div className="md:flex hidden gap-[1rem]">
        <Link href="/" className={`home_button self-center flex flex-row items-center justify-center ${isActive("/") ? "text-[#00B9F1]" : "text-white"}`}>
          <HomeIcon /> <span className=" ml-2">Home</span>
        </Link>
          <Link href="/datasets" className={`catalogue_button ${isActive("/datasets") ? "text-[#00B9F1]" : "text-white"}`}>
            <span className="ml-2">Catalogue</span>
          </Link>
          <Link href={isLoggedIn ? "/datasets/access" : "/authenticate"} className={`data_access_button ${pathname.includes("/datasets/access") ? "text-[#00B9F1]" : "text-white"}`}>
            <span className="ml-2">Data Access</span>
          </Link>
          <Link href="/datasets/publication" className={`publications_button ${isActive("/datasets/publication") ? "text-[#00B9F1]" : "text-white"}`}>
            <span className="ml-2">Publications</span>
          </Link>
          <Link href="/datasets/external" className={` ${isActive("/datasets/external") ? "text-[#00B9F1]" : "text-white"}`}>
            <span className="ml-2">Contribute</span>
          </Link>
          {admin && <Link href="/datasets/admin" className={`admin_button ${pathname.includes("/datasets/admin") ? "text-[#00B9F1]" : "text-white"}`}>
            <span className="ml-2">Admin</span>
          </Link>}
        </div>
        
      </div>
      <div className="flex flex-row items-center gap-[0.3rem] sm:gap-[1rem] justify-center">
        {pathname != "/" && <div className="relative max-md:hidden">
          <input type="text" placeholder="Search name or category..." className="p-[5px] placeholder:pl-[20px] rounded-[12px] text-[12px] border-[1px] border-white pr-10 md:min-w-[20rem] bg-transparent shadow-custom" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          {!searchTerm && <MagnifyingGlassIcon className="absolute left-2 bottom-[7px] w-4 h-4 text-white" />}
        </div>}
        <Link href={'/guide'} className={`guide_button ${pathname.includes("/guide") ? "text-[#00B9F1]" : "text-white"}`}>
          <span className="ml-2">GUIDE</span>
        </Link>
        {isLoggedIn ? (
            <>
              <button onClick={handleLogout}>
                {logoutPending ? <DotsLoader /> : "LOGOUT"}
              </button>
              <Link
                href="/profile"
                className="profile_button flex items-center hover:text-[#00B9F1]"
                title="View Profile"
              >
                <PersonIcon className="w-5 h-5" />
              </Link>
            </>
          ) : (
            <Link className="auth_button" href="/authenticate">
              LOGIN
            </Link>
          )}
      </div>
    </div>
    <GuideTour steps={appMenuSteps} guideKey="menu-page" />
    </>
  );
};

export default NavigationBar;
