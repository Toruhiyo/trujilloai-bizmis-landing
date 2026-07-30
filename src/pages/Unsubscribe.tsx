import { useState, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import Logo from "@/components/Logo";
import { useMessages } from "@/i18n/LocaleProvider";

type PageState = "confirm" | "loading" | "success" | "error";

const FOREGROUND = "#32281B";
const MUTED_FG = "#8F7856";

const Unsubscribe = () => {
  const messages = useMessages();
  const [searchParams] = useSearchParams();
  const ref = searchParams.get("ref")?.trim().toLowerCase() ?? "";
  const sig = searchParams.get("sig")?.trim().toLowerCase() ?? "";
  const isValidLink = Boolean(ref && sig);
  const [state, setState] = useState<PageState>(isValidLink ? "confirm" : "error");
  const [errorMessage, setErrorMessage] = useState(
    isValidLink ? "" : messages.unsubscribe.invalidLink,
  );

  const handleConfirm = useCallback(async () => {
    setState("loading");
    try {
      const resp = await fetch("/api/unsubscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ref, sig }),
      });
      const data = await resp.json();
      if (data.success) {
        setState("success");
      } else {
        setErrorMessage(data.error || messages.unsubscribe.genericError);
        setState("error");
      }
    } catch {
      setErrorMessage(messages.unsubscribe.networkError);
      setState("error");
    }
  }, [ref, sig, messages.unsubscribe.genericError, messages.unsubscribe.networkError]);

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
          <Logo showText size="md" />
        </a>

        {state === "confirm" && (
          <>
            <h1
              className="text-lg font-semibold mb-3"
              style={{ color: FOREGROUND }}
            >
              {messages.unsubscribe.confirmTitle}
            </h1>
            <p
              className="text-sm mb-8 leading-relaxed"
              style={{ color: MUTED_FG }}
            >
              {messages.unsubscribe.confirmBody}
            </p>
            <button
              onClick={handleConfirm}
              className="w-full rounded-xl py-3 text-sm font-semibold transition-opacity hover:opacity-90"
              style={{ backgroundColor: FOREGROUND, color: "#ffffff" }}
            >
              {messages.unsubscribe.confirmButton}
            </button>
          </>
        )}

        {state === "loading" && (
          <p className="text-sm py-6" style={{ color: MUTED_FG }}>
            {messages.unsubscribe.processing}
          </p>
        )}

        {state === "success" && (
          <>
            <h1
              className="text-lg font-semibold mb-3"
              style={{ color: FOREGROUND }}
            >
              {messages.unsubscribe.successTitle}
            </h1>
            <p
              className="text-sm mb-8 leading-relaxed"
              style={{ color: MUTED_FG }}
            >
              {messages.unsubscribe.successBody}{" "}
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
              {messages.unsubscribe.errorTitle}
            </h1>
            <p
              className="text-sm mb-8 leading-relaxed"
              style={{ color: MUTED_FG }}
            >
              {errorMessage}
            </p>
            {isValidLink && (
              <button
                onClick={handleRetry}
                className="w-full rounded-xl py-3 text-sm font-semibold transition-opacity hover:opacity-90"
                style={{ backgroundColor: FOREGROUND, color: "#ffffff" }}
              >
                {messages.unsubscribe.tryAgain}
              </button>
            )}
          </>
        )}

        <p className="mt-8 text-xs" style={{ color: MUTED_FG }}>
          {messages.unsubscribe.questions}{" "}
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
