import { FormEvent, useState } from "react";
import { Outlet } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const SESSION_KEY = "bizmis_admin_authenticated";

function readConfiguredPassword(): string | undefined {
  const raw = import.meta.env.VITE_ADMIN_PASSWORD;
  if (typeof raw !== "string" || raw.length === 0) {
    return undefined;
  }
  return raw;
}

function isSessionAuthenticated(): boolean {
  return sessionStorage.getItem(SESSION_KEY) === "true";
}

const AdminProtectedRoute = () => {
  const configuredPassword = readConfiguredPassword();
  const [authed, setAuthed] = useState(isSessionAuthenticated);
  const [password, setPassword] = useState("");
  const [showError, setShowError] = useState(false);

  if (!configuredPassword) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-8">
        <p className="max-w-md text-center text-sm text-muted-foreground">
          Admin routes are disabled: set <code className="rounded bg-muted px-1 py-0.5">VITE_ADMIN_PASSWORD</code>{" "}
          in your environment.
        </p>
      </div>
    );
  }

  if (!authed) {
    const submit = (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setShowError(false);
      if (password === configuredPassword) {
        sessionStorage.setItem(SESSION_KEY, "true");
        setAuthed(true);
        setPassword("");
      } else {
        setShowError(true);
      }
    };

    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-8">
        <form
          onSubmit={submit}
          className="w-full max-w-sm space-y-4 rounded-lg border border-border bg-card p-6 shadow-sm"
        >
          <h1 className="font-heading text-xl font-semibold text-foreground">Admin</h1>
          <p className="text-sm text-muted-foreground">Password required to view slides.</p>
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
          <Button type="submit" className="w-full">
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
      <div className="fixed right-3 top-3 z-[200]">
        <Button type="button" variant="outline" size="sm" onClick={signOut}>
          Sign out
        </Button>
      </div>
      <Outlet />
    </div>
  );
};

export default AdminProtectedRoute;
