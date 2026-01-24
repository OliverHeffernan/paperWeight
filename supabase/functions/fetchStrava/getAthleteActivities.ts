export default async function getAthleteActivities(
	accessToken: string,
	{ before, after, page = 1, perPage = 30 }: {
		before?: number;   // epoch seconds
		after?: number;   // epoch seconds
		page?: number;
		perPage?: number;
	} = {}
) {
	let url = `https://www.strava.com/api/v3/athlete/activities?page=${page}&per_page=${perPage}`;

	if (before) url += `&before=${before}`;
	if (after) url += `&after=${after}`;

	const response = await fetch(url, {
		headers: {
			Authorization: `Bearer ${accessToken}`,
		},
	});

	if (!response.ok) {
		const err = await response.text();
		throw new Error(`Strava error ${response.status}: ${err}`);
	}

	return await response.json(); // Array of activities
}
