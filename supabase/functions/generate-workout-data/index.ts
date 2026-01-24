//import OpenAI from "npm:openai@4.24.1";
import OpenAIImgURLFormat from "./openAIImgURLFormat.ts";
import executePrompt from "./executePrompt.ts";
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
	try {
		// Parse the request body
		const request = await req.json();
		const imgURLs = request.imgURLs;
		// Validate input
		if (!imgURLs) {
			return new Response(
				JSON.stringify({
					error: 'imgURLs is required'
				}),
				{
					status: 400,
					headers: {
						'Content-Type': 'application/json'
					}
				}
			);
		}
		// put the imgURL into the correct JSON format for OpenAI
		// Initialize OpenAI client
		const openai = new OpenAI({
			apiKey: Deno.env.get('OPENAI_API_KEY')
		});
		if (!Array.isArray(imgURLs)) {
			return new Response(
				JSON.stringify({
					error: 'imgURL must be an array of URLs'
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
		//openAIImgURLFormat(imgURLs)
		const response = await executePrompt(openAIImgURLFormat(imgURLs));
		// Extract the response
		const generatedContent = response.choices[0].message.content;
		// Return the response
		return new Response(generatedContent, {
			headers: {
				'Content-Type': 'application/json',
				'Access-Control-Allow-Origin': '*'
			}
		});
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
			});
	}
});


function openAIImgURLFormat(imgURL: string[]): OpenAIImgURLFormat[] {
	let result: OpenAIImgURLFormat[] = imgURL.map((url)=>({
		"type": "image_url",
		"image_url": {
			"url": url
		} as OpenAIImgURLFormat["image_url"]
	}));
	result.unshift({
		"type": "text",
		"text": "Here are some pages of a handwritten workout log. Please extract the workout information and convert it into the described JSON format."
	});
	return result;
}
