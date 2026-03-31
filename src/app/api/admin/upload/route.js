import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase client
// Service Role key is required for bypass policy if needed
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = (supabaseUrl && supabaseKey) ? createClient(supabaseUrl, supabaseKey) : null;

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    if (!supabase) {
      return NextResponse.json({ 
        error: "Supabase configuration is missing. Please add NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to your .env file." 
      }, { status: 500 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create unique filename
    const filename = `${Date.now()}-${file.name.replace(/\s+/g, "-")}`;

    // Upload to Supabase Storage
    // NOTE: Ensure you have a bucket named 'products' in your Supabase project
    const { data, error } = await supabase.storage
      .from("products")
      .upload(filename, buffer, {
        contentType: file.type || "image/jpeg",
        cacheControl: "3600",
        upsert: false
      });

    if (error) {
      console.error("Supabase upload error:", error);
      // If bucket doesn't exist, this error will happen.
      return NextResponse.json({ 
        error: `Supabase Error: ${error.message}. Make sure you have a bucket named 'products' and it is set to Public.` 
      }, { status: 500 });
    }

    // Get the Public URL
    const { data: urlData } = supabase.storage
      .from("products")
      .getPublicUrl(filename);

    const url = urlData.publicUrl;
    console.log(`File uploaded to Supabase: ${url}`);

    return NextResponse.json({ url });
  } catch (error) {
    console.error("API handler error:", error);
    return NextResponse.json({ error: "Internal server error during upload" }, { status: 500 });
  }
}
