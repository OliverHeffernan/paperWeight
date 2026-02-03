// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import getLinkedActivity from "./getLinkedActivity.ts"

import { createClient } from "jsr:@supabase/supabase-js@2";

//const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
//const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;


console.log("Hello from Functions!")

Deno.serve(async (req: any) => {
	// Handle CORS preflight requests
	if (req.method === 'OPTIONS') {
		return new Response(null, {
			status: 200,
			headers: {
				'Access-Control-Allow-Origin': '*',
				'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
				'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
			},
		});
	}

	const authHeader = req.headers.get("Authorization");

	if (!authHeader?.startsWith("Bearer ")) {
		return new Response(JSON.stringify({ error: "Unauthorized" }), { 
			status: 401,
			headers: { 
				"Content-Type": "application/json",
				'Access-Control-Allow-Origin': '*'
			} 
		});
	}

	const jwt = authHeader.slice(7); // Remove "Bearer "

	// Client that respects the caller's auth (for RLS)
	const supabase = createClient(
		Deno.env.get("SUPABASE_URL")!,
		Deno.env.get("SUPABASE_ANON_KEY")!,
		{
			global: {
				headers: { Authorization: authHeader },
			},
		}
	);

	const { workout_id, description } = await req.json()
	if (workout_id) {
		const { data, error } = await supabase.from('workouts').select('*').eq('workout_id', workout_id).single()
		if (error) {
			console.error("Error fetching workout:", error);
			return new Response(
				JSON.stringify({ error: "Failed to fetch workout" }),
				{ 
					status: 500, 
					headers: { 
						"Content-Type": "application/json",
						'Access-Control-Allow-Origin': '*'
					} 
				},
			)
		}
		if (data) {
			const result = await getLinkedActivity(data, supabase, description);
			return new Response(
				JSON.stringify({ message: "Workout processed", workout: data, linkedActivity: result }),
				{ 
					headers: { 
						"Content-Type": "application/json",
						'Access-Control-Allow-Origin': '*'
					} 
				},
			)
		}
	}

	// Process all workouts that don't have linked Strava activities
	const { data, error } = await supabase.from('workouts').select('*').is('linked_strava_id', null);
	if (error) {
		console.error("Error fetching workouts:", error);
		return new Response(
			JSON.stringify({ error: "Failed to fetch workouts" }),
			{
				status: 500,
				headers: {
					"Content-Type": "application/json",
					'Access-Control-Allow-Origin': '*'
				}
			},
		)
	}

	let processedCount = 0;
	for (const workout of data || []) {
		try {
			const result = await getLinkedActivity(workout, supabase, description);
			if (result) {
				processedCount++;
			}
		} catch (error) {
			console.error(`Error processing workout ${workout.workout_id}:`, error);
		}
	}

	return new Response(
		JSON.stringify({ 
			message: "Strava sync completed", 
			processedCount: processedCount,
			totalUnlinked: data?.length || 0 
		}),
		{ 
			headers: { 
				"Content-Type": "application/json",
				'Access-Control-Allow-Origin': '*'
			} 
		},
	)
})

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/fetchStrava' \
	--header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
	--header 'Content-Type: application/json' \
	--data '{"name":"Functions"}'

*/
