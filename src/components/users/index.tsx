"use client";
import { useState, useEffect } from "react";
import { useAdminUsersWith } from "@/lib/hooks/useRoles";
import { useMutation } from "@tanstack/react-query";
import dynamic from "next/dynamic";
import { assignRole, removeRole } from "@/lib/hooks/useRoles";
import { toast } from "sonner";
import { useSearch } from "@/context/searchContext";

const DotsLoader = dynamic(() => import('../ui/dotsLoader'), { ssr: false });

interface Role {
  id: string;
  role: string;
  user_id: string;
  created_at: string;
}

interface User {
  id: string;
  email: string;
  is_active: boolean;
  name: string;
  hashed_password: string;
  is_superuser: boolean;
  roles: Role[];
}

const AdminUsers = () => {
  const { data, isLoading, error } = useAdminUsersWith();
  const users: User[] = data?.data || [];

  const { data:assignData, isSuccess:isAssignSuccess, mutate: assignAdmin,  error:assignError, isPending: isAssigningAdmin } = useMutation({mutationFn: assignRole});

  const { data:removeData, isSuccess:isRemoveSuccess ,mutate: removeAdmin, error:removeError, isPending: isRemovingAdmin } = useMutation({mutationFn: removeRole});

  const handleAssignAdmin = (userId: string) => {
    assignAdmin({user_id:userId,role:'admin'});
  };

  const handleRemoveAdmin = (userId: string) => {
    removeAdmin({user_id:userId ,role:'admin'});
  };

  useEffect(() => {
    if (assignData && isAssignSuccess) {  
      toast.success("Role updated successfully ");
      window.location.reload();
    }
    if (assignError) {
      toast.error(
        `Failed to update role`
      );
    }

  }, [assignData,isAssignSuccess,assignError]);

  useEffect(() => {
    if (removeData && isRemoveSuccess) {
        toast.success("Role updated successfully ");
        window.location.reload();
    }
    if (removeError) {
      toast.error(
        `Failed to update the role`
      );
    }

  }, [ removeData, isRemoveSuccess,removeError ]);


  return (
    <div className="flex-1 p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Users</h1>
      </div>

      {isLoading && (
        <div className="flex justify-center">
          <DotsLoader />
        </div>
      )}

      {error && (
        <div className="text-red-600 text-center">
         {"Failed to load users. Make sure your super admin ;}."}
        </div>
      )}

      {!isLoading && !error && (
        <div className="overflow-auto">
          <table className="text-[12px] sm:text-sm border-collapse rounded-t-lg overflow-hidden">
            <thead className="bg-[#00B9F1] text-white">
              <tr>
                <th className="p-5 text-left">Name</th>
                <th className="p-5 text-left">Email</th>
                <th className="p-5 text-left">Roles</th>
                <th className="p-5 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => {
                const isAdmin = user.roles.some((role) => role.role === "admin");

                return (
                  <tr key={user.id} className="even:bg-[#EBF7FD]">
                    <td className="border p-5 text-left">{user.name}</td>
                    <td className="border p-5 text-left">{user.email}</td>
                    <td className="border p-5 text-left">
                      {user.roles.map((role) => role.role).join(", ")}
                    </td>
                    <td className="border p-5 text-left flex flex-row gap-4">
                      {isAdmin ? (
                        <button
                          onClick={() => handleRemoveAdmin(user.id)}
                          className="text-red-600"
                        >
                          {isRemovingAdmin ? <DotsLoader /> : "Remove Admin"}
                        </button>
                      ) : (
                        <button
                          onClick={() => handleAssignAdmin(user.id)}
                          className="text-green-600"
                        >
                          {isAssigningAdmin ? <DotsLoader /> : "Assign Admin"}
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;