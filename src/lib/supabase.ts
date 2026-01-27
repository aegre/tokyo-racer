import { createClient } from '@supabase/supabase-js';

// Astro uses import.meta.env for environment variables
// For server-side operations, we use the service_role key (secret key)
// This provides full database access and bypasses Row Level Security
// Never expose this key in client-side code!

// Support both new and legacy environment variable names for URL
const supabaseUrl = import.meta.env.SUPABASE_URL || import.meta.env.PUBLIC_SUPABASE_URL;

// Use service_role key (secret key) for server-side operations
// This provides full database access needed for custom authentication
const supabaseServiceKey =
	import.meta.env.SUPABASE_SERVICE_ROLE_KEY || import.meta.env.SUPABASE_SECRET_KEY;

if (!supabaseUrl) {
	throw new Error(
		'Missing Supabase URL. Please set SUPABASE_URL or PUBLIC_SUPABASE_URL in your .env file or environment variables.'
	);
}

if (!supabaseServiceKey) {
	throw new Error(
		'Missing Supabase service role key. Please set SUPABASE_SERVICE_ROLE_KEY in your .env file or environment variables. ' +
		'Get this from Project Settings → API → service_role key (secret). ' +
		'Note: Using service_role key is recommended for server-side operations.'
	);
}

// Create Supabase client with service_role key for server-side operations
// This key has elevated privileges and should NEVER be exposed to the client
export const supabase = createClient(supabaseUrl, supabaseServiceKey, {
	auth: {
		autoRefreshToken: false,
		persistSession: false,
	},
});
