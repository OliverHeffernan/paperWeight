# PaperWeight - Strava Developer Application Description

## Application Overview
PaperWeight is a workout tracking application that bridges the gap between analog and digital workout logging. Users write their workouts by hand on paper logs, then photograph these logs using our mobile app. The application converts these handwritten workout logs into digital format for analysis and progress tracking.

## AI Usage and Data Handling

### How AI is Used in Our Application
Our application uses OpenAI's vision models (currently GPT-5 mini) exclusively for **Optical Character Recognition (OCR)** and **handwriting interpretation** of workout log images. The AI processes images of handwritten workout logs to extract structured workout data including:
- Exercise names and types
- Set and rep counts
- Weights used
- Workout timestamps
- Personal notes

### Critical Data Separation: Strava Data NEVER Sent to AI
**We want to emphasize that Strava API data is completely isolated from our AI processing pipeline.** Here's how our system maintains this separation:

1. **Image Processing Flow**: Users photograph their handwritten workout logs → Images sent to OpenAI for OCR → Structured workout data returned
2. **Strava Integration Flow**: Workout timestamps from OCR'd data → Search Strava activities within time window → Match activities → Retrieve heart rate data
3. **No Cross-Contamination**: The AI only sees images of paper workout logs. Strava data (activities, heart rate streams, athlete information) is never included in any requests to OpenAI or any other AI service.

## Strava API Integration Details

### Purpose of Strava Integration
Our Strava integration serves to **enhance** the workout data extracted from handwritten logs by:
- Automatically matching paperWeight workouts with corresponding Strava activities based on workout timestamps
- Enriching workout records with heart rate data and expenditure (kilojoules/calories)
- Providing users a unified view of their analog workout logs with digital biometric data

### Specific Strava Data Usage
We access and store the following Strava data:
- **Athlete profile information**: Name and athlete ID for connection identification
- **Activity data**: Activity timestamps, type, heart rate averages, and expenditure
- **Heart rate streams**: Detailed heart rate data throughout activities for enhanced analysis
- **OAuth tokens**: Access and refresh tokens for maintaining connection (stored securely in our database)

### Technical Implementation
- **OAuth Flow**: We implement the standard Strava OAuth 2.0 flow using the official "Connect with Strava" button and branding as specified in Strava's brand guidelines
- **Data Storage**: Strava tokens are stored encrypted in our Supabase database with proper Row Level Security (RLS)
- **Token Management**: We properly handle token refresh to maintain long-term connections
- **Activity Matching**: We search for Strava activities within a 15-minute buffer around workout timestamps, prioritizing "WeightTraining" activity types

## API Terms of Service Compliance

### Data Usage Restrictions
We strictly comply with Strava's API terms regarding AI and machine learning:
- **No AI Training**: Strava data is NEVER used to train AI models, improve AI algorithms, or sent to any AI service providers
- **No Data Aggregation**: We do not aggregate Strava data across users or use it for analytics beyond individual user workout enhancement
- **Purpose Limitation**: Strava data is used exclusively for enhancing individual user workout records with biometric data

### Data Access and Sharing
- **User Control**: Users explicitly consent to connect their Strava accounts through our settings interface
- **No Third-Party Access**: Strava data is not shared with any third parties, platforms, or external tools
- **Data Isolation**: Our application architecture ensures Strava data remains completely separate from AI processing workflows
- **User Privacy**: Users can disconnect their Strava accounts at any time, which removes all Strava data from their workout records

### Technical Safeguards
- **Secure Storage**: All Strava tokens and data are stored with encryption and access controls
- **Minimal Data**: We only request and store the minimum Strava data necessary for workout enhancement
- **Automatic Cleanup**: When users disconnect Strava, all associated data is automatically purged from their workout records

## Third-Party Platforms and Data Access

### OpenAI Integration
- **Data Sent**: Only base64-encoded images of handwritten workout logs
- **Data NOT Sent**: No Strava data, no user personal information beyond what's visible in workout photos
- **Purpose**: Exclusively for OCR and handwriting recognition

### Supabase Backend
- **Role**: Database and authentication provider
- **Data Access**: Stores workout data, user profiles, and Strava tokens with proper security measures
- **Security**: Implements Row Level Security (RLS) ensuring users can only access their own data

### No Other Third Parties
- No other external platforms, tools, or services have access to user data
- No analytics services receive Strava data
- No AI training companies receive any user data

## Data Flow Summary
1. User writes workout on paper
2. User photographs workout log with our app
3. Image sent to OpenAI for OCR processing (no Strava data included)
4. OCR results stored in our database
5. Separately, we search user's Strava activities to find matching workouts
6. We retrieve heart rate data from matched Strava activities
7. This biometric data enhances the workout record in our database
8. User sees combined view: their parsed workout data + Strava biometrics

This architecture ensures complete separation between AI processing and Strava data, while providing users with the comprehensive workout tracking experience they expect.

## Official Strava Branding Compliance
Our application uses the official "Connect with Strava" button design and follows all Strava branding guidelines as specified in the API documentation.
