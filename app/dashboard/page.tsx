import clientPromise from "@/lib/mongodb";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import LogoutButton from "@/components/LogoutButton";

// FORCE NEXT.JS TO CHECK COOKIES ON EVERY LOAD
export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  // 1. Check Authentication & Role
  const cookieStore = await cookies();
  const isLoggedIn = cookieStore.get("isLoggedIn");
  const userRole = cookieStore.get("userRole")?.value; // Get the role
  const userEmail = cookieStore.get("userEmail")?.value || "User";

  // If not logged in OR if they are just a 'user' (Guest), send to login/items
  if (!isLoggedIn || userRole !== "admin") {
    redirect("/login");
  }

  // 2. Fetch User's Events from MongoDB
  const client = await clientPromise;
  const db = client.db("eventsDB");
  const events = await db.collection("newEvent").find({}).toArray();

  return (
    <div className="min-h-screen bg-[#FCF5EE] flex flex-col md:flex-row">
      
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-[#850E35] text-white p-6 flex flex-col">
        <h2 className="text-2xl font-bold mb-8 italic">EventAdmin</h2>
        <nav className="flex-1 space-y-4">
          <Link href="/dashboard" className="block p-3 bg-[#EE6983] rounded-xl font-bold">Dashboard</Link>
          <Link href="/items" className="block p-3 hover:bg-[#EE6983]/20 rounded-xl transition">View Site</Link>
          <Link href="/dashboard/add-event" className="block p-3 hover:bg-[#EE6983]/20 rounded-xl transition">Add New Event</Link>
        </nav>
        <div className="pt-6 border-t border-white/20">
          <p className="text-xs opacity-60 mb-2">Logged in as Admin:</p>
          <p className="text-sm font-medium truncate mb-4">{userEmail}</p>
          <LogoutButton />
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-10">
        <header className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-3xl font-bold text-[#850E35]">Welcome Back!</h1>
            <p className="text-[#850E35]/60">Manage your event database here.</p>
          </div>
          <Link 
            href="/dashboard/add-event" 
            className="bg-[#EE6983] text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:bg-[#d94f6b] transition active:scale-95"
          >
            + Create Event
          </Link>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-white p-6 rounded-2xl shadow-sm border-b-4 border-[#EE6983]">
            <p className="text-sm text-gray-500 font-bold uppercase">Total Events</p>
            <h3 className="text-4xl font-black text-[#850E35]">{events.length}</h3>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border-b-4 border-[#850E35]">
            <p className="text-sm text-gray-500 font-bold uppercase">Upcoming</p>
            <h3 className="text-4xl font-black text-[#850E35]">
              {events.filter(e => e.date && new Date(e.date) >= new Date()).length}
            </h3>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border-b-4 border-[#FFC4C4]">
            <p className="text-sm text-gray-500 font-bold uppercase">Avg Price</p>
            <h3 className="text-4xl font-black text-[#850E35]">
              ${events.length ? (events.reduce((acc, curr) => acc + Number(curr.price || 0), 0) / events.length).toFixed(0) : 0}
            </h3>
          </div>
        </div>

        {/* Recent Events Table */}
        <div className="bg-white rounded-3xl shadow-sm overflow-hidden border border-[#850E35]/10">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center">
            <h3 className="text-xl font-bold text-[#850E35]">Recent Events</h3>
            <span className="text-xs font-bold text-[#EE6983] bg-[#EE6983]/10 px-3 py-1 rounded-full uppercase">Database Live</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#FCF5EE] text-[#850E35] text-sm uppercase">
                  <th className="p-4">Event</th>
                  <th className="p-4">Date</th>
                  <th className="p-4">Price</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {events.map((event) => {
                  const isValidUrl = event.image && 
                    (event.image.startsWith("http") || event.image.startsWith("/"));

                  const displayImage = isValidUrl ? event.image.trim() : "/placeholder.jpg";

                  return (
                    <tr key={event._id.toString()} className="border-b border-gray-50 hover:bg-gray-50 transition">
                      <td className="p-4 flex items-center gap-3">
                        <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                          <Image 
                            fill 
                            src={displayImage} 
                            alt="" 
                            className="object-cover"
                            unoptimized={true}
                          />
                        </div>
                        <span className="font-bold text-[#850E35] truncate max-w-[150px]">{event.title}</span>
                      </td>
                      <td className="p-4 text-gray-600 text-sm whitespace-nowrap">{event.date || "N/A"}</td>
                      <td className="p-4 font-bold text-[#850E35]">${event.price || 0}</td>
                      <td className="p-4">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${new Date(event.date) >= new Date() ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                          {new Date(event.date) >= new Date() ? 'Active' : 'Past'}
                        </span>
                      </td>
                      <td className="p-4 text-right whitespace-nowrap">
                        <Link href={`/dashboard/edit/${event._id}`} className="text-[#EE6983] hover:underline font-bold text-xs mr-4">Edit</Link>
                        <button className="text-red-500 hover:text-red-700 font-bold text-xs transition">Delete</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}