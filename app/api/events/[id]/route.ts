import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

// DELETE /api/events/[id]
export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid ID" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("eventsDB");

    const result = await db.collection("newEvent").deleteOne({
      _id: new ObjectId(id),
    });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { success: false, message: "Event not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete event" },
      { status: 500 }
    );
  }
}

// PUT /api/events/[id]
export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid ID" },
        { status: 400 }
      );
    }

    const body = await req.json();

    // --- FIX 1: REMOVE _id FROM THE UPDATE BODY ---
    // MongoDB will throw an error if you try to include _id in a $set operation
    const { _id, ...updateData } = body; 

    // Optional: Ensure price is stored as a number
    if (updateData.price) {
        updateData.price = Number(updateData.price);
    }

    const client = await clientPromise;
    const db = client.db("eventsDB");

    const result = await db.collection("newEvent").updateOne(
      { _id: new ObjectId(id) },
      { 
        $set: {
            ...updateData,
            updatedAt: new Date() // Track when it was edited
        } 
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { success: false, message: "Event not found" },
        { status: 404 }
      );
    }

    // --- FIX 2: CORRECT COLLECTION NAME ---
    // Changed "events" to "newEvent" to match your collection name
    const updatedDoc = await db.collection("newEvent").findOne({ _id: new ObjectId(id) }); 

    return NextResponse.json({
      success: true,
      event: updatedDoc
    });
  } catch (error) {
    console.error("PUT ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update event" },
      { status: 500 }
    );
  }
}