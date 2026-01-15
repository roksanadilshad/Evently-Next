"use client";

import { useRouter, useSearchParams } from "next/navigation";

export default function SortDropdown({ currentSort }: { currentSort: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleSortChange = (value: string) => {
    // Create a new URLSearchParams object from current params
    const params = new URLSearchParams(searchParams.toString());
    params.set("sort", value);
    params.set("page", "1"); // Reset to page 1 when sorting changes

    router.push(`/items?${params.toString()}`);
  };

  return (
    <div className="flex items-center gap-2">
      <span className="text-[#850E35] font-medium">Sort By:</span>
      <select
        className="bg-white border-2 border-[#EE6983] rounded-lg p-2 text-[#850E35] outline-none cursor-pointer"
        onChange={(e) => handleSortChange(e.target.value)}
        defaultValue={currentSort || "date"}
      >
        <option value="date">Date (Upcoming First)</option>
        <option value="price_low">Price: Low to High</option>
        <option value="price_high">Price: High to Low</option>
        <option value="newest">Recently Added</option>
      </select>
    </div>
  );
}