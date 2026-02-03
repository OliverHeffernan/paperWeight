import getAthleteActivities from './getAthleteActivities.ts'
import getActivityStreams from './getActivityStreams.ts'
import refreshStravaToken from './refreshStravaToken.ts'
import addDescriptionToStrava from './addDescriptionToStrava.ts'
import "jsr:@supabase/functions-js/edge-runtime.d.ts"

export default async function getLinkedActivity(workout: any, supabase: any, description: string) {
	console.log("getLinkedActivity called for workout:", workout.workout_id, workout.start_time, workout.end_time);
	
	// checking that the activity has required properties
	if (
		!workout ||
		!workout.start_time ||
		!workout.end_time
	) { 
		console.log("Missing required workout properties");
		return null; 
	}

	const startTime = new Date(workout.start_time);
	const endTime = new Date(workout.end_time);

	// calculating buffer times
	const buffer = 15 * 60 * 1000; // 15 minutes in milliseconds

	// defining time window with buffers
	const windowStart = new Date(startTime.getTime() - buffer);
	const windowEnd = new Date(endTime.getTime() + buffer);

	var opts = {
		'before': Math.floor(windowEnd.getTime() / 1000), // epoch timestamp in seconds
		'after': Math.floor(windowStart.getTime() / 1000), // epoch timestamp in seconds
		'page': 1,
		'perPage': 30
	}

	console.log("Search window:", {
		workout_start: startTime.toISOString(),
		workout_end: endTime.toISOString(),
		window_start: windowStart.toISOString(),
		window_end: windowEnd.toISOString(),
		before_epoch: opts.before,
		after_epoch: opts.after
	});

	const userId = await supabase.auth.getUser().then(({ data: { user } }) => {
		return user?.id;
	});

	console.log("Getting profile for user:", userId);

	const { data: profileData, error: profileError } = await supabase.from('profiles').select('strava_access_token, strava_refresh_token, strava_token_expires_at').eq('id', userId).single();
	
	if (profileError || !profileData || !profileData.strava_access_token) {
		console.error("No access token found for user:", profileError);
		return null;
	}

	console.log("Profile data found, token expires:", profileData.strava_token_expires_at);

	let accessToken = profileData.strava_access_token;

	// Check if token is expired and refresh if needed
	const expiry = new Date(profileData.strava_token_expires_at);
	const now = new Date();
	if (now >= expiry && profileData.strava_refresh_token) {
		console.log("Token expired, refreshing...");
		try {
			const newCreds = await refreshStravaToken(profileData.strava_refresh_token);
			const { error: updateError } = await supabase.from('profiles').update({
				strava_access_token: newCreds.accessToken,
				strava_refresh_token: newCreds.refreshToken,
				strava_token_expires_at: new Date(newCreds.expiresAt * 1000).toISOString()
			}).eq('id', userId);
			
			if (updateError) {
				console.error("Error updating tokens:", updateError);
			} else {
				accessToken = newCreds.accessToken;
				console.log("Token refreshed successfully");
			}
		} catch (error) {
			console.error("Error refreshing token:", error);
			return null;
		}
	}

	console.log("Fetching Strava activities...");
	const activitiesResponse = await getAthleteActivities(accessToken, opts);
	console.log("Strava API response:", activitiesResponse?.length, "activities found");
	
	return parseData(workout, activitiesResponse, opts, supabase, accessToken, description);
}

async function parseData(workout: any, data: any, opts: any, supabase: any, accessToken: string, description: string) {
	console.log("parseData called with:", { 
		workoutId: workout.workout_id, 
		activitiesFound: data?.length || 0,
		activities: data?.map(a => ({ id: a.id, name: a.name, sport_type: a.sport_type, start_date: a.start_date }))
	});
	
	var bestMatch = getBestMatch(data, opts);
	addDescriptionToStrava(bestMatch.id, description, accessToken);
	console.log("Best match found:", bestMatch ? { 
		id: bestMatch.id, 
		name: bestMatch.name, 
		sport_type: bestMatch.sport_type,
		start_date: bestMatch.start_date
	} : null);
	console.log("Best match details:", bestMatch);

	if (!bestMatch) {
		console.log("No match found for workout", workout.workout_id);
		return null;
	}

	console.log("Updating workout with Strava data...");
	const updateData: any = {
		linked_strava_id: bestMatch.id
	};
	
	if (bestMatch.has_heartrate) {
		updateData.heart_rate = bestMatch.average_heartrate;
		console.log("Added heart rate:", bestMatch.average_heartrate);
	}
	if (bestMatch.kilojoules) {
		updateData.energy = bestMatch.kilojoules;
		console.log("Added energy:", bestMatch.kilojoules);
	}
	if (bestMatch.calories) {
		updateData.energy = bestMatch.calories * 4.184;
	}

	console.log(bestMatch);

	// Fetch heart rate stream if activity has heart rate data
	if (bestMatch.has_heartrate) {
		try {
			console.log("Fetching heart rate stream for activity:", bestMatch.id);
			
			// Get the access token from the context (passed from parent function)
			const userId = await supabase.auth.getUser().then(({ data: { user } }) => user?.id);
			const { data: profileData } = await supabase.from('profiles').select('strava_access_token').eq('id', userId).single();
			
			if (profileData?.strava_access_token) {
				const streams = await getActivityStreams(profileData.strava_access_token, bestMatch.id, ['heartrate']);
				
				// Find the heart rate stream in the response
				const heartRateStream = streams.find(stream => stream.type === 'heartrate');
				if (heartRateStream) {
					updateData.heartrate_stream = heartRateStream;
					console.log("Added heart rate stream with", heartRateStream.data?.length || 0, "data points");
				} else {
					console.log("No heart rate stream found in response");
				}
			}
		} catch (error) {
			console.error("Error fetching heart rate stream:", error);
			// Continue with update even if stream fetch fails
		}
	}
	
	console.log("Attempting to update workout:", workout.workout_id, "with data:", {
		...updateData,
		heartrate_stream: updateData.heartrate_stream ? `${updateData.heartrate_stream.data?.length || 0} data points` : 'none'
	});
	
	const { data: updateResult, error: updateError } = await supabase.from('workouts').update(updateData).eq('workout_id', workout.workout_id).select();
	
	if (updateError) {
		console.error("Error updating workout:", updateError);
		return null;
	} else {
		console.log("Successfully updated workout:", updateResult);
	}

	return bestMatch;
}

function getBestMatch(data: any, opts: any) {
	if (!data || data.length === 0) {
		return null;
	}

	if (data.length === 1) {
		return data[0];
	}

	var bestMatches: any[] = []
	for (var i = 0; i < data.length; i++) {
		var activity = data[i];
		if (activity.sport_type !== 'WeightTraining') {
			continue;
		}
		bestMatches.push(activity);
	}
	if (bestMatches.length === 0) {
		bestMatches = data;
	}

	// Further refine by closest start time
	bestMatches.sort((a, b) => {
		var aStart = new Date(a.start_date).getTime();
		var bStart = new Date(b.start_date).getTime();
		var targetStart = (opts.after + opts.before) / 2 * 1000; // midpoint of the window

		return Math.abs(aStart - targetStart) - Math.abs(bStart - targetStart);
	});

	return bestMatches[0];
}
