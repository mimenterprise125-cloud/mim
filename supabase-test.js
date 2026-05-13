// Quick test script to verify Supabase connection and auth
const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = "https://pbrcqljfqswojlhvpizx.supabase.co";
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBicmNxbGpmcXN3b2psaHZwaXp4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgwNzAzMDYsImV4cCI6MjA5MzY0NjMwNn0.gicasCNrSuf8CLOGibgXcv2VpHkLQbi09BdMzlQURGk";

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testConnection() {
  console.log("Testing Supabase connection...\n");

  try {
    // Test 1: Get session
    console.log("1. Testing getSession()...");
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    if (sessionError) {
      console.error("❌ getSession error:", sessionError.message);
    } else {
      console.log("✅ getSession successful", sessionData?.session ? "- Session exists" : "- No session");
    }

    // Test 2: List users table
    console.log("\n2. Testing users table access...");
    const { data: usersData, error: usersError, count } = await supabase
      .from("users")
      .select("*", { count: "exact" })
      .limit(1);

    if (usersError) {
      console.error("❌ Users table error:", usersError.message);
    } else {
      console.log("✅ Users table accessible");
      console.log("   Total users in database:", count);
      if (usersData && usersData.length > 0) {
        console.log("   Sample user:", JSON.stringify(usersData[0], null, 2));
      }
    }

    // Test 3: List auth users (requires service role key)
    console.log("\n3. Testing auth users access (requires service role)...");
    const { data: authUsers, error: authError } = await supabase.auth.admin?.listUsers?.();
    if (authError) {
      console.log("⚠️  Cannot list auth users (expected - need service role key)");
    } else {
      console.log("✅ Auth users:", authUsers?.length || 0);
    }

    console.log("\n✅ All tests completed!");
  } catch (error) {
    console.error("❌ Test failed:", error.message);
  }
}

testConnection();
