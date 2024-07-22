
"use client"
import Link from "next/link";
import { HomeIcon } from "@radix-ui/react-icons";
import { useEffect, useState } from 'react';
import { logout } from "@/lib/hooks/useAuth";
import { usePathname } from 'next/navigation'
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const NavigationBar = () => {
  const pathname  = usePathname(); 
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter()
  
  const isActive = (path: string) => pathname === path;
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    setIsLoggedIn(!!token);
  }, []);

  const handleLogout = async () => {
    const logMeOut = await logout();
    if(logMeOut){
      setIsLoggedIn(false);
      toast.message("Logged out successfully");
      router.push('/');
    }
  };

  return (
    <div className="bg-[#24408E] w-full h-[2.5rem] flex justify-between items-center px-[1rem] text-white">
      <div className="w-[40%] flex gap-[1rem] items-start">
        <Link href="/" className={`flex flex-row items-center justify-center ${isActive('/') ? 'text-[#00B9F1]' : 'text-white'}`}>
          <HomeIcon /> <span className="ml-2">Home</span>
        </Link>
        <Link href="/datasets" className={`flex flex-row items-center justify-center ${isActive('/datasets') ? 'text-[#00B9F1]' : 'text-white'}`}>
          <span className="ml-2">Catalogue</span>
        </Link>
        {/* <Link href="/projects" className={`flex flex-row items-center justify-center ${isActive('/') ? 'text-[#00B9F1]' : 'text-white'}`}>
          <span className="ml-2">Projects</span>
        </Link> */}
        <Link href="/data-access" className={`flex flex-row items-center justify-center ${isActive('/') ? 'text-[#00B9F1]' : 'text-white'}`}>
          <span className="ml-2">Data Access</span>
        </Link>
      </div>

      <div className="flex flex-row items-center justify-center">
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





