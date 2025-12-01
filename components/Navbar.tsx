"use client";
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ShoppingCartOutlined, UserOutlined, SearchOutlined, MenuOutlined } from '@ant-design/icons';
import { useState, useEffect } from 'react';

import { useCartStore } from '@/store/useCartStore';

import { supabase } from '@/lib/supabaseClient';

import { User } from '@supabase/supabase-js';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const totalItems = useCartStore((state) => state.getTotalItems());
  const router = useRouter();

  const [activeOrderCount, setActiveOrderCount] = useState(0);

  const fetchActiveOrders = async (userId: string) => {
    const { count, error } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .in('status', ['pending', 'paid', 'preparing', 'shipped']);
    
    if (!error && count !== null) {
      setActiveOrderCount(count);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
    
    // Check current session
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const currentUser = session?.user || null;
      setUser(currentUser);

      if (currentUser) {
        fetchActiveOrders(currentUser.id);
      }
    };
    
    checkUser();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const currentUser = session?.user || null;
      setUser(currentUser);
      if (currentUser) {
        fetchActiveOrders(currentUser.id);
      } else {
        setActiveOrderCount(0);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const handleSearch = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setIsMenuOpen(false);
      setIsSearchOpen(false);
    }
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-md">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="relative h-10 w-10 md:h-12 md:w-12 flex-shrink-0">
             <Image 
               src="/products/img_3565.png" 
               alt="นัทโมบายจังหวัดเลย" 
               fill
               className="object-contain"
               priority
             />
          </div>
          <span className="text-lg md:text-xl font-bold text-primary tracking-tight truncate">
            นัทโมบายจังหวัดเลย
          </span>
        </Link>
        

        {/* Desktop Search */}
        <div className="hidden md:flex flex-1 max-w-md mx-8 relative">
          <input 
            type="text" 
            placeholder="ค้นหาสินค้า..." 
            className="w-full pl-10 pr-4 py-2 rounded-full border border-border bg-muted focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
          <SearchOutlined 
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground cursor-pointer hover:text-primary" 
            onClick={() => handleSearch()}
          />
        </div>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-6">
          <Link href="/cart" className="relative group">
            <ShoppingCartOutlined className="text-2xl text-foreground group-hover:text-primary transition-colors" />
            {mounted && totalItems > 0 && (
              <span className="absolute -top-2 -right-2 bg-primary text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full">
                {totalItems}
              </span>
            )}
          </Link>
          <Link href={user ? "/account" : "/login"} className="flex items-center gap-2 hover:text-primary transition-colors">
            <UserOutlined className="text-xl" />
            <span>{user ? "ดูประวัติคำสั่งซื้อ" : "เข้าสู่ระบบ"}</span>
          </Link>
        </div>

        {/* Mobile Actions */}
        <div className="flex md:hidden items-center gap-4">
          <button 
            className="text-xl"
            onClick={() => {
              setIsSearchOpen(!isSearchOpen);
              setIsMenuOpen(false);
            }}
          >
            <SearchOutlined />
          </button>
          
          <Link href="/cart" className="relative">
            <ShoppingCartOutlined className="text-xl text-foreground" />
            {mounted && totalItems > 0 && (
              <span className="absolute -top-2 -right-2 bg-primary text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full">
                {totalItems}
              </span>
            )}
          </Link>

          <Link href={user ? "/account" : "/login"} className="relative text-xl text-foreground">
            <UserOutlined />
            {mounted && activeOrderCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full animate-pulse">
                {activeOrderCount}
              </span>
            )}
          </Link>

          <button 
            className="text-xl"
            onClick={() => {
              setIsMenuOpen(!isMenuOpen);
              setIsSearchOpen(false);
            }}
          >
            <MenuOutlined />
          </button>
        </div>
      </div>

      {/* Mobile Search Bar */}
      {isSearchOpen && (
        <div className="md:hidden border-t border-border bg-background p-4 animate-in slide-in-from-top-2">
          <div className="relative">
            <input 
              type="text" 
              placeholder="ค้นหาสินค้า..." 
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-border bg-muted focus:outline-none focus:ring-2 focus:ring-primary/50"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              autoFocus
            />
            <SearchOutlined 
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" 
              onClick={() => handleSearch()}
            />
          </div>
        </div>
      )}

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-border bg-background p-4 flex flex-col gap-4 animate-in slide-in-from-top-2">
          <Link href={user ? "/account" : "/login"} className="flex items-center gap-3 p-2 hover:bg-muted rounded-lg" onClick={() => setIsMenuOpen(false)}>
            <UserOutlined className="text-xl" />
            <span>{user ? "ดูประวัติคำสั่งซื้อ" : "เข้าสู่ระบบ"}</span>
          </Link>
        </div>
      )}
    </nav>
  );
}
