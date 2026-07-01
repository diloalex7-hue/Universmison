import Header from "./Header";
import Footer from "./Footer";
import MobileBottomNav from "./MobileBottomNav";
import { Capacitor } from "@capacitor/core";
import { useLocation } from "react-router-dom";

export default function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const isAuthPage = location.pathname === "/auth";
  const isAdminPage = location.pathname.startsWith("/admin");
  const showMobileNav = !isAuthPage && !isAdminPage;
  
  return (
    <div className="flex flex-col h-screen overflow-hidden md:h-auto md:min-h-screen md:overflow-visible">
      <Header />
      <main className={`flex-1 overflow-y-auto md:overflow-visible -webkit-overflow-scrolling-touch ${showMobileNav ? "pb-[calc(max(env(safe-area-inset-bottom,0px),36px)+72px)] md:pb-0" : ""}`}>
        {children}
      </main>
      {/* Show footer on desktop, hide on mobile viewport */}
      <div className="hidden md:block">
        <Footer />
      </div>
      {showMobileNav && <MobileBottomNav />}
    </div>
  );
}
