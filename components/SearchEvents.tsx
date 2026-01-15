"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export default function SearchEvents() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("search") || "");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    
    if (query) {
      params.set("search", query);
    } else {
      params.delete("search");
    }
    params.set("page", "1"); // Reset to page 1 for new search
    
    router.push(`/items?${params.toString()}`);
  };

  return (
    <form onSubmit={handleSearch} className="flex w-full md:w-auto gap-2">
      <input
        type="text"
        placeholder="Search events..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="px-4 py-2 border-2 border-[#EE6983] rounded-lg outline-none text-[#850E35] w-full md:w-64"
      />
      <button 
        type="submit"
        className="bg-[#EE6983] text-white px-4 py-2 rounded-lg font-bold hover:bg-[#850E35] transition"
      >
        Search
      </button>
    </form>
  );
}