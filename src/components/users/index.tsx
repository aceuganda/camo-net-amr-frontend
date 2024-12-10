"use client";
import { useState, useEffect } from "react";
import { useAdminUsersWith } from "@/lib/hooks/useRoles";
import { useMutation } from "@tanstack/react-query";
import { assignRole, removeRole, revokeAccess } from "@/lib/hooks/useRoles";
import { toast } from "sonner";
import { useSearch } from "@/context/searchContext";
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
import { CheckCircle2, XCircle } from "lucide-react";

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
  hashed_password: string;
  is_superuser: boolean;
  roles: Role[];
}

const AdminUsers = () => {
  const { searchTerm } = useSearch();
  const { data, isLoading, error } = useAdminUsersWith();
  const users: User[] = data?.data || [];
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const itemsPerPage = 8;

  const {
    mutate: assignAdmin,
    isPending: isAssigningAdmin,
  } = useMutation({ 
    mutationFn: assignRole,
    onSuccess: () => {
      toast.success("Role updated successfully");
      window.location.reload();
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
    onSuccess: () => {
      toast.success("Role updated successfully");
      window.location.reload();
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
    onSuccess: () => {
      toast.success("Access revoked successfully");
      window.location.reload();
    },
    onError: () => {
      toast.error("Failed to revoke access");
    }
  });

  const filteredUsers = users.filter((user) =>
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const paginatedData = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleViewDetails = (user: User) => {
    setSelectedUser(user);
    setSheetOpen(true);
  };

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("en-US");

  return (
    <div className="p-6 min-h-screen flex flex-col bg-white">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-[#00B9F1]">User Management</h1>
      </div>

      {isLoading && (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-[#00B9F1]"></div>
        </div>
      )}

      {error && (
        <div className="text-red-600 text-center bg-red-50 p-4 rounded-lg">
          Failed to load users. Make sure you're a super admin.
        </div>
      )}

      {filteredUsers.length === 0 && searchTerm && (
        <div className="text-center text-gray-500 bg-gray-50 p-4 rounded-lg">
          No users found for search term: <strong>{searchTerm}</strong>
        </div>
      )}

      <div className="flex-1 overflow-auto">
        {filteredUsers.length > 0 && !isLoading && !error && (
          <div className="bg-white shadow-lg rounded-lg overflow-hidden">
            <Table>
              <TableHeader className="bg-[#00B9F1] text-white">
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Roles</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedData.map((user) => {
                  const isAdmin = user.roles.some(role => role.role === "admin");
                  return (
                    <TableRow
                      key={user.id}
                      className="hover:bg-[#F1F8FC] transition-colors cursor-pointer"
                      onClick={() => handleViewDetails(user)}
                    >
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.roles.map(role => role.role).join(", ")}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          user.is_active 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {user.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          {isAdmin ? (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-600 hover:bg-red-100"
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
                              className="text-green-600 hover:bg-green-100"
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

            <Pagination className="p-4 bg-gray-50">
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
        <SheetContent side="right" className="w-[500px] overflow-y-auto">
          {selectedUser && (
            <div className="p-6 space-y-6">
              <SheetHeader>
                <SheetTitle className="text-2xl text-[#00B9F1]">
                  User Details
                </SheetTitle>
                <SheetDescription>
                  Review and manage user information
                </SheetDescription>
              </SheetHeader>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="space-y-2">
                  <p className="font-semibold">Name:</p>
                  <p>{selectedUser.name}</p>

                  <p className="font-semibold mt-4">Email:</p>
                  <p>{selectedUser.email}</p>
                </div>

                <div className="space-y-2">
                  <p className="font-semibold">Status:</p>
                  <p className={selectedUser.is_active ? 'text-green-600' : 'text-red-600'}>
                    {selectedUser.is_active ? 'Active' : 'Inactive'}
                  </p>

                  <p className="font-semibold mt-4">Super User:</p>
                  <p>{selectedUser.is_superuser ? 'Yes' : 'No'}</p>
                </div>
              </div>

              <div className="space-y-2">
                <p className="font-semibold">Roles:</p>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">
                    {selectedUser.roles.length > 0 
                      ? selectedUser.roles.map(role => role.role).join(", ")
                      : 'No roles assigned'}
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <Button 
                  variant={selectedUser.disabled? "default" : "destructive"}
                  className="w-full"
                  onClick={() => {
                    if(selectedUser.disabled){
                      revokeAccessFn({ user_id: selectedUser.id, disabled: false });
                    }else{
                      revokeAccessFn({ user_id: selectedUser.id, disabled: true });
                    }
                    
                    setSheetOpen(false);
                  }}
                  disabled={isRevokingAccess}
                >
                  <XCircle className="mr-2 h-4 w-4" />
                 { selectedUser.disabled ? "Enable User": "Disable user" }
                </Button>
                {selectedUser.roles.some(role => role.role === "admin") ? (
                  <Button 
                    variant="default" 
                    className="w-full bg-red-600 hover:bg-red-700"
                    onClick={() => {
                      removeAdmin({ user_id: selectedUser.id, role: "admin" });
                      setSheetOpen(false);
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
                      setSheetOpen(false);
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