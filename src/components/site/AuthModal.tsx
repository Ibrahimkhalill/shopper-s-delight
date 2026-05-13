import { useState } from "react";
import { Eye, EyeOff, X } from "lucide-react";
import { useStore } from "@/lib/store";
import { toast } from "sonner";

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-5" aria-hidden="true">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  );
}

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
  defaultTab?: "login" | "signup";
}

export function AuthModal({ open, onClose, defaultTab = "login" }: AuthModalProps) {
  const { login } = useStore();
  const [tab, setTab] = useState<"login" | "signup">(defaultTab);

  // Login state
  const [identifier, setIdentifier] = useState("");
  const [pw, setPw] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [remember, setRemember] = useState(false);

  // Signup state
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [spw, setSpw] = useState("");
  const [showSpw, setShowSpw] = useState(false);

  if (!open) return null;

  const resetForms = () => {
    setIdentifier(""); setPw(""); setShowPw(false); setRemember(false);
    setName(""); setPhone(""); setSpw(""); setShowSpw(false);
  };

  const close = () => { resetForms(); onClose(); };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier || !pw) { toast.error("Enter your phone/email and password"); return; }
    login({
      name: identifier.includes("@") ? identifier.split("@")[0] : "Customer",
      phone: identifier,
      email: identifier.includes("@") ? identifier : undefined,
    });
    toast.success("Welcome back!");
    close();
  };

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone || !spw) { toast.error("Please fill all fields"); return; }
    login({ name, phone });
    toast.success("Account created!", { description: `Welcome, ${name}!` });
    close();
  };

  const handleGoogle = () => {
    const mockName = "Google User";
    const mockEmail = "user@gmail.com";
    login({ name: mockName, phone: "", email: mockEmail });
    toast.success("Signed in with Google!");
    close();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={close} />

      {/* Modal */}
      <div className="relative w-full max-w-sm bg-background rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">

        {/* Close button */}
        <button
          onClick={close}
          className="absolute right-4 top-4 z-10 size-8 rounded-full bg-secondary flex items-center justify-center hover:bg-secondary/80 transition"
          aria-label="Close"
        >
          <X className="size-4" />
        </button>

        <div className="px-7 pt-8 pb-7">
          {/* Title */}
          <div className="text-center mb-6">
            <h2 className="text-2xl font-semibold tracking-tight">
              {tab === "login" ? "Sign In" : "Create Account"}
            </h2>
            <p className="text-sm text-muted-foreground mt-1.5">
              {tab === "login"
                ? "Sign in to access your personalized experience."
                : "Shop faster, track orders, save favourites."}
            </p>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 p-1 rounded-full bg-secondary mb-6">
            <button
              onClick={() => setTab("login")}
              className={`flex-1 h-9 rounded-full text-sm font-semibold transition ${tab === "login" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
            >
              Sign In
            </button>
            <button
              onClick={() => setTab("signup")}
              className={`flex-1 h-9 rounded-full text-sm font-semibold transition ${tab === "signup" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
            >
              Register
            </button>
          </div>

          {/* Google button */}
          <button
            onClick={handleGoogle}
            className="w-full h-12 rounded-full border bg-background hover:bg-secondary flex items-center justify-center gap-3 text-sm font-medium transition mb-4"
          >
            <GoogleIcon />
            Continue with Google
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-muted-foreground">or</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          {/* Login form */}
          {tab === "login" && (
            <form onSubmit={handleLogin} className="space-y-3">
              <div>
                <label className="text-sm font-medium mb-1.5 block">
                  Username or email address <span className="text-red-500">*</span>
                </label>
                <input
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="Username or email address*"
                  className="w-full h-12 px-4 rounded-2xl border bg-background text-sm outline-none focus:border-foreground transition"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">
                  Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    value={pw}
                    onChange={(e) => setPw(e.target.value)}
                    type={showPw ? "text" : "password"}
                    placeholder="Password"
                    className="w-full h-12 px-4 pr-12 rounded-2xl border bg-background text-sm outline-none focus:border-foreground transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(!showPw)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground"
                  >
                    {showPw ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                    className="size-4 rounded border"
                  />
                  Remember me
                </label>
                <button type="button" className="text-sm underline underline-offset-2 font-medium hover:text-accent transition">
                  Forgot Your Password?
                </button>
              </div>

              <button className="w-full h-12 rounded-full bg-foreground text-background text-sm font-semibold hover:opacity-90 transition mt-1">
                Login
              </button>
            </form>
          )}

          {/* Signup form */}
          {tab === "signup" && (
            <form onSubmit={handleSignup} className="space-y-3">
              <div>
                <label className="text-sm font-medium mb-1.5 block">
                  Full name <span className="text-red-500">*</span>
                </label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Full name"
                  className="w-full h-12 px-4 rounded-2xl border bg-background text-sm outline-none focus:border-foreground transition"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">
                  Phone number <span className="text-red-500">*</span>
                </label>
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Phone number"
                  className="w-full h-12 px-4 rounded-2xl border bg-background text-sm outline-none focus:border-foreground transition"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">
                  Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    value={spw}
                    onChange={(e) => setSpw(e.target.value)}
                    type={showSpw ? "text" : "password"}
                    placeholder="Password"
                    className="w-full h-12 px-4 pr-12 rounded-2xl border bg-background text-sm outline-none focus:border-foreground transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowSpw(!showSpw)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground"
                  >
                    {showSpw ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </div>

              <button className="w-full h-12 rounded-full bg-foreground text-background text-sm font-semibold hover:opacity-90 transition mt-1">
                Create Account
              </button>
            </form>
          )}

          {/* Footer switch */}
          <p className="mt-5 text-sm text-muted-foreground text-center">
            {tab === "login" ? (
              <>{"Don't have an account? "}
                <button onClick={() => setTab("signup")} className="font-semibold text-foreground hover:underline">
                  Register
                </button>
              </>
            ) : (
              <>Already have an account?{" "}
                <button onClick={() => setTab("login")} className="font-semibold text-foreground hover:underline">
                  Sign in
                </button>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
