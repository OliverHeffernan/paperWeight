# Strava Integration Setup Guide

## Overview
This integration allows paperWeight users to connect their Strava accounts and automatically match their workout data with Strava activities. The system can pull heart rate data, energy (kilojoules), and other metrics from Strava to enhance workout tracking.

## Setup Requirements

### 1. Strava API Application
1. Go to [Strava API Settings](https://www.strava.com/settings/api)
2. Create a new application
3. Set the Authorization Callback Domain to: `gkyqqlkxpfskmtryfmyp.supabase.co`
4. Note down your Client ID and Client Secret

### 2. Environment Variables
Add these to your Supabase edge functions environment:

**In Supabase Dashboard → Edge Functions → Environment Variables:**
- `STRAVA_CLIENT_ID`: Your Strava application's Client ID
- `STRAVA_CLIENT_SECRET`: Your Strava application's Client Secret

**In your frontend .env file:**
- `VITE_STRAVA_CLIENT_ID`: Your Strava application's Client ID (same as above, but prefixed with VITE_ for frontend access)

### 3. Database Schema
You need these columns in your `profiles` table:
```sql
ALTER TABLE profiles ADD COLUMN strava_access_token text;
ALTER TABLE profiles ADD COLUMN strava_refresh_token text;
ALTER TABLE profiles ADD COLUMN strava_token_expires_at timestamp with time zone;
ALTER TABLE profiles ADD COLUMN strava_athlete_id bigint;
ALTER TABLE profiles ADD COLUMN strava_athlete_name text;
```

And in your `workouts` table:
```sql
ALTER TABLE workouts ADD COLUMN linked_strava_id bigint;
ALTER TABLE workouts ADD COLUMN heart_rate integer;
ALTER TABLE workouts ADD COLUMN energy integer;
```

### 4. Deploy Edge Functions
Deploy the edge functions to Supabase:
```bash
supabase functions deploy strava-callback
supabase functions deploy fetchStrava
```

## How It Works

### 1. OAuth Flow
1. User clicks "Connect to Strava" in Settings
2. User is redirected to Strava for authorization
3. After approval, Strava redirects to the `strava-callback` edge function
4. The callback function exchanges the authorization code for access tokens
5. Connection data is temporarily stored in localStorage and passed to the frontend
6. The frontend saves the connection data to the user's profile via RLS-protected database operations
7. User sees success/error message in Settings

### 2. Activity Matching
1. User can manually trigger sync from Settings page, or it can be called programmatically
2. The `fetchStrava` function looks for workouts without linked Strava activities
3. For each workout, it searches Strava activities within a 15-minute buffer around the workout time
4. It prioritizes "WeightTraining" activities but falls back to any activity type
5. Best match is selected based on closest start time to the workout
6. Heart rate and energy data are pulled from Strava and saved to the workout

### 3. Automatic Token Refresh
The system automatically refreshes expired Strava tokens using the refresh token when needed.

## API Endpoints

### POST `/functions/v1/fetchStrava`
Syncs workouts with Strava activities.

**Request:**
```json
{
  "workout_id": "optional_specific_workout_id"
}
```

**Response:**
```json
{
  "message": "Strava sync completed",
  "processedCount": 3,
  "totalUnlinked": 5
}
```

### GET `/functions/v1/strava-callback`
OAuth callback endpoint (called by Strava, not directly by the app).

## Frontend Integration

### Settings Page Features
- Shows connection status (connected/disconnected)
- Connect to Strava button
- Manual sync button when connected
- Disconnect functionality
- Status messages and error handling

### TopBar Navigation
- Settings gear icon in the top bar navigates to Settings page

## Security Notes

1. **Client ID Exposure**: The Strava Client ID is exposed in the frontend code, which is normal and expected for OAuth flows.

2. **Token Storage**: Access tokens are stored in the database. In production, consider encrypting these tokens.

3. **User Identification**: This implementation uses localStorage to temporarily transfer connection data from the OAuth callback to the authenticated frontend session. This avoids complex user session tracking during the OAuth flow.

4. **CORS and Redirects**: Currently set up for localhost testing. Update redirect URLs for production deployment.

## Development Testing

1. Ensure your local frontend is running on `http://localhost:8080`
2. Set up the Strava application with the callback URL pointing to your Supabase edge function
3. Add all required environment variables (you don't need SUPABASE_SERVICE_ROLE_KEY for this simplified approach)
4. Test the OAuth flow by clicking "Connect to Strava" in Settings

## Production Deployment

1. Update the redirect URLs in both the Strava app settings and the edge functions to use your production domain
2. Ensure all environment variables are set in production
3. Test the complete flow in production environment

## Troubleshooting

### Common Issues

1. **"Missing authorization header" error**: This was resolved by simplifying the callback approach to use localStorage instead of requiring service role key access.

2. **Connection not saving**: Make sure the user has a profile row in the `profiles` table with the correct user ID.

3. **OAuth redirect issues**: Ensure the callback URL in your Strava app settings matches exactly what's in the edge function.