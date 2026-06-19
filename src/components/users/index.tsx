"use client";
import { useState, useEffect } from "react";
import { useAdminUsersWith, useUserDataSets } from "@/lib/hooks/useRoles";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { assignRole, removeRole, revokeAccess, assignDataSet, removeDataSet } from "@/lib/hooks/useRoles";
import { useGetCatalogue } from "@/lib/hooks/useCatalogue";
import { toast } from "sonner";
import {
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetDescription 
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious 
} from "@/components/ui/pagination";
import { CheckCircle2, Search, XCircle } from "lucide-react";

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
  disabled: boolean | null;
  is_superuser: boolean;
  roles: Role[];
}

const isUserDisabled = (user: Pick<User, "disabled" | "is_active">) =>
  user.disabled === true || user.is_active === false;

const isAdminLike = (user: Pick<User, "roles">) =>
  user.roles.some((role) => role.role === "admin" || role.role === "super_admin");

const syncUserInCollection = (
  users: User[],
  userId: string,
  updater: (user: User) => User
) => users.map((user) => (user.id === userId ? updater(user) : user));

const AdminUsers = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const { data, isLoading, error } = useAdminUsersWith(debouncedSearch);
  const users: User[] = data?.data || [];
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [datasetToGrant, setDatasetToGrant] = useState("");
  const itemsPerPage = 8;

  useEffect(() => {
    const handle = setTimeout(() => setDebouncedSearch(searchTerm.trim()), 350);
    return () => clearTimeout(handle);
  }, [searchTerm]);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch]);

  const { data: catalogueData } = useGetCatalogue();
  const catalogueDatasets: { id: string; name: string }[] = catalogueData?.data || [];

  const {
    data: userDataSetsQuery,
    isLoading: userDataSetsLoading,
  } = useUserDataSets(selectedUser?.id || "", !!selectedUser && isAdminLike(selectedUser));
  const userDataSets: { permission_id: string; data_set_id: string; data_set_name: string; title: string }[] =
    userDataSetsQuery?.data || [];

  const {
    mutate: assignDataSetFn,
    isPending: isAssigningDataSet,
  } = useMutation({
    mutationFn: assignDataSet,
    onSuccess: async () => {
      toast.success("Dataset granted successfully");
      setDatasetToGrant("");
      await queryClient.invalidateQueries({ queryKey: ["user_data_sets", selectedUser?.id] });
    },
    onError: () => {
      toast.error("Failed to grant dataset access");
    }
  });

  const {
    mutate: removeDataSetFn,
    isPending: isRemovingDataSet,
  } = useMutation({
    mutationFn: removeDataSet,
    onSuccess: async () => {
      toast.success("Dataset access removed");
      await queryClient.invalidateQueries({ queryKey: ["user_data_sets", selectedUser?.id] });
    },
    onError: () => {
      toast.error("Failed to remove dataset access");
    }
  });

  const {
    mutate: assignAdmin,
    isPending: isAssigningAdmin,
  } = useMutation({ 
    mutationFn: assignRole,
    onSuccess: async (_, variables) => {
      toast.success("Role updated successfully");
      setSelectedUser((current) =>
        current?.id === variables.user_id
          ? {
              ...current,
              roles: [
                ...current.roles,
                {
                  id: `optimistic-admin-${variables.user_id}`,
                  role: "admin",
                  user_id: variables.user_id,
                  created_at: new Date().toISOString(),
                },
              ],
            }
          : current
      );
      setSheetOpen(false);
      await queryClient.invalidateQueries({ queryKey: ["admin_users"] });
    },
    onError: () => {
      toast.error("Failed to update role");
    }
  });

  const {
    mutate: removeAdmin,
    isPending: isRemovingAdmin,
  } = useMutation({ 
    mutationFn: removeRole,
    onSuccess: async (_, variables) => {
      toast.success("Role updated successfully");
      setSelectedUser((current) =>
        current?.id === variables.user_id
          ? {
              ...current,
              roles: current.roles.filter((role) => role.role !== variables.role),
            }
          : current
      );
      setSheetOpen(false);
      await queryClient.invalidateQueries({ queryKey: ["admin_users"] });
    },
    onError: () => {
      toast.error("Failed to update role");
    }
  });

  const {
    mutate: revokeAccessFn,
    isPending: isRevokingAccess,
  } = useMutation({ 
    mutationFn: revokeAccess,
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: ["admin_users", debouncedSearch] });

      const previousUsers = queryClient.getQueryData<{ data: User[] }>(["admin_users", debouncedSearch]);
      queryClient.setQueryData<{ data: User[] }>(["admin_users", debouncedSearch], (current) => {
        if (!current?.data) {
          return current;
        }

        return {
          ...current,
          data: syncUserInCollection(current.data, variables.user_id, (user) => ({
            ...user,
            disabled: variables.disabled,
            is_active: !variables.disabled,
          })),
        };
      });

      setSelectedUser((current) =>
        current?.id === variables.user_id
          ? {
              ...current,
              disabled: variables.disabled,
              is_active: !variables.disabled,
            }
          : current
      );

      return { previousUsers };
    },
    onSuccess: async (_, variables) => {
      toast.success(
        variables.disabled
          ? "User disabled successfully"
          : "User enabled successfully"
      );
      setSheetOpen(false);
      await queryClient.refetchQueries({ queryKey: ["admin_users", debouncedSearch], exact: true });
    },
    onError: (_, variables, context) => {
      if (context?.previousUsers) {
        queryClient.setQueryData(["admin_users", debouncedSearch], context.previousUsers);
      }
      setSelectedUser((current) =>
        current?.id === variables.user_id
          ? {
              ...current,
              disabled: !variables.disabled,
              is_active: variables.disabled,
            }
          : current
      );
      toast.error(
        variables.disabled
          ? "Failed to disable user"
          : "Failed to enable user"
      );
    }
  });

  const filteredUsers = users;

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const paginatedData = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleViewDetails = (user: User) => {
    setSelectedUser(user);
    setSheetOpen(true);
    setDatasetToGrant("");
  };

  useEffect(() => {
    if (currentPage > 1 && paginatedData.length === 0 && filteredUsers.length > 0) {
      setCurrentPage(Math.min(currentPage, totalPages));
    }
  }, [currentPage, filteredUsers.length, paginatedData.length, totalPages]);

  return (
    <div className="flex min-h-[calc(100vh-3rem)] flex-col gap-4 sm:gap-6">
      <div className="rounded-[24px] border border-white/70 bg-white/90 p-4 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur sm:rounded-[28px] sm:p-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-cyan-600 sm:text-xs">
              Identity Control
            </p>
            <h1 className="mt-2 text-2xl font-semibold text-slate-900 sm:text-3xl">
              User Management
            </h1>
            <p className="mt-2 max-w-2xl text-xs leading-6 text-slate-600 sm:text-sm">
              Assign admin privileges, review account state, and disable access without forcing a full page refresh.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name or email..."
                className="w-full rounded-full border border-slate-200 bg-white py-2 pl-9 pr-4 text-xs text-slate-700 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-400/20 sm:w-64 sm:text-sm"
              />
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600 sm:px-4 sm:py-3 sm:text-sm">
              <span className="font-semibold text-slate-900">{filteredUsers.length}</span>{" "}
              matching users
            </div>
          </div>
        </div>
      </div>

      {isLoading && (
        <div className="flex h-52 items-center justify-center rounded-[24px] border border-white/70 bg-white/80 sm:h-64 sm:rounded-[28px]">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-[#00B9F1]"></div>
        </div>
      )}

      {error && (
        <div className="rounded-[24px] border border-red-200 bg-red-50 p-4 text-center text-sm text-red-600 sm:rounded-[28px]">
          Failed to load users. Make sure you&rsquo;re a super admin.
        </div>
      )}

      {filteredUsers.length === 0 && searchTerm && (
        <div className="rounded-[24px] border border-slate-200 bg-white/90 p-4 text-center text-sm text-gray-500 sm:rounded-[28px]">
          No users found for search term: <strong>{searchTerm}</strong>
        </div>
      )}

      <div className="flex-1 overflow-auto">
        {filteredUsers.length > 0 && !isLoading && !error && (
          <div className="overflow-hidden rounded-[24px] border border-white/70 bg-white/90 shadow-[0_24px_80px_rgba(15,23,42,0.08)] sm:rounded-[28px]">
            <Table>
              <TableHeader className="bg-slate-950 text-white">
                <TableRow>
                  <TableHead className="px-3 py-3 text-xs text-slate-100 sm:text-sm">Name</TableHead>
                  <TableHead className="hidden px-3 py-3 text-xs text-slate-100 sm:table-cell sm:text-sm">Email</TableHead>
                  <TableHead className="px-3 py-3 text-xs text-slate-100 sm:text-sm">Roles</TableHead>
                  <TableHead className="px-3 py-3 text-xs text-slate-100 sm:text-sm">Status</TableHead>
                  <TableHead className="text-right text-xs text-slate-100 sm:text-sm">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedData.map((user) => {
                  const isAdmin = user.roles.some(role => role.role === "admin");
                  const disabledAccount = isUserDisabled(user);
                  return (
                    <TableRow
                      key={user.id}
                      className="cursor-pointer transition-colors hover:bg-cyan-50/70"
                      onClick={() => handleViewDetails(user)}
                    >
                      <TableCell className="px-3 py-3 text-xs font-medium sm:text-sm">{user.name}</TableCell>
                      <TableCell className="hidden px-3 py-3 text-xs sm:table-cell sm:text-sm">{user.email}</TableCell>
                      <TableCell className="px-3 py-3 text-xs sm:text-sm">{user.roles.map(role => role.role).join(", ")}</TableCell>
                      <TableCell className="px-3 py-3">
                        <span className={`rounded-full px-2 py-1 text-[10px] sm:text-xs ${
                          disabledAccount
                            ? 'bg-red-100 text-red-800'
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {disabledAccount ? 'Inactive' : 'Active'}
                        </span>
                      </TableCell>
                      <TableCell className="px-2 py-3 text-right sm:px-3">
                        <div className="flex justify-end gap-1 sm:gap-2">
                          {isAdmin ? (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 px-2 text-[11px] text-red-600 hover:bg-red-100 sm:h-9 sm:px-3 sm:text-sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                removeAdmin({ user_id: user.id, role: "admin" });
                              }}
                              disabled={isRemovingAdmin}
                            >
                              <XCircle className="mr-2 h-4 w-4" />
                              Remove Admin
                            </Button>
                          ) : (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 px-2 text-[11px] text-green-600 hover:bg-green-100 sm:h-9 sm:px-3 sm:text-sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                assignAdmin({ user_id: user.id, role: "admin" });
                              }}
                              disabled={isAssigningAdmin}
                            >
                              <CheckCircle2 className="mr-2 h-4 w-4" />
                              Assign Admin
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>

            <Pagination className="bg-gray-50 p-3 sm:p-4">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      setCurrentPage(Math.max(1, currentPage - 1));
                    }}
                    className={currentPage === 1 ? 'pointer-events-none opacity-50' : ''}
                  />
                </PaginationItem>
                {[...Array(totalPages)].map((_, i) => (
                  <PaginationItem key={i}>
                    <PaginationLink
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        setCurrentPage(i + 1);
                      }}
                      isActive={currentPage === i + 1}
                    >
                      {i + 1}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                <PaginationItem>
                  <PaginationNext
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      setCurrentPage(Math.min(totalPages, currentPage + 1));
                    }}
                    className={currentPage === totalPages ? 'pointer-events-none opacity-50' : ''}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </div>

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent
          side="right"
          className="w-full max-w-full overflow-y-auto border-l border-slate-200 bg-white px-4 sm:max-w-[500px] sm:px-6"
        >
          {selectedUser && (
            <div className="space-y-5 py-4 sm:space-y-6 sm:py-6">
              <SheetHeader>
                <SheetTitle className="text-xl text-[#00B9F1] sm:text-2xl">
                  User Details
                </SheetTitle>
                <SheetDescription className="text-xs sm:text-sm">
                  Review and manage user information
                </SheetDescription>
              </SheetHeader>

              <div className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
                <div className="space-y-2">
                  <p className="font-semibold">Name:</p>
                  <p>{selectedUser.name}</p>

                  <p className="font-semibold mt-4">Email:</p>
                  <p>{selectedUser.email}</p>
                </div>

                <div className="space-y-2">
                  <p className="font-semibold">Status:</p>
                  <p className={isUserDisabled(selectedUser) ? 'text-red-600' : 'text-green-600'}>
                    {isUserDisabled(selectedUser) ? 'Inactive' : 'Active'}
                  </p>

                  <p className="font-semibold mt-4">Super User:</p>
                  <p>{selectedUser.is_superuser ? 'Yes' : 'No'}</p>
                </div>
              </div>

              <div className="space-y-2">
                <p className="font-semibold">Roles:</p>
                <div className="rounded-lg bg-gray-50 p-3 sm:p-4">
                  <p className="text-sm text-gray-600">
                    {selectedUser.roles.length > 0
                      ? selectedUser.roles.map(role => role.role).join(", ")
                      : 'No roles assigned'}
                  </p>
                </div>
              </div>

              {isAdminLike(selectedUser) && (
                <div className="space-y-2">
                  <p className="font-semibold">Dataset Reviewer Access:</p>
                  <div className="rounded-lg bg-gray-50 p-3 sm:p-4 space-y-3">
                    {userDataSetsLoading && (
                      <p className="text-sm text-gray-500">Loading datasets...</p>
                    )}
                    {!userDataSetsLoading && userDataSets.length === 0 && (
                      <p className="text-sm text-gray-500">No datasets attached yet.</p>
                    )}
                    {!userDataSetsLoading && userDataSets.length > 0 && (
                      <ul className="space-y-2">
                        {userDataSets.map((dataset) => (
                          <li
                            key={dataset.permission_id}
                            className="flex items-center justify-between gap-2 rounded-md border border-gray-200 bg-white px-3 py-2"
                          >
                            <div className="min-w-0">
                              <p className="truncate text-sm text-gray-700">{dataset.data_set_name}</p>
                              <p className="truncate text-xs text-gray-400">{dataset.title}</p>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 shrink-0 px-2 text-[11px] text-red-600 hover:bg-red-100"
                              disabled={isRemovingDataSet}
                              onClick={() =>
                                removeDataSetFn({ user_id: selectedUser.id, data_set_id: dataset.data_set_id })
                              }
                            >
                              <XCircle className="mr-1 h-3.5 w-3.5" />
                              Remove
                            </Button>
                          </li>
                        ))}
                      </ul>
                    )}

                    <div className="flex flex-col gap-2 sm:flex-row">
                      <select
                        value={datasetToGrant}
                        onChange={(e) => setDatasetToGrant(e.target.value)}
                        className="flex-1 rounded-md border border-gray-300 p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select a dataset to grant...</option>
                        {catalogueDatasets
                          .filter((dataset) => !userDataSets.some((granted) => granted.data_set_id === dataset.id))
                          .map((dataset) => (
                            <option key={dataset.id} value={dataset.id}>
                              {dataset.name}
                            </option>
                          ))}
                      </select>
                      <Button
                        variant="default"
                        className="bg-[#00B9F1] hover:bg-[#00A0D0]"
                        disabled={!datasetToGrant || isAssigningDataSet}
                        onClick={() =>
                          datasetToGrant &&
                          assignDataSetFn({ user_id: selectedUser.id, data_set_id: datasetToGrant })
                        }
                      >
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                        Grant
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
                <Button 
                  variant={isUserDisabled(selectedUser) ? "default" : "destructive"}
                  className="w-full"
                  onClick={() => {
                    if (isUserDisabled(selectedUser)) {
                      revokeAccessFn({ user_id: selectedUser.id, disabled: false });
                    } else {
                      revokeAccessFn({ user_id: selectedUser.id, disabled: true });
                    }
                  }}
                  disabled={isRevokingAccess}
                >
                  <XCircle className="mr-2 h-4 w-4" />
                  {isUserDisabled(selectedUser) ? "Enable User" : "Disable User"}
                </Button>
                {selectedUser.roles.some(role => role.role === "admin") ? (
                  <Button 
                    variant="default" 
                    className="w-full bg-red-600 hover:bg-red-700"
                    onClick={() => {
                      removeAdmin({ user_id: selectedUser.id, role: "admin" });
                    }}
                    disabled={isRemovingAdmin}
                  >
                    <XCircle className="mr-2 h-4 w-4" />
                    Remove Admin
                  </Button>
                ) : (
                  <Button 
                    variant="default" 
                    className="w-full bg-[#00B9F1] hover:bg-[#00A0D0]"
                    onClick={() => {
                      assignAdmin({ user_id: selectedUser.id, role: "admin" });
                    }}
                    disabled={isAssigningAdmin}
                  >
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Assign Admin
                  </Button>
                )}
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default AdminUsers;
