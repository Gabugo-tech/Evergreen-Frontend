"use client";

import { useState } from "react";
import {
  User, Lock, Bell, Shield, CreditCard,
  Camera, Save, Eye, EyeOff, CheckCircle2,
  Smartphone, ChevronRight, LogOut, Trash2,
  Moon, Sun, Monitor,
} from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Avatar from "@/components/ui/Avatar";
import Badge from "@/components/ui/Badge";
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";
import { motion, AnimatePresence } from "framer-motion";

type SettingsTab =
  | "profile"
  | "security"
  | "notifications"
  | "privacy"
  | "payments"
  | "appearance";

const tabs: { id: SettingsTab; label: string; icon: React.ElementType }[] = [
  { id: "profile",       label: "Profile",        icon: User       },
  { id: "security",      label: "Security",       icon: Lock       },
  { id: "notifications", label: "Notifications",  icon: Bell       },
  { id: "privacy",       label: "Privacy",        icon: Shield     },
  { id: "payments",      label: "Payment Methods",icon: CreditCard },
  { id: "appearance",    label: "Appearance",     icon: Monitor    },
];

// ─── Toggle component ─────────────────────────────────────────────────────────
function Toggle({ checked, onChange, label }: { checked: boolean; onChange: () => void; label?: string }) {
  return (
    <label className="flex items-center gap-3 cursor-pointer select-none">
      <button
        role="switch"
        aria-checked={checked}
        onClick={onChange}
        className={cn(
          "relative h-6 w-11 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500/50",
          checked ? "bg-primary-600" : "bg-slate-300 dark:bg-dark-border"
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform duration-200",
            checked ? "translate-x-5" : "translate-x-0"
          )}
        />
      </button>
      {label && (
        <span className="text-sm text-slate-700 dark:text-slate-300">{label}</span>
      )}
    </label>
  );
}

// ─── Profile tab ─────────────────────────────────────────────────────────────
function ProfileTab() {
  const [saved, setSaved] = useState(false);
  const save = async () => {
    await new Promise((r) => setTimeout(r, 800));
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Avatar */}
      <Card>
        <CardHeader>
          <CardTitle>Profile Photo</CardTitle>
        </CardHeader>
        <div className="flex items-center gap-5">
          <div className="relative">
            <Avatar name="Gabriel O" size="xl" />
            <button
              className="absolute -bottom-1 -right-1 h-7 w-7 rounded-full bg-primary-600 text-white flex items-center justify-center shadow-md hover:bg-primary-700 transition-colors"
              aria-label="Change photo"
            >
              <Camera className="h-3.5 w-3.5" />
            </button>
          </div>
          <div>
            <p className="text-sm font-medium text-slate-900 dark:text-white">Gabriel O</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Personal account · Verified</p>
            <div className="flex items-center gap-2 mt-2">
              <Button variant="secondary" size="xs">Upload Photo</Button>
              <Button variant="ghost" size="xs" className="text-danger-light">Remove</Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Personal info */}
      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
          <Badge variant="green" dot>Verified</Badge>
        </CardHeader>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="First Name" defaultValue="Gabriel" placeholder="First name" />
          <Input label="Last Name"  defaultValue="O"       placeholder="Last name" />
          <Input label="Email Address" type="email" defaultValue="gabriel@evergreen.com" hint="Verified email" />
          <Input label="Phone Number" type="tel" defaultValue="+1 (555) 000-0000" />
          <Input label="Date of Birth" type="date" defaultValue="1995-06-15" />
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Country</label>
            <select className="input-base">
              <option>United States</option><option>United Kingdom</option>
              <option>Nigeria</option><option>Canada</option><option>Germany</option>
            </select>
          </div>
        </div>
        <div className="mt-4">
          <Input label="Address" placeholder="Street address" defaultValue="123 Main Street, San Francisco, CA 94102" />
        </div>
        <div className="mt-5 flex items-center gap-3">
          <Button
            onClick={save}
            leftIcon={saved ? <CheckCircle2 className="h-4 w-4" /> : <Save className="h-4 w-4" />}
            className={saved ? "bg-success-light hover:bg-success-dark" : ""}
          >
            {saved ? "Saved!" : "Save Changes"}
          </Button>
          <Button variant="secondary">Cancel</Button>
        </div>
      </Card>

      {/* KYC */}
      <Card>
        <CardHeader>
          <CardTitle>Identity Verification (KYC)</CardTitle>
          <Badge variant="green" dot>Verified</Badge>
        </CardHeader>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: "Identity Document", status: "Verified", icon: "🪪" },
            { label: "Proof of Address",  status: "Verified", icon: "🏠" },
            { label: "Selfie Check",      status: "Verified", icon: "🤳" },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-3 p-3.5 rounded-xl bg-success-bg dark:bg-green-900/20 border border-success-light/30">
              <span className="text-2xl">{item.icon}</span>
              <div>
                <p className="text-sm font-medium text-slate-900 dark:text-white">{item.label}</p>
                <Badge variant="green" dot>{item.status}</Badge>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

// ─── Security tab ─────────────────────────────────────────────────────────────
function SecurityTab() {
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [twoFA, setTwoFA]     = useState(true);
  const [biometric, setBiometric] = useState(false);

  const sessions = [
    { device: "Chrome · Windows 11", location: "Lagos, Nigeria",    lastSeen: "Now — Current",    current: true  },
    { device: "Safari · iPhone 15",  location: "San Francisco, USA", lastSeen: "2 hours ago",     current: false },
    { device: "Firefox · macOS",     location: "London, UK",         lastSeen: "3 days ago",      current: false },
  ];

  return (
    <div className="space-y-6">
      {/* Change password */}
      <Card>
        <CardHeader><CardTitle>Change Password</CardTitle></CardHeader>
        <div className="space-y-4 max-w-md">
          <Input
            label="Current Password" type={showOld ? "text" : "password"} placeholder="••••••••"
            rightElement={
              <button type="button" onClick={() => setShowOld(!showOld)} className="text-slate-400 hover:text-slate-600 transition-colors">
                {showOld ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            }
          />
          <Input
            label="New Password" type={showNew ? "text" : "password"} placeholder="Create a strong password"
            rightElement={
              <button type="button" onClick={() => setShowNew(!showNew)} className="text-slate-400 hover:text-slate-600 transition-colors">
                {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            }
          />
          <Input label="Confirm New Password" type="password" placeholder="Repeat new password" />
          <Button leftIcon={<Lock className="h-4 w-4" />}>Update Password</Button>
        </div>
      </Card>

      {/* 2FA */}
      <Card>
        <CardHeader><CardTitle>Two-Factor Authentication</CardTitle></CardHeader>
        <div className="space-y-4">
          {[
            { label: "Authenticator App", desc: "Use Google Authenticator or Authy", icon: Smartphone, state: twoFA, toggle: () => setTwoFA(!twoFA) },
            { label: "Biometric Login",   desc: "Use fingerprint or face recognition", icon: User,       state: biometric, toggle: () => setBiometric(!biometric) },
          ].map((item) => (
            <div key={item.label} className="flex items-center justify-between p-4 rounded-xl border border-light-border dark:border-dark-border">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                  <item.icon className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">{item.label}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{item.desc}</p>
                </div>
              </div>
              <Toggle checked={item.state} onChange={item.toggle} />
            </div>
          ))}
        </div>
      </Card>

      {/* Active sessions */}
      <Card>
        <CardHeader>
          <CardTitle>Active Sessions</CardTitle>
          <Button variant="danger" size="xs">End All Others</Button>
        </CardHeader>
        <div className="space-y-3">
          {sessions.map((s) => (
            <div key={s.device} className="flex items-center justify-between p-3.5 rounded-xl border border-light-border dark:border-dark-border">
              <div className="flex items-center gap-3">
                <div className={cn(
                  "h-2.5 w-2.5 rounded-full flex-shrink-0",
                  s.current ? "bg-success-light" : "bg-slate-300 dark:bg-slate-600"
                )} />
                <div>
                  <p className="text-sm font-medium text-slate-900 dark:text-white flex items-center gap-2">
                    {s.device}
                    {s.current && <Badge variant="green">Current</Badge>}
                  </p>
                  <p className="text-xs text-slate-400">{s.location} · {s.lastSeen}</p>
                </div>
              </div>
              {!s.current && (
                <Button variant="ghost" size="xs" className="text-danger-light hover:bg-danger-bg dark:hover:bg-red-900/20">
                  Revoke
                </Button>
              )}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

// ─── Notifications tab ────────────────────────────────────────────────────────
function NotificationsTab() {
  const prefs = [
    { category: "Transactions",  email: true,  push: true,  sms: true  },
    { category: "Payments",      email: true,  push: true,  sms: false },
    { category: "Investments",   email: true,  push: true,  sms: false },
    { category: "Security",      email: true,  push: true,  sms: true  },
    { category: "Promotions",    email: false, push: false, sms: false },
    { category: "System Updates",email: true,  push: false, sms: false },
  ];
  const [settings, setSettings] = useState(prefs);
  const toggle = (idx: number, channel: "email" | "push" | "sms") =>
    setSettings((prev) => prev.map((p, i) => i === idx ? { ...p, [channel]: !p[channel] } : p));

  return (
    <Card padding="none">
      <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[500px]">
          <thead>
            <tr className="border-b border-light-border dark:border-dark-border">
              <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wide">Category</th>
              {["Email", "Push", "SMS"].map((c) => (
                <th key={c} className="text-center px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wide">{c}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {settings.map((s, i) => (
              <tr key={s.category} className="border-b border-light-border/50 dark:border-dark-border/50 last:border-0 hover:bg-slate-50 dark:hover:bg-dark-muted/40 transition-colors">
                <td className="px-5 py-4 font-medium text-slate-800 dark:text-slate-200">{s.category}</td>
                <td className="px-5 py-4 text-center"><Toggle checked={s.email} onChange={() => toggle(i,"email")} /></td>
                <td className="px-5 py-4 text-center"><Toggle checked={s.push}  onChange={() => toggle(i,"push")}  /></td>
                <td className="px-5 py-4 text-center"><Toggle checked={s.sms}   onChange={() => toggle(i,"sms")}   /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="px-5 py-4 border-t border-light-border dark:border-dark-border">
        <Button><Save className="h-4 w-4 mr-2" />Save Preferences</Button>
      </div>
    </Card>
  );
}

// ─── Appearance tab ───────────────────────────────────────────────────────────
function AppearanceTab() {
  const { theme, setTheme } = useTheme();
  const options = [
    { value: "light",  label: "Light",  icon: Sun     },
    { value: "dark",   label: "Dark",   icon: Moon    },
    { value: "system", label: "System", icon: Monitor },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader><CardTitle>Theme</CardTitle></CardHeader>
        <div className="grid grid-cols-3 gap-3">
          {options.map(({ value, label, icon: Icon }) => (
            <button
              key={value}
              onClick={() => setTheme(value)}
              className={cn(
                "flex flex-col items-center gap-3 p-5 rounded-2xl border-2 transition-all",
                theme === value
                  ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20"
                  : "border-light-border dark:border-dark-border hover:border-primary-300 dark:hover:border-primary-700"
              )}
            >
              <div className={cn(
                "h-12 w-12 rounded-xl flex items-center justify-center",
                theme === value ? "bg-gradient-blue text-white" : "bg-slate-100 dark:bg-dark-muted text-slate-500"
              )}>
                <Icon className="h-6 w-6" />
              </div>
              <span className={cn(
                "text-sm font-semibold",
                theme === value ? "text-primary-700 dark:text-primary-300" : "text-slate-600 dark:text-slate-400"
              )}>
                {label}
              </span>
              {theme === value && <CheckCircle2 className="h-4 w-4 text-primary-500" />}
            </button>
          ))}
        </div>
      </Card>

      <Card>
        <CardHeader><CardTitle>Language & Region</CardTitle></CardHeader>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Language</label>
            <select className="input-base">
              <option>English (US)</option><option>English (UK)</option>
              <option>French</option><option>Spanish</option><option>German</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Timezone</label>
            <select className="input-base">
              <option>UTC-5 (Eastern Time)</option><option>UTC+0 (London)</option>
              <option>UTC+1 (Lagos)</option><option>UTC+8 (Singapore)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Currency Display</label>
            <select className="input-base">
              <option>USD — US Dollar</option><option>EUR — Euro</option>
              <option>GBP — British Pound</option><option>NGN — Naira</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Date Format</label>
            <select className="input-base">
              <option>MM/DD/YYYY</option><option>DD/MM/YYYY</option><option>YYYY-MM-DD</option>
            </select>
          </div>
        </div>
        <div className="mt-4"><Button leftIcon={<Save className="h-4 w-4" />}>Save</Button></div>
      </Card>
    </div>
  );
}

// ─── Payments tab ─────────────────────────────────────────────────────────────
function PaymentsTab() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Saved Payment Methods</CardTitle>
          <Button size="sm">+ Add Method</Button>
        </CardHeader>
        <div className="space-y-3">
          {[
            { type: "Visa",       last4: "4242", expiry: "12/27", primary: true,  color: "from-primary-700 to-primary-500" },
            { type: "Mastercard", last4: "8831", expiry: "08/26", primary: false, color: "from-slate-700 to-slate-600" },
          ].map((card) => (
            <div key={card.last4} className="flex items-center justify-between p-4 rounded-xl border border-light-border dark:border-dark-border">
              <div className="flex items-center gap-4">
                <div className={cn("h-10 w-14 rounded-lg bg-gradient-to-br flex items-center justify-center text-white text-xs font-bold", card.color)}>
                  {card.type}
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">
                    {card.type} ···· {card.last4}
                    {card.primary && <Badge variant="blue" className="ml-2">Primary</Badge>}
                  </p>
                  <p className="text-xs text-slate-400">Expires {card.expiry}</p>
                </div>
              </div>
              <Button variant="ghost" size="xs" className="text-danger-light">Remove</Button>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <CardHeader><CardTitle>Transaction Limits</CardTitle></CardHeader>
        <div className="space-y-3">
          {[
            { label: "Daily Transfer Limit",    used: 1450, limit: 10000 },
            { label: "Monthly Transfer Limit",  used: 8200, limit: 50000 },
            { label: "International Limit",     used: 1200, limit: 5000  },
          ].map((item) => (
            <div key={item.label}>
              <div className="flex justify-between text-sm mb-1.5">
                <span className="text-slate-600 dark:text-slate-400">{item.label}</span>
                <span className="font-medium text-slate-900 dark:text-white">
                  ${item.used.toLocaleString()} / ${item.limit.toLocaleString()}
                </span>
              </div>
              <div className="h-2 rounded-full bg-slate-100 dark:bg-dark-muted overflow-hidden">
                <div
                  className={cn("h-full rounded-full transition-all", (item.used/item.limit) > 0.8 ? "bg-danger-light" : "bg-gradient-blue")}
                  style={{ width: `${(item.used / item.limit) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

// ─── Privacy toggle row (own component so useState is at top level) ───────────
function PrivacyToggleRow({ label, desc, defaultOn }: { label: string; desc: string; defaultOn: boolean }) {
  const [on, setOn] = useState(defaultOn);
  return (
    <div className="flex items-center justify-between py-3 border-b border-light-border dark:border-dark-border last:border-0">
      <div>
        <p className="text-sm font-medium text-slate-900 dark:text-white">{label}</p>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{desc}</p>
      </div>
      <Toggle checked={on} onChange={() => setOn(!on)} />
    </div>
  );
}

// ─── Privacy tab ─────────────────────────────────────────────────────────────
function PrivacyTab() {
  const privacyItems = [
    { label: "Share analytics data",     desc: "Help us improve by sharing anonymous usage data", on: true  },
    { label: "Marketing communications", desc: "Receive personalised offers and updates",         on: false },
    { label: "Third-party data sharing", desc: "Allow partners to use your data for services",   on: false },
    { label: "Transaction insights",     desc: "Allow AI analysis of your spending habits",      on: true  },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader><CardTitle>Data & Privacy</CardTitle></CardHeader>
        <div className="space-y-4">
          {privacyItems.map((item) => (
            <PrivacyToggleRow
              key={item.label}
              label={item.label}
              desc={item.desc}
              defaultOn={item.on}
            />
          ))}
        </div>
      </Card>

      <Card>
        <CardHeader><CardTitle>Account Management</CardTitle></CardHeader>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-4 rounded-xl border border-light-border dark:border-dark-border">
            <div>
              <p className="text-sm font-semibold text-slate-900 dark:text-white">Download My Data</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Get a copy of all your Evergreen data</p>
            </div>
            <Button variant="secondary" size="sm" rightIcon={<ChevronRight className="h-4 w-4" />}>Request</Button>
          </div>
          <div className="flex items-center justify-between p-4 rounded-xl border border-danger-light/30 bg-danger-bg dark:bg-red-900/10">
            <div>
              <p className="text-sm font-semibold text-danger-light">Delete Account</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Permanently remove your account and all data</p>
            </div>
            <Button variant="danger" size="sm" leftIcon={<Trash2 className="h-4 w-4" />}>Delete</Button>
          </div>
        </div>
      </Card>
    </div>
  );
}

// ─── Main settings page ───────────────────────────────────────────────────────
export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>("profile");

  const tabContent: Record<SettingsTab, React.ReactNode> = {
    profile:       <ProfileTab />,
    security:      <SecurityTab />,
    notifications: <NotificationsTab />,
    privacy:       <PrivacyTab />,
    payments:      <PaymentsTab />,
    appearance:    <AppearanceTab />,
  };

  return (
    <div className="animate-slide-up">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Settings</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          Manage your account preferences and security
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar nav */}
        <nav className="lg:w-56 flex-shrink-0">
          <Card padding="sm">
            <div className="space-y-0.5">
              {tabs.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-left",
                    activeTab === id
                      ? "bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300"
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-dark-muted"
                  )}
                >
                  <Icon className={cn("h-4.5 w-4.5", activeTab === id ? "text-primary-600 dark:text-primary-400" : "text-slate-400")} />
                  {label}
                </button>
              ))}

              <div className="pt-2 mt-2 border-t border-light-border dark:border-dark-border">
                <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-danger-light transition-all">
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </button>
              </div>
            </div>
          </Card>
        </nav>

        {/* Tab content */}
        <div className="flex-1 min-w-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
            >
              {tabContent[activeTab]}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
