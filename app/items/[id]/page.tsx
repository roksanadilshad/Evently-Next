import BookNowButton from "@/components/BookButton";
import ItemNotFound from "@/components/ItemNotFound";
import Image from "next/image";
import Link from "next/link";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

interface Item {
  _id: string;
  title: string;
  fullDescription: string;
  shortDescription: string;
  date: string;
  time: string;
  location: string;
  category: string;
  price: number;
  priority: string;
  image: string;
}

// FETCH DIRECTLY FROM DB (Faster & works on any port)
async function getItem(id: string): Promise<Item | null> {
  try {
    if (!ObjectId.isValid(id)) return null;
    
    const client = await clientPromise;
    const db = client.db("eventsDB");
    const doc = await db.collection("newEvent").findOne({ _id: new ObjectId(id) });

    if (!doc) return null;

    return {
      ...doc,
      _id: doc._id.toString(),
      shortDescription: doc.shortDescription || doc.shortDesc || "",
      fullDescription: doc.fullDescription || doc.fullDesc || "",
    } as Item;
  } catch (error) {
    console.error("Database fetch error:", error);
    return null;
  }
}

async function getRelatedItems(currentId: string): Promise<Item[]> {
  try {
    const client = await clientPromise;
    const db = client.db("eventsDB");
    const docs = await db.collection("newEvent")
      .find({ _id: { $ne: new ObjectId(currentId) } })
      .limit(3)
      .toArray();

    return docs.map(doc => ({
      ...doc,
      _id: doc._id.toString(),
      shortDescription: doc.shortDescription || doc.shortDesc || "",
    })) as Item[];
  } catch (error) {
    console.error("Related items fetch error:", error);
    return [];
  }
}

interface Props {
  params: Promise<{ id: string }>;
}

const ItemPage = async ({ params }: Props) => {
  const { id } = await params;
  const item = await getItem(id);
  const relatedEvents = await getRelatedItems(id);

  if (!item) return <ItemNotFound />;

  return (
    <div className="bg-[#FCF5EE] min-h-screen p-6 md:p-10">
      <div className="max-w-6xl mx-auto">
        {/* Back Button */}
        <Link
          href="/items"
          className="inline-block mb-6 text-[#850E35] hover:text-[#EE6983] transition font-medium"
        >
          ← Back to Events
        </Link>

        {/* Main Container */}
        <div className="bg-[#FFC4C4] text-[#850E35] shadow-lg rounded-2xl overflow-hidden md:flex md:gap-8 p-6">
          
          {/* Left: Image */}
          <div className="md:w-1/2 rounded-xl overflow-hidden shadow-md relative h-80 md:h-auto">
            <Image
              fill
              src={item.image?.trim() || "/placeholder.jpg"}
              alt={item.title}
              className="object-cover transition-transform duration-300 hover:scale-105"
            />
          </div>

          {/* Right: Info */}
          <div className="md:w-1/2 flex flex-col justify-between mt-6 md:mt-0">
            <div>
              <h1 className="text-4xl font-bold mb-4 leading-tight">{item.title}</h1>

              {/* Meta badges */}
              <div className="flex flex-wrap gap-3 mb-5">
                <span className="bg-white text-[#850E35] px-3 py-1 rounded-full text-sm shadow">
                  📅 {item.date}
                </span>
                <span className="bg-white text-[#850E35] px-3 py-1 rounded-full text-sm shadow">
                  🕒 {item.time}
                </span>
                <span className="bg-white text-[#850E35] px-3 py-1 rounded-full text-sm shadow">
                  📍 {item.location}
                </span>
                <span className="bg-white text-[#850E35] px-3 py-1 rounded-full text-sm shadow font-bold">
                  💰 ${item.price}
                </span>
              </div>

              {/* Description */}
              <div className="space-y-4">
                <p className="font-semibold italic opacity-90">{item.shortDescription}</p>
                <p className="leading-relaxed whitespace-pre-line">{item.fullDescription}</p>
              </div>
            </div>

            {/* CTA & Map */}
            <div className="mt-6 space-y-6">
              <BookNowButton eventId={item._id} eventTitle={item.title} />
              
              {item.location && (
                <div className="w-full h-64 rounded-xl overflow-hidden shadow-lg border-4 border-white">
                  <iframe
                    title="Event Location"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    loading="lazy"
                    allowFullScreen
                    src={`https://www.google.com/maps?q=${encodeURIComponent(item.location)}&output=embed`}
                  ></iframe>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Related Events Section */}
        {relatedEvents.length > 0 && (
          <div className="mt-16">
            <h2 className="text-3xl font-bold text-[#850E35] mb-6">Related Events</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {relatedEvents.map((ev) => (
                <div key={ev._id} className="bg-white rounded-xl shadow-md hover:shadow-xl transition p-4">
                  <div className="relative h-40 w-full mb-3 rounded-lg overflow-hidden">
                    <Image
                      fill
                      src={ev.image?.trim() || "/placeholder.jpg"}
                      alt={ev.title}
                      className="object-cover"
                    />
                  </div>
                  <h3 className="font-semibold text-lg text-[#850E35]">{ev.title}</h3>
                  <p className="text-sm text-gray-600 line-clamp-2">{ev.shortDescription}</p>
                  <Link
                    href={`/items/${ev._id}`}
                    className="inline-block mt-3 text-[#EE6983] hover:underline text-sm font-bold"
                  >
                    View Details →
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ItemPage;