import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
	'Access-Control-Allow-Origin': '*',
	'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
	'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
}

interface StravaDeauthEvent {
	object_type: string; // "athlete"
	object_id: number; // Strava athlete ID
	aspect_type: string; // "update" 
	updates: {
		authorized: "false" | "true";
	};
	owner_id: number; // Same as object_id
	subscription_id: number;
	event_time: number; // Unix timestamp
}

Deno.serve(async (req) => {
	console.log('🚀 Strava webhook request:', req.method, req.url)
	
	try {
		// Handle GET requests for Strava webhook verification
		if (req.method === 'GET') {
			const url = new URL(req.url)
			const challenge = url.searchParams.get('hub.challenge')
			const verifyToken = url.searchParams.get('hub.verify_token')
			const mode = url.searchParams.get('hub.mode')

			console.log('Strava webhook verification request:', {
				challenge,
				verifyToken,
				mode,
				fullUrl: req.url
			})

			// Get the expected verify token from environment
			const expectedVerifyToken = Deno.env.get('STRAVA_VERIFY_TOKEN')
			//console.log('Expected verify token configured:', !!expectedVerifyToken)

			// Verify the subscription
			if (mode === 'subscribe' && challenge) {
				// Check verify token if it's configured
				if (expectedVerifyToken && verifyToken !== expectedVerifyToken) {
					console.error('Verify token mismatch:', {
						expected: expectedVerifyToken,
						received: verifyToken
					})
					return new Response(
						JSON.stringify({ error: 'Invalid verify token' }),
						{ status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
					)
				}

				console.log('Responding to Strava webhook verification challenge')
				return new Response(
					JSON.stringify({ "hub.challenge": challenge }),
					{ 
						status: 200, 
						headers: { 
							...corsHeaders, 
							'Content-Type': 'application/json' 
						} 
					}
				)
			}

			// If no challenge but still GET, return a simple success for testing
			if (req.method === 'GET') {
				console.log('GET request without proper challenge parameters')
				return new Response(
					JSON.stringify({ status: 'webhook endpoint active', timestamp: new Date().toISOString() }),
					{ status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
				)
			}

			return new Response(
				JSON.stringify({ error: 'Invalid verification request' }),
				{ status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
			)
		}

		const supabaseClient = createClient(
			Deno.env.get('SUPABASE_URL') ?? '',
			Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
		)

		// Handle POST requests for actual webhook events
		if (req.method !== 'POST') {
			return new Response(
				JSON.stringify({ error: 'Method not allowed' }),
				{ status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
			)
		}

		const body: StravaDeauthEvent = await req.json()
		console.log('Received Strava deauth webhook:', body)

		// Validate the webhook payload
		if (body.object_type !== 'athlete' || body.aspect_type !== 'update') {
			console.log('Not a relevant webhook event:', body.object_type, body.aspect_type)
			return new Response('OK', { 
				status: 200, 
				headers: corsHeaders 
			})
		}

		// Check if this is a deauthorization event
		if (body.updates?.authorized !== 'false') {
			console.log('Not a deauthorization event:', body.updates)
			return new Response('OK', { 
				status: 200, 
				headers: corsHeaders 
			})
		}

		const stravaAthleteId = body.object_id
		console.log('Processing deauthorization for Strava athlete ID:', stravaAthleteId)

		// Find the user with this Strava athlete ID
		const { data: profile, error: findError } = await supabaseClient
			.from('profiles')
			.select('id, strava_athlete_id, strava_athlete_name')
			.eq('strava_athlete_id', stravaAthleteId)
			.single()

		if (findError || !profile) {
			console.log('No profile found for Strava athlete ID:', stravaAthleteId, findError)
			return new Response('OK', { 
				status: 200, 
				headers: corsHeaders 
			})
		}

		console.log('Found profile to deauthorize:', profile.id, profile.strava_athlete_name)

		// Clear all Strava-related data from the user's profile
		const { error: updateError } = await supabaseClient
			.from('profiles')
			.update({
				strava_access_token: null,
				strava_refresh_token: null,
				strava_token_expires_at: null,
				strava_athlete_id: null,
				strava_athlete_name: null
			})
			.eq('id', profile.id)

		if (updateError) {
			console.error('Error clearing Strava data from profile:', updateError)
			return new Response(
				JSON.stringify({ error: 'Failed to clear Strava data' }),
				{ status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
			)
		}

		// Clear Strava data from all workouts belonging to this user
		const { error: workoutsError } = await supabaseClient
			.from('workouts')
			.update({
				linked_strava_id: null,
				heartrate_stream: null,
				// Note: We keep heart_rate and energy as they might be manually entered
			})
			.eq('user_id', profile.id)
			.not('linked_strava_id', 'is', null) // Only update workouts that had Strava data

		if (workoutsError) {
			console.error('Error clearing Strava data from workouts:', workoutsError)
			// Don't fail the webhook if this fails - profile cleanup is more important
		} else {
			console.log('Cleared Strava data from workouts for user:', profile.id)
		}

		console.log('Successfully deauthorized Strava for user:', profile.id)

		return new Response('OK', { 
			status: 200, 
			headers: corsHeaders 
		})

	} catch (error) {
		console.error('Error processing Strava deauth webhook:', error)
		return new Response(
			JSON.stringify({ error: 'Internal server error' }),
			{ status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
		)
	}
})
