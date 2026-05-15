"use client";

import { useState } from "react";
import { ProfileShell } from "@/components/site/ProfileShell";
import { useStore } from "@/lib/store";
import { toast } from "sonner";

export default function SettingsPage() {
  const { user } = useStore();
  if (!user) return null;

  const [firstName, lastName] = (() => {
    const parts = user.name.trim().split(/\s+/);
    return [parts[0] ?? "", parts.slice(1).join(" ")];
  })();

  return (
    <ProfileShell>
      <SettingsInner firstName={firstName} lastName={lastName} email={user.email ?? ""} />
    </ProfileShell>
  );
}

function SettingsInner({ firstName: initFirst, lastName: initLast, email: initEmail }: {
  firstName: string; lastName: string; email: string;
}) {
  const [first, setFirst] = useState(initFirst);
  const [last, setLast] = useState(initLast);
  const [email, setEmail] = useState(initEmail);
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");

  const saveAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!first.trim() || !email.trim()) { toast.error("First name and email are required"); return; }
    toast.success("Account details saved");
  };

  const changePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPw || !newPw || !confirmPw) { toast.error("Please fill all password fields"); return; }
    if (newPw.length < 6) { toast.error("New password must be at least 6 characters"); return; }
    if (newPw !== confirmPw) { toast.error("New passwords do not match"); return; }
    setCurrentPw(""); setNewPw(""); setConfirmPw("");
    toast.success("Password updated");
  };

  return (
    <div className="animate-fade-up space-y-4 lg:space-y-5">
      <form onSubmit={saveAccount} className="bg-white rounded-2xl border shadow-[0_1px_3px_oklch(0_0_0/0.04)] p-5 sm:p-6 lg:p-7">
        <h3 className="text-[15px] sm:text-base lg:text-lg font-bold tracking-tight">Account Settings</h3>
        <div className="mt-5 lg:mt-6 grid sm:grid-cols-2 gap-4 lg:gap-5">
          <Field id="first-name" label="First Name" value={first} onChange={setFirst} placeholder="John" />
          <Field id="last-name" label="Last Name" value={last} onChange={setLast} placeholder="Doe" />
        </div>
        <div className="mt-4 lg:mt-5">
          <Field id="email" label="Email Address" type="email" value={email} onChange={setEmail} placeholder="john.doe@example.com" />
        </div>
        <button type="submit" className="mt-6 inline-flex items-center justify-center h-10 lg:h-11 px-5 lg:px-6 rounded-full bg-black text-white text-xs lg:text-sm font-semibold hover:bg-accent active:scale-[0.98] transition-all duration-200 ease-out">
          Save Changes
        </button>
      </form>

      <form onSubmit={changePassword} className="bg-white rounded-2xl border shadow-[0_1px_3px_oklch(0_0_0/0.04)] p-5 sm:p-6 lg:p-7">
        <h3 className="text-[15px] sm:text-base lg:text-lg font-bold tracking-tight">Change Password</h3>
        <div className="mt-5 lg:mt-6">
          <Field id="current-pw" label="Current Password" type="password" value={currentPw} onChange={setCurrentPw} placeholder="••••••••" />
        </div>
        <div className="mt-4 lg:mt-5 grid sm:grid-cols-2 gap-4 lg:gap-5">
          <Field id="new-pw" label="New Password" type="password" value={newPw} onChange={setNewPw} placeholder="••••••••" />
          <Field id="confirm-pw" label="Confirm Password" type="password" value={confirmPw} onChange={setConfirmPw} placeholder="••••••••" />
        </div>
        <button type="submit" className="mt-6 inline-flex items-center justify-center h-10 lg:h-11 px-5 lg:px-6 rounded-full bg-black text-white text-xs lg:text-sm font-semibold hover:bg-accent active:scale-[0.98] transition-all duration-200 ease-out">
          Change Password
        </button>
      </form>
    </div>
  );
}

function Field({ id, label, value, onChange, placeholder, type = "text" }: {
  id: string; label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string;
}) {
  return (
    <div>
      <label htmlFor={id} className="block text-[12px] lg:text-[13px] font-semibold text-foreground mb-2">{label}</label>
      <input id={id} type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} autoComplete="off"
        className="w-full h-10 lg:h-11 px-3.5 lg:px-4 rounded-xl border border-gray-200 bg-white text-sm placeholder:text-muted-foreground/70 outline-none transition-all duration-200 hover:border-gray-300 focus:border-black focus:ring-4 focus:ring-black/5" />
    </div>
  );
}
