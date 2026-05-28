import { useEffect, useState } from "react";
import AppRouter from "./routes/AppRouter.jsx";
import LoadingOverlay from "./components/LoadingOverlay.jsx";

const INTRO_STORAGE_KEY = "wc_intro_loader_seen";

export default function App() {
  const [showIntro, setShowIntro] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.sessionStorage.getItem(INTRO_STORAGE_KEY) !== "true";
  });

  useEffect(() => {
    if (!showIntro) return undefined;

    const timeoutId = window.setTimeout(() => {
      window.sessionStorage.setItem(INTRO_STORAGE_KEY, "true");
      setShowIntro(false);
    }, 2000);

    return () => window.clearTimeout(timeoutId);
  }, [showIntro]);

  return (
    <>
      <AppRouter />
      {showIntro && <LoadingOverlay message="Cargando" />}
    </>
  );
}
