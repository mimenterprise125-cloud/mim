// Debug Helper for Quotation Issues
// Add this to your browser console to debug quotation saving problems

// 1. Check if user is authenticated
console.log('=== USER AUTHENTICATION ===');
// This will show in the browser console after you load the quotation page

// 2. Test Supabase connection
async function testSupabaseConnection() {
  try {
    const { data: test } = await window.supabase.from('quotations').select('count', { count: 'exact', head: true });
    console.log('✅ Supabase connection: OK');
  } catch (error) {
    console.error('❌ Supabase connection error:', error);
  }
}

// 3. Check user role and permissions
async function checkUserPermissions() {
  try {
    const { data: user } = await window.supabase.auth.getUser();
    console.log('Current user ID:', user?.user?.id);
    
    const { data: userProfile } = await window.supabase
      .from('users')
      .select('*')
      .eq('id', user?.user?.id)
      .single();
    
    console.log('User profile:', userProfile);
    console.log('User role:', userProfile?.role);
  } catch (error) {
    console.error('Error checking permissions:', error);
  }
}

// 4. Test insert directly
async function testInsertQuotation() {
  try {
    const { data: user } = await window.supabase.auth.getUser();
    
    if (!user.user) {
      console.error('No authenticated user');
      return;
    }

    // Get first lead
    const { data: leads } = await window.supabase
      .from('leads')
      .select('*')
      .limit(1);

    if (!leads || leads.length === 0) {
      console.error('No leads found');
      return;
    }

    const testData = {
      lead_id: leads[0].id,
      total_sqft: 100,
      rate_per_sqft: 500,
      subtotal: 50000,
      gst_percentage: 18,
      gst_amount: 9000,
      total_with_gst: 59000,
      profit_percentage: 10,
      notes: 'Test quotation',
      created_by: user.user.id,
      created_at: new Date().toISOString(),
    };

    console.log('Testing insert with data:', testData);

    const { data, error } = await window.supabase
      .from('quotations')
      .insert(testData)
      .select();

    if (error) {
      console.error('❌ Insert error:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      console.error('Error details:', error.details);
    } else {
      console.log('✅ Insert successful:', data);
    }
  } catch (error) {
    console.error('Test error:', error);
  }
}

// 5. Check RLS policies
async function checkRLSPolicies() {
  console.log('Checking RLS policies...');
  console.log('To verify RLS is enabled on quotations table:');
  console.log('1. Go to Supabase dashboard');
  console.log('2. Click "SQL Editor"');
  console.log('3. Run: SELECT tablename FROM pg_tables WHERE schemaname = \'public\' AND tablename = \'quotations\'');
  console.log('4. Check "Authentication" → "Row Level Security" section');
}

// Run all tests
console.log('=== QUOTATION SAVING DEBUG HELPER ===');
console.log('Run the following commands in console:');
console.log('');
console.log('testSupabaseConnection() - Test Supabase connection');
console.log('checkUserPermissions() - Check user role and permissions');
console.log('testInsertQuotation() - Test direct insert');
console.log('checkRLSPolicies() - Instructions to verify RLS');
console.log('');
console.log('All functions are now available in your console.');
