import React, {
  useEffect,
  useState,
} from "react";

import { Download, X } from "lucide-react";

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] =
    useState(null);

  const [visible, setVisible] =
    useState(false);

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();

      setDeferredPrompt(e);

      setTimeout(() => {
        setVisible(true);
      }, 5000);
    };

    window.addEventListener(
      "beforeinstallprompt",
      handler
    );

    return () =>
      window.removeEventListener(
        "beforeinstallprompt",
        handler
      );
  }, []);

  const installApp = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();

    const result =
      await deferredPrompt.userChoice;

    if (
      result.outcome === "accepted"
    ) {
      console.log("installed");
    }

    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-md">

      <div className="bg-black text-white rounded-3xl p-5 shadow-2xl">

        <div className="flex gap-4">

          <img
            src="/icon.png"
            className="w-14 h-14 rounded-2xl"
          />

          <div className="flex-1">

            <div className="flex justify-between items-start">

              <div>

                <h3 className="font-bold text-lg">
                  Install App
                </h3>

                <p className="text-sm text-gray-300 mt-1">
                  Faster loading, push notifications,
                  and native app experience.
                </p>

              </div>

              <button
                onClick={() =>
                  setVisible(false)
                }
              >
                <X size={18} />
              </button>

            </div>

            <button
              onClick={installApp}
              className="mt-4 bg-purple-600 hover:bg-purple-500 px-4 py-2 rounded-xl font-semibold flex items-center gap-2"
            >
              <Download size={18} />
              Install
            </button>

          </div>
        </div>
      </div>
    </div>
  );
}