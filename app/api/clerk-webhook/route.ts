// app/api/clerk-webhook/route.ts
import { NextResponse } from "next/server";
import { supabase } from "../../../lib/supabaseClient";

export async function POST(request: Request) {
  const event = await request.json();

  if (event.type === "user.created") {
    const { id: clerkId, email_addresses: emailAddresses } = event.data;
    const email = emailAddresses?.[0]?.email_address;

    // 🔹 Check if user already exists
    const { data: existingUser, error: fetchError } = await supabase
      .from("profiles")
      .select("id") // Select minimal fields for efficiency
      .eq("clerk_id", clerkId)
      .single();

    if (fetchError && fetchError.code !== "PGRST116") {
      // Ignore "no rows found" error
      console.error("Error checking profile:", fetchError);
      return NextResponse.json({ error: fetchError.message }, { status: 500 });
    }

    if (existingUser) {
      return NextResponse.json({ message: "User already exists" });
    }

    // 🔹 Insert only if user does not exist
    const { data, error } = await supabase
      .from("profiles")
      .insert([{ clerk_id: clerkId, email }]);

    if (error) {
      console.error("Error inserting profile:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  }

  return NextResponse.json({ message: "Event not handled" });
}
