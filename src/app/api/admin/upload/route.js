import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase client with service role key
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = (supabaseUrl && supabaseKey) ? createClient(supabaseUrl, supabaseKey) : null;

// Whitelist of allowed image MIME types
const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/avif',
]);

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file) {
      return NextResponse.json({ error: "لم يتم تحديد ملف" }, { status: 400 });
    }

    // --- Validate file size ---
    if (file.size > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json({ error: "حجم الملف يتجاوز الحد المسموح (10 ميغابايت)" }, { status: 400 });
    }

    // --- Validate MIME type from file content (not from client header) ---
    // Read first 16 bytes to check magic bytes
    const buffer = await file.arrayBuffer();
    const bytes = new Uint8Array(buffer).slice(0, 16);

    // Check magic bytes for common image formats
    const isJpeg = bytes[0] === 0xFF && bytes[1] === 0xD8 && bytes[2] === 0xFF;
    const isPng  = bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4E && bytes[3] === 0x47;
    const isGif  = bytes[0] === 0x47 && bytes[1] === 0x49 && bytes[2] === 0x46;
    const isWebp = bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50;
    const isAvif = bytes[4] === 0x66 && bytes[5] === 0x74 && bytes[6] === 0x79 && bytes[7] === 0x70;

    if (!isJpeg && !isPng && !isGif && !isWebp && !isAvif) {
      return NextResponse.json({ error: "نوع الملف غير مسموح به. يُسمح فقط بـ JPG, PNG, WebP, GIF, AVIF" }, { status: 400 });
    }

    // Also validate declared MIME type
    if (!ALLOWED_MIME_TYPES.has(file.type)) {
      return NextResponse.json({ error: "نوع الملف غير مدعوم" }, { status: 400 });
    }

    if (!supabase) {
      return NextResponse.json({ error: "إعدادات التخزين غير مكتملة" }, { status: 500 });
    }

    // Create unique, safe filename (strip non-alphanumeric characters)
    const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_").substring(0, 100);
    const filename = `${Date.now()}-${safeName}`;

    // Re-create a Blob from the validated buffer to ensure clean upload
    const safeBlob = new Blob([buffer], { type: file.type });

    const { data, error } = await supabase.storage
      .from("products")
      .upload(filename, safeBlob, {
        contentType: file.type,
        cacheControl: "3600",
        upsert: false
      });

    if (error) {
      console.error("Supabase upload error:", error);
      return NextResponse.json({ error: "فشل رفع الملف إلى التخزين" }, { status: 500 });
    }

    const { data: urlData } = supabase.storage.from("products").getPublicUrl(filename);
    return NextResponse.json({ url: urlData.publicUrl });
  } catch (error) {
    console.error("Upload handler error:", error);
    return NextResponse.json({ error: "حدث خطأ أثناء رفع الملف" }, { status: 500 });
  }
}

