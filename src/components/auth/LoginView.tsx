import React, { FormEvent, useState } from "react";
import {
  ArrowRight,
  ChevronDown,
  Eye,
  EyeOff,
  LockKeyhole,
  MapPin,
} from "lucide-react";
import Logo from "../../assets/img/ButuanEvLogo.png";
import { BranchName, UserRole } from "../../types";

interface LoginViewProps {
  onSignIn: (role: UserRole, branch: "All" | BranchName) => void;
}

const roleDescriptions: Record<UserRole, string> = {
  Administrator: "Manage the full system and all branches.",
  Cashier: "Handle rentals, drivers, and payment records.",
  "Battery Releasing Officer": "Release and return batteries and EV units.",
  "Branch Personnel": "Manage day-to-day activity at your branch.",
};

export const LoginView: React.FC<LoginViewProps> = ({ onSignIn }) => {
  const [role, setRole] = useState<UserRole>("Cashier");
  const [branch, setBranch] = useState<BranchName>("Branch 1 - Main Hub");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!email.trim() || !password) {
      setError("Enter an email and password to continue to the preview.");
      return;
    }
    setError("");
    onSignIn(role, role === "Administrator" ? "All" : branch);
  };

  return (
    <main className="min-h-screen bg-slate-100 text-slate-900 justify-center sm:flex sm:items-center">
      {/* <section className="relative flex min-h-[220px] flex-col justify-between overflow-hidden bg-[var(--logo-secondary)] px-6 py-7 text-white sm:px-10 md:min-h-screen md:px-12 md:py-10">
        <div
          className="absolute -right-28 -top-28 h-80 w-80 rounded-full border border-white/10"
          aria-hidden="true"
        />
        <div
          className="absolute -right-14 -top-14 h-52 w-52 rounded-full border border-white/10"
          aria-hidden="true"
        />
        <div className="relative flex items-center gap-3">
          <img
            src={Logo}
            alt="ButuanEV"
            className="h-15 w-15 rounded-lg bg-white  object-contain"
          />
          <div>
            <p className="font-display text-lg font-extrabold tracking-tight">
              ButuanEV
            </p>
            <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-300">
              Battery Rental System
            </p>
          </div>
        </div>

        <div className="relative hidden max-w-md py-20 md:block">
          <h1 className="font-display text-4xl font-bold leading-tight tracking-tight">
            One workspace for every branch.
          </h1>
          <p className="mt-4 max-w-sm text-sm leading-6 text-slate-300">
            Manage rentals, battery swaps, EV units, and daily branch operations
            from one place.
          </p>
          <div className="mt-9 flex items-center gap-3 border-t border-white/15 pt-5 text-sm text-slate-200">
            <MapPin className="h-4 w-4 text-cyan-300" />
            <span>Butuan City operations</span>
          </div>
        </div>

        <p className="relative hidden text-xs text-slate-400 md:block">
          Role-based workspace preview
        </p>
        <div className="relative mt-7 flex items-center gap-3 md:hidden">
          <span className="h-1 w-8 rounded-full bg-[var(--logo-primary)]" />
          <p className="text-sm text-slate-200">
            Rental and battery operations
          </p>
        </div>
      </section> */}

      <section className="flex items-center justify-center px-5 py-9 sm:px-8 md:px-12 mx-auto">
        <div className="w-full max-w-[440px]">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_18px_45px_-28px_rgba(15,23,42,0.35)] sm:p-9">
            <div className="mb-7">
              <h2 className="font-display text-2xl font-bold tracking-tight text-slate-950">
                Sign in to your workspace
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Use your assigned account to open the tools for your role.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label
                  htmlFor="login-email"
                  className="mb-1.5 block text-sm font-semibold text-slate-700"
                >
                  Work email
                </label>
                <input
                  id="login-email"
                  type="email"
                  autoComplete="username"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="name@butuanev.ph"
                  className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3.5 text-sm text-slate-900 outline-none transition focus:border-[var(--logo-primary)] focus:ring-4 focus:ring-cyan-100"
                />
              </div>

              <div>
                <label
                  htmlFor="login-password"
                  className="mb-1.5 block text-sm font-semibold text-slate-700"
                >
                  Password
                </label>
                <div className="relative">
                  <LockKeyhole
                    className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                    aria-hidden="true"
                  />
                  <input
                    id="login-password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Enter your password"
                    className="h-11 w-full rounded-lg border border-slate-300 bg-white pl-10 pr-12 text-sm text-slate-900 outline-none transition focus:border-[var(--logo-primary)] focus:ring-4 focus:ring-cyan-100"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((visible) => !visible)}
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="login-role"
                    className="mb-1.5 block text-sm font-semibold text-slate-700"
                  >
                    Preview role
                  </label>
                  <div className="relative">
                    <select
                      id="login-role"
                      value={role}
                      onChange={(event) =>
                        setRole(event.target.value as UserRole)
                      }
                      className="h-11 w-full appearance-none rounded-lg border border-slate-300 bg-white pl-3 pr-9 text-sm text-slate-800 outline-none transition focus:border-[var(--logo-primary)] focus:ring-4 focus:ring-cyan-100"
                    >
                      <option value="Cashier">Cashier</option>
                      <option value="Battery Releasing Officer">
                        Releasing Officer
                      </option>
                      <option value="Branch Personnel">Branch Personnel</option>
                      <option value="Administrator">Administrator</option>
                    </select>
                    <ChevronDown
                      className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500"
                      aria-hidden="true"
                    />
                  </div>
                </div>
                <div>
                  <label
                    htmlFor="login-branch"
                    className="mb-1.5 block text-sm font-semibold text-slate-700"
                  >
                    Branch
                  </label>
                  <div className="relative">
                    <select
                      id="login-branch"
                      value={branch}
                      onChange={(event) =>
                        setBranch(event.target.value as BranchName)
                      }
                      disabled={role === "Administrator"}
                      className="h-11 w-full appearance-none rounded-lg border border-slate-300 bg-white pl-3 pr-9 text-sm text-slate-800 outline-none transition focus:border-[var(--logo-primary)] focus:ring-4 focus:ring-cyan-100 disabled:bg-slate-100 disabled:text-slate-500"
                    >
                      <option value="Branch 1 - Main Hub">
                        Branch 1 · Main Hub
                      </option>
                      <option value="Branch 2 - Metro Station">
                        Branch 2 · Metro Station
                      </option>
                    </select>
                    <ChevronDown
                      className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500"
                      aria-hidden="true"
                    />
                  </div>
                </div>
              </div>

              <p
                className="-mt-2 text-xs leading-5 text-slate-500"
                aria-live="polite"
              >
                {roleDescriptions[role]}
              </p>

              {error && (
                <p
                  role="alert"
                  className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700"
                >
                  {error}
                </p>
              )}

              <button
                type="submit"
                className="group inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-[var(--logo-secondary)] px-4 text-sm font-bold text-white shadow-sm transition hover:bg-slate-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-600"
              >
                Continue to workspace
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </button>
            </form>
          </div>

          <p className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-3.5 py-3 text-xs leading-5 text-amber-900">
            UI preview only: credentials are not verified and role access is not
            secured by a server yet.
          </p>
          <p className="mt-5 text-center text-xs text-slate-500">
            © {new Date().getFullYear()} ButuanEV Battery Rental System
          </p>
    </main>
        </div>
      </section>
  );
};
