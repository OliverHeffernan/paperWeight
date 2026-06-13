export default async function addDescriptionToStrava(
	activityId: number,
	description: string,
	accessToken: string
) {
	const url = `https://www.strava.com/api/v3/activities/${activityId}`;
	
	console.log("Updating Strava activity:", activityId, "with new description.");

	const response: Response = await fetch(url, {
		method: 'PUT',
		headers: {
			Authorization: `Bearer ${accessToken}`,
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({ description }),
	});

	if (!response.ok) {
		const err = await response.text();
		console.error(`Strava update error ${response.status}:`, err);
		throw new Error(`Strava update error ${response.status}: ${err}`);
	}

	const data = await response.json();
	console.log("Strava activity updated successfully:", data);
}
