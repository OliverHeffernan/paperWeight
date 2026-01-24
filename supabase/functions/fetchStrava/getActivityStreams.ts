export default async function getActivityStreams(
	accessToken: string,
	activityId: number,
	streamTypes: string[] = ['heartrate']
) {
	const types = streamTypes.join(',');
	const url = `https://www.strava.com/api/v3/activities/${activityId}/streams/${types}`;

	console.log("Fetching streams for activity:", activityId, "types:", types);

	const response = await fetch(url, {
		headers: {
			Authorization: `Bearer ${accessToken}`,
		},
	});

	if (!response.ok) {
		const err = await response.text();
		console.error(`Strava streams error ${response.status}:`, err);
		throw new Error(`Strava streams error ${response.status}: ${err}`);
	}

	const data = await response.json();
	console.log(`Received ${data.length} stream types for activity ${activityId}`);
	return data;
}