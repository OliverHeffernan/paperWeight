export default function getApi(): any {
	var StravaApiV3 = require('strava_api_v3');
	var defaultClient = StravaApiV3.ApiClient.instance;

	// Configure OAuth2 access token for authorization: strava_oauth
	var strava_oauth = defaultClient.authentications['strava_oauth'];
	strava_oauth.accessToken = Deno.env.get('STRAVA_ACCESS_TOKEN');

	var api = new StravaApiV3.ActivitiesApi()
	return api;
}
