"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Home } from "lucide-react"; 


export default function Navbar() {
  
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 bg-white shadow-md shadow-gray-950 md:w-1/2 md:ml-[13rem] lg:ml-[22rem]">
      <div className={`max-w-7xl mx-auto px-4 md:px-6 h-16 flex ${pathname === "/features"?"justify-between":"justify-center"} items-center`}>
        
        <Link href="/">
          <h1 className="text-2xl md:text-4xl font-extrabold text-gray-900 tracking-wide">
            Brief-Link
          </h1>
        </Link>

        {/* Show Home icon ONLY on /features */}
        {pathname === "/features" && (
          <Link
            href="/"
            className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition"
            aria-label="Go back home"
          >
            <Home className="w-6 h-6 text-gray-700" />
          </Link>
        )}
      </div>
    </header>
  );
}
