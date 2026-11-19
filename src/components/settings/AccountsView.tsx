import React, { FormEvent, useState } from "react";
import { Plus, Pencil, Trash2, Users, ShieldCheck, ChevronDown } from "lucide-react";
import { BranchName, UserRole } from "../../types";
import {
  AccountDirectory,
  appTabOptions,
  loadAccountDirectory,
  saveAccountDirectory,
} from "../../auth/accounts";

type Section = "accounts" | "roles";

interface DropdownOption { value: string; label: string }

const FormDropdown: React.FC<{
  value: string;
  options: DropdownOption[];
  disabled?: boolean;
  onChange: (value: string) => void;
}> = ({ value, options, disabled = false, onChange }) => {
  const [open, setOpen] = useState(false);
  const selected = options.find((option) => option.value === value);
  return (
    <div className="relative mt-1">
      <button type="button" disabled={disabled} aria-haspopup="listbox" aria-expanded={open} onClick={() => setOpen((current) => !current)} onKeyDown={(event) => { if (event.key === "Escape") setOpen(false); }} className="flex h-10 w-full items-center justify-between rounded-lg border border-slate-300 bg-white px-3 text-left text-sm text-slate-800 outline-none focus:border-[var(--logo-primary-strong)] focus:ring-2 focus:ring-cyan-100 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500">
        <span className="truncate">{selected?.label ?? "Select an option"}</span>
        <ChevronDown aria-hidden="true" className={`ml-2 h-4 w-4 shrink-0 text-slate-500 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && !disabled && <div role="listbox" className="absolute left-0 right-0 top-full z-30 mt-1 max-h-56 overflow-y-auto rounded-lg border border-slate-200 bg-white p-1 shadow-lg">{options.map((option) => <button key={option.value} type="button" role="option" aria-selected={option.value === value} onClick={() => { onChange(option.value); setOpen(false); }} className={`w-full rounded-md px-3 py-2 text-left text-sm ${option.value === value ? "bg-cyan-50 font-semibold text-slate-900" : "text-slate-700 hover:bg-slate-50"}`}>{option.label}</button>)}</div>}
    </div>
  );
};

export const AccountsView: React.FC = () => {
  const [directory, setDirectory] =
    useState<AccountDirectory>(loadAccountDirectory);
  const [section, setSection] = useState<Section>("accounts");
  const [accountEditId, setAccountEditId] = useState<string | null>(null);
  const [roleEditName, setRoleEditName] = useState<UserRole | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<UserRole>("Cashier");
  const [branch, setBranch] = useState<"All" | BranchName>(
    "Branch 1 - Main Hub",
  );
  const [roleName, setRoleName] = useState("");
  const [roleTabs, setRoleTabs] = useState<string[]>([]);
  const [error, setError] = useState("");

  const updateDirectory = (next: AccountDirectory) => {
    setDirectory(next);
    saveAccountDirectory(next);
  };

  const resetAccountForm = () => {
    setAccountEditId(null);
    setName("");
    setEmail("");
    setRole("Cashier");
    setBranch("Branch 1 - Main Hub");
    setError("");
  };
  const resetRoleForm = () => {
    setRoleEditName(null);
    setRoleName("");
    setRoleTabs([]);
    setError("");
  };

  const saveAccount = (event: FormEvent) => {
    event.preventDefault();
    const normalizedEmail = email.trim().toLowerCase();
    if (
      directory.accounts.some(
        (item) =>
          item.email.toLowerCase() === normalizedEmail &&
          item.id !== accountEditId,
      )
    ) {
      setError("An account already uses that email.");
      return;
    }
    if (!directory.roles.some((item) => item.name === role)) {
      setError("Select an available role.");
      return;
    }
    const account = {
      id: accountEditId ?? `acct-${Date.now()}`,
      name: name.trim(),
      email: normalizedEmail,
      role,
      branch:
        role === "Administrator"
          ? ("All" as const)
          : branch === "All"
            ? ("Branch 1 - Main Hub" as const)
            : branch,
    };
    updateDirectory({
      ...directory,
      accounts: accountEditId
        ? directory.accounts.map((item) =>
            item.id === accountEditId ? account : item,
          )
        : [...directory.accounts, account],
    });
    resetAccountForm();
  };

  const saveRole = (event: FormEvent) => {
    event.preventDefault();
    const normalizedName = roleName.trim();
    if (!normalizedName) {
      setError("Enter a role name.");
      return;
    }
    if (
      directory.roles.some(
        (item) =>
          item.name.toLowerCase() === normalizedName.toLowerCase() &&
          item.name !== roleEditName,
      )
    ) {
      setError("That role already exists.");
      return;
    }
    const nextName = normalizedName as UserRole;
    const roles = roleEditName
      ? directory.roles.map((item) =>
          item.name === roleEditName
            ? { name: nextName, tabs: roleTabs }
            : item,
        )
      : [...directory.roles, { name: nextName, tabs: roleTabs }];
    const accounts = roleEditName
      ? directory.accounts.map((item) =>
          item.role === roleEditName ? { ...item, role: nextName } : item,
        )
      : directory.accounts;
    updateDirectory({ roles, accounts });
    resetRoleForm();
  };

  const editAccount = (id: string) => {
    const item = directory.accounts.find((account) => account.id === id);
    if (!item) return;
    setAccountEditId(item.id);
    setName(item.name);
    setEmail(item.email);
    setRole(item.role);
    setBranch(item.branch);
    setError("");
  };
  const editRole = (roleToEdit: UserRole) => {
    if (roleToEdit === "Administrator") {
      setError("The Administrator role is reserved and cannot be edited.");
      return;
    }
    const item = directory.roles.find((entry) => entry.name === roleToEdit);
    if (!item) return;
    setRoleEditName(item.name);
    setRoleName(item.name);
    setRoleTabs(item.tabs);
    setError("");
  };
  const deleteRole = (roleToDelete: UserRole) => {
    if (roleToDelete === "Administrator") {
      setError("The Administrator role is reserved and cannot be deleted.");
      return;
    }
    if (directory.accounts.some((account) => account.role === roleToDelete)) {
      setError("Reassign staff accounts before deleting this role.");
      return;
    }
    if (!window.confirm(`Delete the ${roleToDelete} role?`)) return;
    updateDirectory({
      ...directory,
      roles: directory.roles.filter((item) => item.name !== roleToDelete),
    });
    setError("");
  };

  return (
    <section className="space-y-5">
      <div>
        <h1 className="font-display text-2xl font-bold text-slate-950">
          Staff &amp; Accounts
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Manage staff accounts and the tabs each role can access.
        </p>
      </div>
      <div className="flex gap-2 border-b border-slate-200">
        {(
          [
            ["accounts", "Staff accounts", Users],
            ["roles", "Roles & permissions", ShieldCheck],
          ] as const
        ).map(([id, label, Icon]) => (
          <button
            key={id}
            onClick={() => {
              setSection(id);
              setError("");
            }}
            className={`inline-flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-semibold ${section === id ? "border-cyan-700 text-slate-950" : "border-transparent text-slate-500"}`}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </div>
      {error && (
        <p
          role="alert"
          className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700"
        >
          {error}
        </p>
      )}
      {section === "accounts" ? (
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
          <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs text-slate-600">
                <tr>
                  <th className="px-4 py-3">Staff member</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Branch</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {directory.accounts.map((item) => (
                  <tr key={item.id} className="border-t border-slate-100">
                    <td className="px-4 py-3">
                      <div className="font-semibold text-slate-900">
                        {item.name}
                      </div>
                      <div className="text-xs text-slate-500">{item.email}</div>
                    </td>
                    <td className="px-4 py-3">{item.role}</td>
                    <td className="px-4 py-3">{item.branch}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          aria-label={`Edit ${item.name}`}
                          onClick={() => editAccount(item.id)}
                          className="rounded p-2 text-slate-600 hover:bg-slate-100"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          aria-label={`Delete ${item.name}`}
                          onClick={() => {
                            if (window.confirm(`Delete account ${item.email}?`))
                              updateDirectory({
                                ...directory,
                                accounts: directory.accounts.filter(
                                  (account) => account.id !== item.id,
                                ),
                              });
                          }}
                          className="rounded p-2 text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <form
            onSubmit={saveAccount}
            className="space-y-4 rounded-xl border border-slate-200 bg-white p-5"
          >
            <h2 className="font-display text-lg font-bold">
              {accountEditId ? "Edit account" : "Add staff account"}
            </h2>
            <label className="block text-sm font-medium">
              Staff name
              <input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 h-10 w-full rounded-lg border border-slate-300 px-3"
              />
            </label>
            <label className="block text-sm font-medium">
              Email
              <input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 h-10 w-full rounded-lg border border-slate-300 px-3"
              />
            </label>
            <label className="block text-sm font-medium">
              Role
              <FormDropdown
                value={role}
                onChange={(value) => setRole(value)}
                options={directory.roles.map((item) => ({ value: item.name, label: item.name }))}
              />
            </label>
            <label className="block text-sm font-medium">
              Branch
              <FormDropdown
                value={branch}
                disabled={role === "Administrator"}
                onChange={(value) => setBranch(value as BranchName)}
                options={[{ value: "Branch 1 - Main Hub", label: "Branch 1 - Main Hub" }, { value: "Branch 2 - Metro Station", label: "Branch 2 - Metro Station" }]}
              />
            </label>
            <div className="flex gap-2">
              <button className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-lg bg-[var(--logo-secondary)] px-4 text-sm font-bold text-white">
                <Plus className="h-4 w-4" />
                {accountEditId ? "Save changes" : "Add account"}
              </button>
              {accountEditId && (
                <button
                  type="button"
                  onClick={resetAccountForm}
                  className="rounded-lg border px-3 text-sm"
                >
                  Cancel
                </button>
              )}
            </div>
            <p className="text-xs leading-5 text-amber-800">
              Preview only: email selects the role; passwords are not verified
              by a server.
            </p>
          </form>
        </div>
      ) : (
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_380px]">
          <div className="space-y-3">
            {directory.roles.map((item) => (
              <article
                key={item.name}
                className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4"
              >
                <div>
                  <h2 className="font-semibold">{item.name}</h2>
                  <p className="mt-1 text-xs text-slate-500">
                    {item.tabs.includes("*")
                      ? "All tabs"
                      : `${item.tabs.length} permitted tabs`}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    aria-label={`Edit ${item.name} role`}
                    onClick={() => editRole(item.name)}
                    className="rounded p-2 text-slate-600 hover:bg-slate-100"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    aria-label={`Delete ${item.name} role`}
                    onClick={() => deleteRole(item.name)}
                    className="rounded p-2 text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </article>
            ))}
          </div>
          <form
            onSubmit={saveRole}
            className="space-y-3 rounded-xl border border-slate-200 bg-white p-5"
          >
            <h2 className="font-display text-lg font-bold">
              {roleEditName ? "Edit role" : "Add role"}
            </h2>
            <label className="block text-sm font-medium">
              Role name
              <input
                required
                value={roleName}
                onChange={(e) => setRoleName(e.target.value)}
                className="mt-1 h-10 w-full rounded-lg border border-slate-300 px-3"
              />
            </label>
            <fieldset className="max-h-72 space-y-2 overflow-y-auto">
              <legend className="mb-2 text-sm font-medium">
                Permitted tabs
              </legend>
              {appTabOptions.map(([id, label]) => (
                <label
                  key={id}
                  className="flex items-center gap-2 text-sm text-slate-700"
                >
                  <input
                    type="checkbox"
                    checked={roleTabs.includes(id)}
                    onChange={(e) =>
                      setRoleTabs((tabs) =>
                        e.target.checked
                          ? [...tabs, id]
                          : tabs.filter((tab) => tab !== id),
                      )
                    }
                  />
                  {label}
                </label>
              ))}
            </fieldset>
            <div className="flex gap-2">
              <button className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-lg bg-[var(--logo-secondary)] px-4 text-sm font-bold text-white">
                <Plus className="h-4 w-4" />
                {roleEditName ? "Save role" : "Add role"}
              </button>
              {roleEditName && (
                <button
                  type="button"
                  onClick={resetRoleForm}
                  className="rounded-lg border px-3 text-sm"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>
      )}
    </section>
  );
};
