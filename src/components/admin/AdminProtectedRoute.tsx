import { FormEvent, useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const SESSION_KEY = "bizmis_admin_authenticated";
const ADMIN_SESSION_ENDPOINT = "/api/admin-session";

type CheckResult = "ok" | "wrong-password" | "unavailable";

// The password is checked by the server function; the browser never sees it.
async function checkPassword(password: string): Promise<CheckResult> {
  try {
    const response = await fetch(ADMIN_SESSION_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (response.ok) return "ok";
    if (response.status === 401) return "wrong-password";
    return "unavailable";
  } catch {
    return "unavailable";
  }
}

function isSessionAuthenticated(): boolean {
  return sessionStorage.getItem(SESSION_KEY) === "true";
}

const AdminProtectedRoute = () => {
  const [authed, setAuthed] = useState(isSessionAuthenticated);
  const [password, setPassword] = useState("");
  const [showError, setShowError] = useState(false);
  const [unavailable, setUnavailable] = useState(false);
  const [checking, setChecking] = useState(false);

  if (unavailable) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-8">
        <p className="max-w-md text-center text-sm text-muted-foreground">
          This area is not available.
        </p>
      </div>
    );
  }

  if (!authed) {
    const submit = async (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setShowError(false);
      setChecking(true);
      const result = await checkPassword(password);
      setChecking(false);
      if (result === "ok") {
        sessionStorage.setItem(SESSION_KEY, "true");
        setAuthed(true);
        setPassword("");
      } else if (result === "wrong-password") {
        setShowError(true);
      } else {
        setUnavailable(true);
      }
    };

    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-8">
        <form
          onSubmit={submit}
          className="w-full max-w-sm space-y-4 rounded-lg border border-border bg-card p-6 shadow-sm"
        >
          <h1 className="font-heading text-xl font-semibold text-foreground">Admin</h1>
          <p className="text-sm text-muted-foreground">Password required for admin tools.</p>
          {showError && (
            <p className="text-sm text-destructive" role="alert">
              Incorrect password.
            </p>
          )}
          <div className="space-y-2">
            <Label htmlFor="admin-password">Password</Label>
            <Input
              id="admin-password"
              name="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              autoFocus
            />
          </div>
          <Button type="submit" className="w-full" disabled={checking}>
            Continue
          </Button>
        </form>
      </div>
    );
  }

  const signOut = () => {
    sessionStorage.removeItem(SESSION_KEY);
    setAuthed(false);
  };

  return (
    <div className="relative min-h-screen">
      <div className="fixed right-3 top-3 z-[200] flex flex-wrap items-center justify-end gap-2">
        <NavLink
          to="/admin/slides"
          className={({ isActive }) =>
            cn(
              "rounded-md px-2.5 py-1.5 font-body text-xs font-medium transition-colors",
              isActive ? "bg-primary/15 text-primary" : "text-muted-foreground hover:text-foreground",
            )
          }
        >
          Slides
        </NavLink>
        <NavLink
          to="/admin/invite-cards"
          className={({ isActive }) =>
            cn(
              "rounded-md px-2.5 py-1.5 font-body text-xs font-medium transition-colors",
              isActive ? "bg-primary/15 text-primary" : "text-muted-foreground hover:text-foreground",
            )
          }
        >
          Invite cards
        </NavLink>
        <Button type="button" variant="outline" size="sm" onClick={signOut}>
          Sign out
        </Button>
      </div>
      <Outlet />
    </div>
  );
};

export default AdminProtectedRoute;
