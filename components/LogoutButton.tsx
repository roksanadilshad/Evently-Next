"use client";

import Cookies from "js-cookie";
import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const router = useRouter();

  const handleLogout = () => {
    Cookies.remove("isLoggedIn");
    Cookies.remove("userEmail");
    router.push("/login");
    router.refresh();
  };

  return (
    <button 
      onClick={handleLogout}
      className="w-full py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition text-sm font-bold"
    >
      Sign Out
    </button>
  );
}