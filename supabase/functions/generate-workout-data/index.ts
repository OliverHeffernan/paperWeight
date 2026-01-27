//import OpenAI from "npm:openai@4.24.1";
import OpenAIImgFormat from "./openAIImgURLFormat.ts";
import executePrompt from "./executePrompt.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";
import WorkoutResponse from "./workoutResponse.ts";
import uploadWorkoutData from "./uploadWorkoutData.ts";

// Environment variables should be set using Supabase secrets
Deno.serve(async (req)=>{
	// Handle CORS
	if (req.method === 'OPTIONS') {
		return new Response('OK', {
			headers: {
				'Access-Control-Allow-Origin': '*',
				'Access-Control-Allow-Methods': 'POST, OPTIONS, authorization, apikey, content-type',
				'Access-Control-Allow-Headers': 'authorization, apikey, content-type, x-client-info'
			}
		});
	}
	// Check if it's a POST request
	if (req.method !== 'POST' && req.method !== 'OPTIONS') {
		return new Response(
			JSON.stringify({
				error: 'Method not allowed'
			}), {
				status: 405,
				headers: {
					'Content-Type': 'application/json'
				}
			}
		);
	}

	const authHeader = req.headers.get('Authorization');

	if (!authHeader?.startsWith('Bearer ')) {
		return new Response(JSON.stringify({ error: 'Unauthorized' }), {
			status: 401,
			headers: {
				'Content-Type': 'application/json',
				'Access-Control-Allow-Origin': '*'
			}
		});
	}

	const jwt = authHeader.slice(7); // Remove "Bearer "

	const supabase = createClient(
		Deno.env.get('SUPABASE_URL')!,
		Deno.env.get('SUPABASE_ANON_KEY')!,
		{
			global: {
				headers: { Authorization: authHeader }
			}
		}
	);
	try {
		// Parse the request body
		const request = await req.json();
		const imageData = request.imageData;
		// Validate input
		if (!imageData) {
			return new Response(
				JSON.stringify({
					error: 'imageData is required'
				}),
				{
					status: 400,
					headers: {
						'Content-Type': 'application/json'
					}
				}
			);
		}
		// put the imageData into the correct JSON format for OpenAI
		if (!Array.isArray(imageData)) {
			return new Response(
				JSON.stringify({
					error: 'imageData must be an array of base64 strings'
				}),
				{
					status: 400,
					headers: {
						'Content-Type': 'application/json',
						'Access-Control-Allow-Origin': '*'
					}
				}
			);
		}
		// Create the OpenAI completion request
		//openAIImgFormat(imageData)
		const response = await executePrompt(openAIImgFormat(imageData));
		// Extract the response
		const generatedContent: WorkoutResponse = JSON.parse(response.choices[0].message.content);

		// Upload the workout data to Supabase
		const { id, error } = await uploadWorkoutData(supabase, generatedContent);
		if (error) {
			throw new Error(`Failed to upload workout data: ${error}`);
		}

		// Return the response
		return new Response(
			JSON.stringify({
				workout_id: id,
			}),
			{
				status: 200,
				headers: {
					'Content-Type': 'application/json',
					'Access-Control-Allow-Origin': '*'
				}
			}
		);
	} catch (error) {
		console.error('Error generating workout:', error);
		return new Response(JSON.stringify({
			error: 'Failed to generate workout',
			details: error.message
		}), {
				status: 500,
				headers: {
					'Content-Type': 'application/json',
					'Access-Control-Allow-Origin': '*'
				}
			}
		);
	}
});


function openAIImgFormat(imageData: string[]): OpenAIImgFormat[] {
	let result: OpenAIImgFormat[] = imageData.map((base64Data)=>({
		"type": "image_url",
		"image_url": {
			"url": base64Data
		} as OpenAIImgFormat["image_url"]
	}));
	result.unshift({
		"type": "text",
		"text": "Here are some pages of a handwritten workout log. Please extract the workout information and convert it into the described JSON format."
	});
	return result;
}
