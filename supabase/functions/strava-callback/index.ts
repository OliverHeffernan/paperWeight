import "jsr:@supabase/functions-js/edge-runtime.d.ts";

Deno.serve(async (req: Request) => {
  console.log("Strava callback function called");
  console.log("Request method:", req.method);
  console.log("Request URL:", req.url);
  console.log("Request headers:", Object.fromEntries(req.headers.entries()));

  try {
    const url = new URL(req.url);
    const code = url.searchParams.get("code");
    const state = url.searchParams.get("state");
    const error = url.searchParams.get("error");

    console.log("Strava callback received:", { code: !!code, state, error });
    console.log("All URL params:", Object.fromEntries(url.searchParams.entries()));

    // Handle user denied authorization
    if (error === "access_denied") {
      console.log("User denied access");
      return new Response(null, {
        status: 302,
        headers: {
          "Location": "http://localhost:8080/app/settings?strava_error=denied"
        }
      });
    }

    if (!code) {
      console.log("No authorization code received");
      return new Response(null, {
        status: 302,
        headers: {
          "Location": "http://localhost:8080/app/settings?strava_error=no_code"
        }
      });
    }

    // Check if environment variables are set
    const clientId = Deno.env.get("STRAVA_CLIENT_ID");
    const clientSecret = Deno.env.get("STRAVA_CLIENT_SECRET");
    
    console.log("Environment check:", { 
      clientId: !!clientId, 
      clientSecret: !!clientSecret 
    });

    if (!clientId || !clientSecret) {
      console.error("Missing Strava environment variables");
      return new Response(null, {
        status: 302,
        headers: {
          "Location": "http://localhost:8080/app/settings?strava_error=config_missing"
        }
      });
    }

    // Exchange code for access token
    console.log("Exchanging code for token...");
    const tokenResponse = await fetch("https://www.strava.com/api/v3/oauth/token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code: code,
        grant_type: "authorization_code",
      }),
    });

    console.log("Token response status:", tokenResponse.status);

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error("Token exchange failed:", errorText);
      return new Response(null, {
        status: 302,
        headers: {
          "Location": "http://localhost:8080/app/settings?strava_error=token_failed"
        }
      });
    }

    const tokenData = await tokenResponse.json();
    console.log("Token exchange successful, expires at:", tokenData.expires_at);
    
    // Get athlete info for storing
    console.log("Fetching athlete data...");
    const athleteResponse = await fetch("https://www.strava.com/api/v3/athlete", {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
      },
    });

    console.log("Athlete response status:", athleteResponse.status);

    if (!athleteResponse.ok) {
      const errorText = await athleteResponse.text();
      console.error("Failed to fetch athlete data:", errorText);
      return new Response(null, {
        status: 302,
        headers: {
          "Location": "http://localhost:8080/app/settings?strava_error=athlete_failed"
        }
      });
    }

    const athleteData = await athleteResponse.json();
    console.log("Athlete data received for:", athleteData.firstname, athleteData.lastname, "ID:", athleteData.id);

    // Store the connection data in URL parameters for the frontend to pick up
    const connectionData = {
      strava_access_token: tokenData.access_token,
      strava_refresh_token: tokenData.refresh_token,
      strava_token_expires_at: new Date(tokenData.expires_at * 1000).toISOString(),
      strava_athlete_id: athleteData.id,
      strava_athlete_name: `${athleteData.firstname || ''} ${athleteData.lastname || ''}`.trim() || 'Strava User',
    };

    // Success - redirect to app with success message and connection data
    console.log("Strava connection successful, redirecting...");
    
    // Encode the connection data as base64 to safely pass it via URL
    const encodedData = btoa(JSON.stringify(connectionData));
    
    return new Response(null, {
      status: 302,
      headers: {
        "Location": `http://localhost:8080/app/settings?strava_success=true&data=${encodeURIComponent(encodedData)}`
      }
    });

  } catch (error) {
    console.error("Callback error:", error);
    return new Response(null, {
      status: 302,
      headers: {
        "Location": "http://localhost:8080/app/settings?strava_error=unknown"
      }
    });
  }
});