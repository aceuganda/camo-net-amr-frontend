"use client";

import Link from "next/link";
import { useQueryClient } from '@tanstack/react-query';
import { HomeIcon, MagnifyingGlassIcon, PersonIcon, HamburgerMenuIcon, Cross1Icon} from "@radix-ui/react-icons";
import { useEffect, useState } from "react";
import { logout } from "@/lib/hooks/useAuth";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
import { useSearch } from "@/context/searchContext";
import { useUserInfor } from "@/lib/hooks/useAuth";
import { useMutation } from "@tanstack/react-query";
import dynamic from "next/dynamic";
import { BookOpen, Shield, Database, FileText, Plus, Settings, Search, LogOut, User, Brain } from "lucide-react";

const DotsLoader = dynamic(() => import("../ui/dotsLoader"), { ssr: false });
const GuideTour = dynamic(() => import("@/components/GuideTour"), { ssr: false });

import { appMenuSteps } from "../GuideTour/steps";

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

  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLogout = async (e:any) => {
    e.preventDefault()
    setAdmin(false);
    setIsLoggedIn(false);
    logoutFn();
  };

  const navItems = [
    { href: "/", label: "Home", icon: HomeIcon, className: "home_button" },
    { href: "/datasets", label: "Catalogue", icon: Database, className: "catalogue_button" },
    { 
      href: isLoggedIn ? "/datasets/access" : "/authenticate", 
      label: "Access", 
      icon: Shield, 
      className: "data_access_button",
      isActive: pathname.includes("/datasets/access")
    },
       { 
      href: isLoggedIn ? "/models" : "/authenticate?redirect=/models", 
      label: "Models", 
      icon: Brain, 
      className: "models_button",
      isActive: pathname.includes("/models")
    },
    { href: "/datasets/publication", label: "Publications", icon: FileText, className: "publications_button" },
    { href: "/datasets/external", label: "Contribute", icon: Plus },
  ];

  if (admin) {
    navItems.push({ 
      href: "/datasets/admin", 
      label: "Admin", 
      icon: Settings, 
      className: "admin_button",
      isActive: pathname.includes("/datasets/admin")
    });
  }

  return (
    <>
      <nav className="bg-gradient-to-r from-[#24408E] via-[#1e3a82] to-[#24408E] backdrop-blur-sm border-b border-white/10 shadow-2xl">
        <div className="w-full h-14 flex justify-between items-center px-4 text-white relative overflow-hidden">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <div className="max-[860px]:block hidden relative">
              <button 
                className="p-2 hover:bg-white/10 rounded-lg transition-all duration-200 hover:scale-105" 
                onClick={() => setDropdownOpen(!dropdownOpen)}
              >
                {!dropdownOpen ? (
                  <HamburgerMenuIcon className="w-5 h-5" />
                ) : (
                  <Cross1Icon className="w-5 h-5" />
                )}
              </button>
              
              {/* Mobile Dropdown */}
              {dropdownOpen && (
                <div className="fixed top-14 left-0 right-0 mx-4 z-[99999] bg-white/95 backdrop-blur-sm border border-white/20 rounded-xl shadow-2xl py-2 transform transition-all duration-200 animate-in slide-in-from-top-2">
                  {navItems.map((item, index) => {
                    const Icon = item.icon;
                    const isItemActive = item.isActive !== undefined ? item.isActive : isActive(item.href);
                    return (
                      <Link
                        key={index}
                        href={item.href}
                        className={`flex items-center gap-3 px-4 py-3 text-xs font-medium transition-all duration-200 hover:bg-gradient-to-r hover:from-[#00B9F1]/10 hover:to-[#24408E]/10 border-l-4 border-transparent hover:border-[#00B9F1] ${
                          isItemActive 
                            ? "text-[#24408E] bg-gradient-to-r from-[#00B9F1]/20 to-[#24408E]/20 border-l-[#00B9F1]" 
                            : "text-gray-700 hover:text-[#24408E]"
                        }`}
                        onClick={() => setDropdownOpen(false)}
                      >
                        <Icon className="w-4 h-4" />
                        {item.label}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Desktop Navigation */}
            <div className="min-[861px]:flex hidden items-center gap-3 lg:gap-4 xl:gap-6">
              {navItems.map((item, index) => {
                const Icon = item.icon;
                const isItemActive = item.isActive !== undefined ? item.isActive : isActive(item.href);
                return (
                  <Link
                    key={index}
                    href={item.href}
                    className={`${item.className || ''} flex items-center gap-1 lg:gap-2 px-2 lg:px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 hover:bg-white/10 hover:scale-105 group ${
                      isItemActive ? "text-[#00B9F1] bg-white/10" : "text-white hover:text-[#00B9F1]"
                    }`}
                  >
                    <Icon className="w-4 h-4 group-hover:rotate-6 transition-transform duration-200" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Right Section - Search & User Actions */}
          <div className="flex items-center gap-2 lg:gap-3">

            {/* Guide Button */}
            <Link
              href="/guide"
              className={`guide_button flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:bg-white/10 hover:scale-105 group ${
                pathname.includes("/guide") ? "text-[#00B9F1] bg-white/10" : "text-white hover:text-[#00B9F1]"
              }`}
            >
              <BookOpen className="w-4 h-4 group-hover:rotate-12 transition-transform duration-200" />
              <span className="hidden min-[900px]:inline">GUIDE</span>
            </Link>

            {/* User Actions */}
            {isLoggedIn ? (
              <div className="flex items-center gap-1 sm:gap-2">
                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  disabled={logoutPending}
                  className="flex items-center gap-1 px-2 sm:px-3 py-2 rounded-lg text-xs sm:text-sm font-medium text-white hover:text-red-300 hover:bg-red-500/10 transition-all duration-200 hover:scale-105 disabled:opacity-50 group"
                >
                  {logoutPending ? (
                    <DotsLoader />
                  ) : (
                    <>
                      <LogOut className="w-4 h-4 group-hover:rotate-12 transition-transform duration-200" />
                      <span className="hidden min-[900px]:inline">LOGOUT</span>
                    </>
                  )}
                </button>

                {/* Profile Button */}
                <Link
                  href="/profile"
                  className="profile_button flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-white/10 hover:bg-white/20 transition-all duration-200 hover:scale-105 group border border-white/20"
                  title="View Profile"
                >
                  <User className="w-4 h-4 sm:w-5 sm:h-5 text-white group-hover:text-[#00B9F1] transition-colors duration-200" />
                </Link>
              </div>
            ) : (
              <Link
                href="/authenticate"
                className="auth_button flex items-center gap-1 px-2 sm:px-4 py-2 bg-gradient-to-r from-[#00B9F1] to-[#0ea5e9] hover:from-[#0ea5e9] hover:to-[#00B9F1] text-white rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 hover:scale-105 hover:shadow-lg"
              >
                <User className="w-4 h-4" />
                <span className="hidden min-[900px]:inline">LOGIN</span>
              </Link>
            )}
          </div>
        </div>

      </nav>
      
      <GuideTour steps={appMenuSteps} guideKey="menu-page" />
    </>
  );
};

export default NavigationBar;