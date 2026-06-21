import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    // The app-shell scroll area is the real scroller; reset it on navigation.
    const scroller = document.querySelector(".app-scroll");
    if (scroller) scroller.scrollTo({ top: 0, left: 0 });
    // Fallbacks (harmless if the document itself isn't the scroller).
    window.scrollTo(0, 0);
    if (document.documentElement) document.documentElement.scrollTop = 0;
    if (document.body) document.body.scrollTop = 0;
  }, [pathname]);

  return null;
}
