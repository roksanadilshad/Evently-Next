"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import toast from "react-hot-toast";
import Swal from "sweetalert2";
import { HashLoader } from "react-spinners";

interface EventItem {
  _id: string;
  title: string;
  shortDescription: string;
  fullDescription: string;
  price: number;
  image: string;
}

export default function EventList({ userId }: { userId: string }) {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editItem, setEditItem] = useState<EventItem | null>(null);

  useEffect(() => {
    if (userId) fetchEvents();
  }, [userId]);

  const fetchEvents = async () => {
    try {
      const res = await fetch(`/api/events?userId=${userId}`);
      const data = await res.json();
      // Handle array or {events: []} structure
      const arr = Array.isArray(data) ? data : (data.events || []);
      setEvents(arr);
    } catch (err) {
      toast.error("Failed to load events");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    const result = await Swal.fire({
      title: "Delete Event?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#850E35",
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      const res = await fetch(`/api/events/${id}`, { method: "DELETE" });
      if (res.ok) {
        setEvents((prev) => prev.filter((e) => e._id !== id));
        toast.success("Event removed");
      }
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editItem) return;

    try {
      const res = await fetch(`/api/events/${editItem._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editItem),
      });

      if (res.ok) {
        setEvents((prev) => prev.map((item) => (item._id === editItem._id ? editItem : item)));
        setEditItem(null);
        toast.success("Updated successfully!");
      }
    } catch (err) {
      toast.error("Update failed");
    }
  };

  if (loading) return <div className="flex justify-center p-10"><HashLoader color="#EE6983" /></div>;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.map((event) => (
          <div key={event._id} className="bg-[#FFC4C4] rounded-2xl shadow-lg overflow-hidden flex flex-col">
            <div className="relative h-40 w-full">
              <Image
                src={event.image?.trim()?.startsWith("http") ? event.image.trim() : "/placeholder.jpg"}
                alt={event.title}
                fill
                className="object-cover"
              />
            </div>
            <div className="p-4 flex-1 flex flex-col">
              <h3 className="font-bold text-[#850E35] text-lg">{event.title}</h3>
              <p className="text-sm text-[#850E35]/80 line-clamp-2 mb-2">{event.shortDescription}</p>
              <p className="font-bold mt-auto">${event.price}</p>
              <div className="flex gap-2 mt-4">
                <button onClick={() => setEditItem(event)} className="flex-1 py-2 bg-[#EE6983] text-white rounded-lg text-sm font-medium">Edit</button>
                <button onClick={() => handleDelete(event._id)} className="flex-1 py-2 bg-[#850E35] text-white rounded-lg text-sm font-medium">Delete</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Modal */}
      {editItem && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <form onSubmit={handleUpdate} className="bg-[#FCF5EE] p-6 rounded-2xl shadow-2xl max-w-md w-full space-y-4">
            <h2 className="text-xl font-bold text-[#850E35]">Edit Event</h2>
            <input 
                className="w-full p-2 border-2 border-[#EE6983] rounded-lg"
                value={editItem.title} 
                onChange={e => setEditItem({...editItem, title: e.target.value})} 
                placeholder="Title" 
            />
            <textarea 
                className="w-full p-2 border-2 border-[#EE6983] rounded-lg"
                value={editItem.shortDescription} 
                onChange={e => setEditItem({...editItem, shortDescription: e.target.value})} 
                placeholder="Description"
            />
            <input 
                className="w-full p-2 border-2 border-[#EE6983] rounded-lg"
                type="number" 
                value={editItem.price} 
                onChange={e => setEditItem({...editItem, price: Number(e.target.value)})} 
            />
            <div className="flex gap-2">
              <button type="submit" className="flex-1 py-2 bg-[#EE6983] text-white rounded-lg font-bold">Save</button>
              <button type="button" onClick={() => setEditItem(null)} className="flex-1 py-2 bg-gray-400 text-white rounded-lg font-bold">Cancel</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}