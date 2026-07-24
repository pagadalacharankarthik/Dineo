import { NextResponse } from "next/server";
import { getAuthenticatedRestaurant } from "@/lib/auth-helpers";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function POST(req: Request) {
  try {
    const { errorResponse } = await getAuthenticatedRestaurant();
    if (errorResponse) return errorResponse;

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, error: "No image file provided" },
        { status: 400 }
      );
    }

    // Size limit check: 2.5MB to protect DB storage sizes
    if (file.size > 2.5 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, error: "Image size exceeds the 2.5MB limit. Please upload a smaller file." },
        { status: 400 }
      );
    }

    // Validate image mime type
    const validTypes = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/svg+xml"];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { success: false, error: "Only JPEG, PNG, WEBP, GIF, and SVG images are allowed" },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    try {
      // In local development, save to local filesystem for efficiency
      const uploadDir = path.join(process.cwd(), "public", "uploads");
      await mkdir(uploadDir, { recursive: true });

      const ext = path.extname(file.name) || ".png";
      const filename = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}${ext}`;
      const filePath = path.join(uploadDir, filename);

      await writeFile(filePath, buffer);

      const publicUrl = `/uploads/${filename}`;
      return NextResponse.json({
        success: true,
        url: publicUrl,
      });
    } catch (fsError: any) {
      console.warn("⚠️ Local disk write failed (likely read-only serverless environment). Falling back to Base64 data URL...");
      
      // On Vercel (read-only filesystem), automatically convert to inline base64 string
      const base64Data = buffer.toString("base64");
      const base64Url = `data:${file.type};base64,${base64Data}`;
      
      return NextResponse.json({
        success: true,
        url: base64Url,
      });
    }
  } catch (error) {
    console.error("POST /api/upload error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to upload image. Please try again." },
      { status: 500 }
    );
  }
}
