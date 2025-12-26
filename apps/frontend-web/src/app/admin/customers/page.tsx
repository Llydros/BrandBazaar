"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { User } from "@shared/auth";

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const month = months[date.getMonth()];
  const day = date.getDate().toString().padStart(2, "0");
  const year = date.getFullYear();
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  return `${month} ${day}, ${year} ${hours}:${minutes}`;
};

export default function CustomersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const data = await api.admin.users.getAll({ limit: 50 });
      setUsers(data.users);
    } catch (error) {
      console.error("Failed to load users", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight uppercase">Customers</h1>
          <p className="text-muted-foreground">
            Manage registered users and their roles.
          </p>
        </div>
      </div>

      {isLoading ? (
        <div>Loading customers...</div>
      ) : (
        <div className="border-2 border-black">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 [&_tr]:border-b">
              <tr className="border-b border-black transition-colors hover:bg-muted/50">
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground uppercase">
                  Email
                </th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground uppercase">
                  Joined Date
                </th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground uppercase">
                  Roles
                </th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground uppercase">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="[&_tr:last-child]:border-0">
              {users.map((user) => (
                <tr
                  key={user.id}
                  className="border-b border-black transition-colors hover:bg-muted/50"
                >
                  <td className="p-4 align-middle font-mono text-xs">
                    {user.email}
                  </td>
                  <td className="p-4 align-middle">
                    {formatDate(user.createdAt)}
                  </td>
                  <td className="p-4 align-middle">
                    {user.roles.join(", ")}
                  </td>
                  <td className="p-4 align-middle capitalize">
                    {user.status}
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                  <tr>
                      <td colSpan={4} className="p-8 text-center text-muted-foreground">
                          No customers found.
                      </td>
                  </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

