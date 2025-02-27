// app/api/clerk-webhook/route.ts
import { supabase } from "@/lib/supabaseClient";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  // Parse the incoming JSON payload from Clerk
  const event = await request.json();

  // Optional: Verify the webhook signature using Clerk's secret (see Clerk docs)

  // Handle the "user.created" event
  if (event.type === "user.created") {
    const { id: clerkId, email_addresses: emailAddresses } = event.data;
    const email = emailAddresses?.[0]?.email_address;

    // Insert the user into Supabase (adjust the table/columns as needed)
    const { data, error } = await supabase
      .from("users")
      .insert([{ clerk_id: clerkId, email }]);

    if (error) {
      console.error("Error inserting user:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ success: true, data });
  }

  // Acknowledge any other events
  return NextResponse.json({ message: "Event not handled" });
}
