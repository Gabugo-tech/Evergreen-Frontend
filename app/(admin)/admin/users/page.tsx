"use client";

import { useEffect, useState } from "react";
import { Search, RefreshCw, Shield, Trash2, AlertTriangle } from "lucide-react";
import { Card } from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Skeleton from "@/components/ui/Skeleton";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import { formatDate } from "@/lib/utils";
import toast from "react-hot-toast";

const NODE = process.env.NEXT_PUBLIC_NODE_API_URL ?? "http://localhost:4000";
const ADMIN_TOKEN_KEY = "eg_admin_token";

interface AdminUser {
  id: string; full_name: string; email: string; phone: string;
  account_type: string; kyc_status: string; is_active: boolean;
  created_at: string; country: string;
}

function getAdminToken() {
  if (typeof window === "undefined") return "";
  return sessionStorage.getItem(ADMIN_TOKEN_KEY) ?? localStorage.getItem("eg_token") ?? "";
}

async function fetchUsers(): Promise<AdminUser[]> {
  const res = await fetch(`${NODE}/api/admin/users`, {
    headers: { Authorization: `Bearer ${getAdminToken()}` },
  });
  const json = await res.json();
  return (json.data ?? []) as AdminUser[];
}

async function deleteUser(id: string): Promise<void> {
  const res = await fetch(`${NODE}/api/admin/users/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${getAdminToken()}` },
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.message ?? `Delete failed (${res.status})`);
}

export default function AdminUsersPage() {
  const [users,         setUsers]         = useState<AdminUser[]>([]);
  const [search,        setSearch]        = useState("");
  const [loading,       setLoading]       = useState(true);
  const [confirmUser,   setConfirmUser]   = useState<AdminUser | null>(null);
  const [deleting,      setDeleting]      = useState(false);

  const load = async () => {
    setLoading(true);
    try { setUsers(await fetchUsers()); }
    catch { setUsers([]); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const filtered = users.filter(u =>
    u.full_name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async () => {
    if (!confirmUser || deleting) return;
    setDeleting(true);
    try {
      await deleteUser(confirmUser.id);
      toast.success(`${confirmUser.full_name} deleted successfully`);
      setUsers(prev => prev.filter(u => u.id !== confirmUser.id));
      setConfirmUser(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete user");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-2xl font-bold text-white">Users ({users.length})</h2>
        <button onClick={load} className="flex items-center gap-2 text-sm text-slate-400 hover:text-white">
          <RefreshCw className="h-4 w-4" /> Refresh
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <input
          type="search"
          placeholder="Search users…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input-base pl-9 py-2 bg-dark-card border-dark-border text-white"
        />
      </div>

      <Card padding="none">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[780px]">
            <thead>
              <tr className="border-b border-dark-border bg-dark-muted/50">
                {["Name","Email","Phone","Type","KYC","Country","Joined","Status",""].map((h, i) => (
                  <th key={i} className="text-left text-xs font-semibold text-slate-500 px-5 py-3 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading
                ? [1,2,3,4,5].map(i => (
                  <tr key={i}><td colSpan={9} className="px-5 py-3"><Skeleton height="36px" /></td></tr>
                ))
                : filtered.length === 0
                  ? (
                    <tr><td colSpan={9} className="text-center py-12 text-slate-500">
                      <Shield className="h-10 w-10 mx-auto mb-3 opacity-30" />
                      {search ? "No matching users" : "No users registered yet"}
                    </td></tr>
                  )
                  : filtered.map(u => (
                    <tr key={u.id} className="border-b border-dark-border/50 last:border-0 hover:bg-dark-muted/40 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-gradient-blue flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                            {u.full_name.split(" ").map(n=>n[0]).join("").slice(0,2)}
                          </div>
                          <span className="font-medium text-white">{u.full_name}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-slate-300">{u.email}</td>
                      <td className="px-5 py-3.5 text-slate-400">{u.phone ?? "—"}</td>
                      <td className="px-5 py-3.5"><Badge variant="neutral">{u.account_type}</Badge></td>
                      <td className="px-5 py-3.5">
                        <Badge variant={u.kyc_status==="verified"?"green":u.kyc_status==="rejected"?"red":"yellow"} dot>
                          {u.kyc_status}
                        </Badge>
                      </td>
                      <td className="px-5 py-3.5 text-slate-400">{u.country ?? "—"}</td>
                      <td className="px-5 py-3.5 text-slate-400 text-xs">{formatDate(u.created_at)}</td>
                      <td className="px-5 py-3.5">
                        <Badge variant={u.is_active ? "green" : "red"} dot>
                          {u.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </td>
                      <td className="px-5 py-3.5">
                        <button
                          onClick={() => setConfirmUser(u)}
                          title="Delete user"
                          className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-400/10 transition-all"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Confirm delete modal */}
      <Modal
        open={!!confirmUser}
        onClose={() => !deleting && setConfirmUser(null)}
        title="Delete User"
        description="This action is permanent and cannot be undone."
        footer={
          <div className="flex gap-3">
            <Button variant="secondary" fullWidth onClick={() => setConfirmUser(null)} disabled={deleting}>
              Cancel
            </Button>
            <Button
              fullWidth
              loading={deleting}
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700 focus-visible:ring-red-500"
              leftIcon={!deleting ? <Trash2 className="h-4 w-4" /> : undefined}
            >
              Delete User
            </Button>
          </div>
        }
      >
        {confirmUser && (
          <div className="py-2 space-y-4">
            <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
              <AlertTriangle className="h-5 w-5 text-red-400 flex-shrink-0" />
              <p className="text-sm text-red-300">
                All data for this user will be permanently deleted — account, transactions, and login access.
              </p>
            </div>
            <div className="space-y-2">
              {[
                ["Name",  confirmUser.full_name],
                ["Email", confirmUser.email],
                ["Type",  confirmUser.account_type],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between py-1.5 border-b border-dark-border last:border-0">
                  <span className="text-sm text-slate-400">{label}</span>
                  <span className="text-sm font-medium text-white">{value}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
