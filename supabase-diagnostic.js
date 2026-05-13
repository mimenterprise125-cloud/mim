// Diagnostic script to test Supabase connectivity
// Run this in browser console at http://localhost:3001

async function testSupabaseConnection() {
  console.log("🔍 Starting Supabase diagnostic...\n");

  // Test 1: Check environment variables
  console.log("1️⃣ Environment Variables:");
  const url = import.meta.env.VITE_SUPABASE_URL;
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
  console.log(`   URL: ${url ? "✅ Set" : "❌ Missing"}`);
  console.log(`   Key: ${key ? "✅ Set" : "❌ Missing"}`);

  if (!url || !key) {
    console.error("❌ Environment variables not set. Add them to .env file.");
    return;
  }

  // Test 2: Test direct connection
  console.log("\n2️⃣ Testing Connection:");
  try {
    const response = await fetch(`${url}/rest/v1/`, {
      headers: {
        Authorization: `Bearer ${key}`,
        apikey: key,
      },
    });
    if (response.ok) {
      console.log("   ✅ Supabase API responding");
    } else {
      console.log(`   ❌ Supabase API returned status ${response.status}`);
    }
  } catch (error) {
    console.error("   ❌ Connection failed:", error.message);
  }

  // Test 3: Check auth status
  console.log("\n3️⃣ Checking Auth State:");
  try {
    const response = await fetch(`${url}/auth/v1/user`, {
      headers: {
        Authorization: `Bearer ${key}`,
        apikey: key,
      },
    });
    if (response.status === 401) {
      console.log("   ✅ No session (expected if not logged in)");
    } else if (response.ok) {
      const user = await response.json();
      console.log("   ✅ User session active:", user.email);
    }
  } catch (error) {
    console.error("   ❌ Auth check failed:", error.message);
  }

  console.log("\n✅ Diagnostic complete!");
}

// Export for window access
window.testSupabaseConnection = testSupabaseConnection;

console.log(
  '%c🚀 Supabase Diagnostic Ready',
  'color: #fbbf24; font-size: 14px; font-weight: bold'
);
console.log('%cRun: testSupabaseConnection()', 'color: #60a5fa; font-size: 12px');
