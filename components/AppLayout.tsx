"use client";
import { usePathname } from 'next/navigation';
import Navbar from "./Navbar";
import Footer from "./Footer";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith('/admin');

  return (
    <div className="flex flex-col min-h-screen">
      {!isAdmin && <Navbar />}
      <main className="flex-grow bg-muted/30">
        {children}
      </main>
      {!isAdmin && <Footer />}
    </div>
  );
}
