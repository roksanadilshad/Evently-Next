import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function GET(req: Request) {
  try {
    const client = await clientPromise;
    const db = client.db("eventsDB");

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    // If no userId → return empty array
    if (!userId) {
      return NextResponse.json([], { status: 200 });
    }

    const products = await db
      .collection("newEvent")
      .find({ userId })
      .sort({ createdAt: -1 })
      .toArray();

    const serialized = products.map((p) => ({
      ...p,
      _id: p._id.toString(),
      // FIX: Ensure it's a Date object before calling toISOString
      createdAt: p.createdAt ? new Date(p.createdAt).toISOString() : new Date().toISOString(),
      // ADDED: Safety fallback for frontend interface names
      shortDescription: p.shortDescription || p.shortDesc || "",
      fullDescription: p.fullDescription || p.fullDesc || "",
    }));

    return NextResponse.json(serialized);
  } catch (error) {
    console.error("GET Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch events" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const newEvent = {
      title: body.title,
      // Mapping frontend 'shortDesc' to DB 'shortDescription' 
      shortDescription: body.shortDesc, 
      fullDescription: body.fullDesc,
      date: body.date,
      time: body.time,
      location: body.location,
      category: body.category,
      // FIX: Trim the image string to prevent the "trailing space" error
      image: body.image ? body.image.trim() : "", 
      price: Number(body.price),
      priority: body.priority,
      userId: body.userId,
      createdAt: new Date(), // This stores it as a proper BSON Date in Mongo
    };

    const client = await clientPromise;
    const db = client.db("eventsDB");

    const result = await db.collection("newEvent").insertOne(newEvent);

    return NextResponse.json({
      success: true,
      event: { 
        ...newEvent, 
        _id: result.insertedId.toString(),
        createdAt: newEvent.createdAt.toISOString() // Return as string for frontend
      },
    });
  } catch (error) {
    console.error("POST Error:", error);
    return NextResponse.json(
      { success: false, message: "Error inserting new event" },
      { status: 500 }
    );
  }
}