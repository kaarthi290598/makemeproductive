// app/api/clerk-webhook/route.ts
import { NextResponse } from "next/server";
import { supabase } from "../../../lib/supabaseClient";

export async function POST(request: Request) {
  const event = await request.json();

  if (event.type === "user.created") {
    const { id: clerkId, email_addresses: emailAddresses } = event.data;
    const email = emailAddresses?.[0]?.email_address;

    // Upsert the user record in the "profiles" table
    const { data, error } = await supabase
      .from("profiles")
      .upsert([{ clerk_id: clerkId, email }], { onConflict: "clerk_id" });

    if (error) {
      console.error("Error upserting profile:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ success: true, data });
  }

  return NextResponse.json({ message: "Event not handled" });
}
