import clientPromise from "@/lib/mongodb";
import Image from "next/image";
import Link from "next/link";
import SortDropdown from "@/components/SortDropdown";
import SearchEvents from "@/components/SearchEvents"; // New Import

interface EventItem {
  _id: string;
  title: string;
  shortDescription: string;
  price: number;
  date: string;
  image: string;
}

export default async function EventsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; sort?: string; search?: string }>;
}) {
  const params = await searchParams;
  const currentPage = Number(params.page) || 1;
  const currentSort = params.sort || "date";
  const searchQuery = params.search || "";
  const limit = 6;
  const skip = (currentPage - 1) * limit;

  const client = await clientPromise;
  const db = client.db("eventsDB");

  const today = new Date().toISOString().split("T")[0];
  
  // Build MongoDB Query
  const query: any = { 
    date: { $gte: today } 
  };

  // Add search filter if query exists
  if (searchQuery) {
    query.title = { $regex: searchQuery, $options: "i" }; // "i" makes it case-insensitive
  }

  // Define sorting logic
  let sortQuery: any = { date: 1 };
  if (currentSort === "price_low") sortQuery = { price: 1 };
  if (currentSort === "price_high") sortQuery = { price: -1 };
  if (currentSort === "newest") sortQuery = { createdAt: -1 };

  const [events, totalEvents] = await Promise.all([
    db.collection("newEvent")
      .find(query)
      .sort(sortQuery)
      .skip(skip)
      .limit(limit)
      .toArray(),
    db.collection("newEvent").countDocuments(query),
  ]);

  const totalPages = Math.ceil(totalEvents / limit);

  return (
    <div className="bg-[#FCF5EE] min-h-screen p-6 md:p-10">
      <div className="max-w-6xl mx-auto">
        
        {/* Header with Search and Sort */}
        <div className="flex flex-col gap-6 mb-8">
          <h1 className="text-4xl font-bold text-[#850E35]">Upcoming Events</h1>
          
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-4 rounded-2xl shadow-sm">
            <SearchEvents />
            <SortDropdown currentSort={currentSort} />
          </div>
        </div>

        {/* Results Info */}
        {searchQuery && (
          <p className="mb-6 text-[#850E35]">
            Showing results for: <span className="font-bold">"{searchQuery}"</span>
          </p>
        )}

        {/* Event Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {events.length > 0 ? (
            events.map((event) => (
              <div key={event._id.toString()} className="bg-white rounded-2xl shadow-md overflow-hidden flex flex-col hover:shadow-xl transition">
                 <div className="relative h-48 w-full">
                  <Image
                    src={event.image?.trim() || "/placeholder.jpg"}
                    alt={event.title}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-5 flex-1 flex flex-col">
                  <h3 className="text-xl font-bold text-[#850E35] mb-2">{event.title}</h3>
                  <p className="text-gray-600 text-sm line-clamp-2 mb-4">
                      {event.shortDescription || "No description available"}
                  </p>
                  <div className="mt-auto flex justify-between items-center">
                    <span className="text-sm font-bold text-[#EE6983]">💰 ${event.price}</span>
                    <Link 
                      href={`/items/${event._id.toString()}`}
                      className="bg-[#850E35] text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-[#EE6983] transition"
                    >
                      Details
                    </Link>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-20 text-gray-500">
              No events found matching your search.
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center mt-12 gap-4">
            <Link
              href={`/items?page=${currentPage - 1}&sort=${currentSort}&search=${searchQuery}`}
              className={`px-4 py-2 bg-white rounded-lg border-2 border-[#850E35] ${currentPage === 1 ? "pointer-events-none opacity-30" : ""}`}
            >
              Previous
            </Link>
            <span className="font-bold">Page {currentPage} of {totalPages}</span>
            <Link
              href={`/items?page=${currentPage + 1}&sort=${currentSort}&search=${searchQuery}`}
              className={`px-4 py-2 bg-white rounded-lg border-2 border-[#850E35] ${currentPage === totalPages ? "pointer-events-none opacity-30" : ""}`}
            >
              Next
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}