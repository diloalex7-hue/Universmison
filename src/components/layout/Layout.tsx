import Header from "./Header";
import Footer from "./Footer";
import MobileBottomNav from "./MobileBottomNav";
import { Capacitor } from "@capacitor/core";

export default function Layout({ children }: { children: React.ReactNode }) {
  const isNative = Capacitor.isNativePlatform();
  
  return (
    <div className={`flex min-h-screen flex-col ${isNative ? "pb-16" : ""}`}>
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
      <MobileBottomNav />
    </div>
  );
}
