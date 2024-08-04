"use client";
import Link from "next/link";
import { useState, useEffect } from 'react';
import { usePathname } from "next/navigation";
import { useUserInfor } from "@/lib/hooks/useAuth";
import { useRouter } from "next/navigation";





export default function Layout({ children }: { children: React.ReactNode }) {

  const { data, isLoading, error } = useUserInfor(); 
    const [roles, setRoles] = useState<string | null | undefined>(null);
    const pathname = usePathname();
    const router = useRouter()


  useEffect(() => {
    if (data?.data) {
      setRoles(data.data.user.roles);
    }
    if (error){
      router.push("/authenticate");
    }
  }, [data, error, router]);

  return (
    <div>
      <div className="flex">
        <div className="w-64 bg-gray-200 h-screen p-4">
          <h2 className="text-2xl font-bold mb-4">Admin</h2>
          <nav>
            <ul>
              <li className={`mb-2 ${pathname==='/datasets/admin'? 'text-[#24408E] ' : '' }`}>
                <Link href="/datasets/admin">Requests</Link>
              </li>
              {roles?.includes("super_admin") && (
                <li className={`mb-2   ${pathname==='/datasets/admin/users'? 'text-[#24408E] ' : '' }`}>
                  <Link href="/datasets/admin/users">Users</Link>
                </li>
              )}
            </ul>
          </nav>
        </div>
        {children}
      </div>
    </div>
  );
}
