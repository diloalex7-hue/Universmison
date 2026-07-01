import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { App } from "@capacitor/app";
import { Capacitor } from "@capacitor/core";

export default function BackButtonHandler() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    let handler: any;

    const init = async () => {
      if (Capacitor.isNativePlatform() && Capacitor.isPluginAvailable("App")) {
        handler = await App.addListener("backButton", () => {
          if (window.history.length > 1) {
            window.history.back();
          } else {
            // If no history, we stay on the current page or go to home instead of exiting
            navigate("/", { replace: true });
          }
        });
      }
    };

    init();

    return () => {
      if (handler) {
        handler.remove();
      }
    };
  }, [navigate]);

  return null;
}

