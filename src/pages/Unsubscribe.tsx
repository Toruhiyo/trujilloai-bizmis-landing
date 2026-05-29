import { useState, useCallback } from "react";
import { useSearchParams } from "react-router-dom";

type PageState = "confirm" | "loading" | "success" | "error";

const BIZMIS_PRIMARY = "#F9A353";
const FOREGROUND = "#32281B";
const MUTED_FG = "#8F7856";

const Unsubscribe = () => {
  const [searchParams] = useSearchParams();
  const ref = searchParams.get("ref")?.trim().toLowerCase() ?? "";
  const [state, setState] = useState<PageState>(ref ? "confirm" : "error");
  const [errorMessage, setErrorMessage] = useState(
    ref ? "" : "This unsubscribe link is invalid. If you reached this page from an email, please contact hello@bizmis.ai.",
  );

  const handleConfirm = useCallback(async () => {
    setState("loading");
    try {
      const resp = await fetch("/api/unsubscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ref }),
      });
      const data = await resp.json();
      if (data.success) {
        setState("success");
      } else {
        setErrorMessage(data.error || "Something went wrong. Please try again.");
        setState("error");
      }
    } catch {
      setErrorMessage("Could not reach the server. Please try again or email hello@bizmis.ai.");
      setState("error");
    }
  }, [ref]);

  const handleRetry = useCallback(() => {
    setErrorMessage("");
    setState("confirm");
  }, []);

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ backgroundColor: "#F6F3EE" }}
    >
      <div
        className="w-full max-w-md rounded-2xl border p-10 text-center"
        style={{ backgroundColor: "#ffffff", borderColor: "#DFD3C3" }}
      >
        <a href="https://www.bizmis.ai" className="inline-block mb-8">
          <span
            className="text-xl font-bold"
            style={{ color: BIZMIS_PRIMARY }}
          >
            bizmis
          </span>
        </a>

        {state === "confirm" && (
          <>
            <h1
              className="text-lg font-semibold mb-3"
              style={{ color: FOREGROUND }}
            >
              Unsubscribe from Bizmis emails?
            </h1>
            <p
              className="text-sm mb-8 leading-relaxed"
              style={{ color: MUTED_FG }}
            >
              You will no longer receive early access invites or other
              outreach emails from Bizmis.
            </p>
            <button
              onClick={handleConfirm}
              className="w-full rounded-xl py-3 text-sm font-semibold transition-opacity hover:opacity-90"
              style={{ backgroundColor: FOREGROUND, color: "#ffffff" }}
            >
              Confirm Unsubscribe
            </button>
          </>
        )}

        {state === "loading" && (
          <p className="text-sm py-6" style={{ color: MUTED_FG }}>
            Processing your request...
          </p>
        )}

        {state === "success" && (
          <>
            <h1
              className="text-lg font-semibold mb-3"
              style={{ color: FOREGROUND }}
            >
              You've been unsubscribed
            </h1>
            <p
              className="text-sm mb-8 leading-relaxed"
              style={{ color: MUTED_FG }}
            >
              You won't receive any more emails from us. If this was a
              mistake, just reply to any previous email or reach out at{" "}
              <a
                href="mailto:hello@bizmis.ai"
                className="underline"
                style={{ color: FOREGROUND }}
              >
                hello@bizmis.ai
              </a>
              .
            </p>
          </>
        )}

        {state === "error" && (
          <>
            <h1
              className="text-lg font-semibold mb-3"
              style={{ color: FOREGROUND }}
            >
              Something went wrong
            </h1>
            <p
              className="text-sm mb-8 leading-relaxed"
              style={{ color: MUTED_FG }}
            >
              {errorMessage}
            </p>
            {ref && (
              <button
                onClick={handleRetry}
                className="w-full rounded-xl py-3 text-sm font-semibold transition-opacity hover:opacity-90"
                style={{ backgroundColor: FOREGROUND, color: "#ffffff" }}
              >
                Try Again
              </button>
            )}
          </>
        )}

        <p className="mt-8 text-xs" style={{ color: MUTED_FG }}>
          Questions?{" "}
          <a
            href="mailto:hello@bizmis.ai"
            className="underline"
            style={{ color: FOREGROUND }}
          >
            hello@bizmis.ai
          </a>
        </p>
      </div>
    </div>
  );
};

export default Unsubscribe;
