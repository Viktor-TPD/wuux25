import { put } from "@vercel/blob";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    const blob = await put("test.txt", "Hello Vercel Blob!", {
      access: "public",
    });

    return NextResponse.json({ url: blob.url });
  } catch (error) {
    console.error("Blob upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload to blob" },
      { status: 500 }
    );
  }
}
