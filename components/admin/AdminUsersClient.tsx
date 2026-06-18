"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { UserProfile } from "@/lib/types";

interface Props {
  users: UserProfile[];
}

export default function AdminUsersClient({ users: initialUsers }: Props) {
  const [users, setUsers] = useState<UserProfile[]>(initialUsers);

  async function toggleActive(user: UserProfile) {
    const supabase = createClient();
    const { data } = await supabase
      .from("users")
      .update({ active: !user.active })
      .eq("id", user.id)
      .select()
      .single();
    if (data) {
      setUsers((prev) => prev.map((u) => (u.id === user.id ? (data as UserProfile) : u)));
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Team Management</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Add new users via the Supabase dashboard. Use this page to manage active status.
        </p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Name</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Email</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Role</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Status</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {users.map((user) => (
              <tr key={user.id}>
                <td className="px-4 py-3 font-medium text-gray-900">{user.name}</td>
                <td className="px-4 py-3 text-gray-600">{user.email}</td>
                <td className="px-4 py-3">
                  <span
                    className={`text-xs px-2 py-0.5 rounded font-medium ${
                      user.role === "admin"
                        ? "bg-indigo-100 text-indigo-700"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {user.role}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`text-xs px-2 py-0.5 rounded font-medium ${
                      user.active
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-400"
                    }`}
                  >
                    {user.active ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => toggleActive(user)}
                    className="text-xs text-indigo-600 hover:underline"
                  >
                    {user.active ? "Deactivate" : "Reactivate"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-gray-400">
        To add a new team member, create their account in the{" "}
        <strong>Supabase Authentication dashboard</strong>, then insert a row in the{" "}
        <code className="bg-gray-100 px-1 rounded">users</code> table with their name, email, and role.
      </p>
    </div>
  );
}
