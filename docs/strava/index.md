# Strava Integration

PaperWeight's Strava integration creates a complete picture of your fitness journey by combining strength training data with cardiovascular activities, heart rate monitoring, and energy expenditure tracking.

## Why Integrate with Strava?

### Complete Fitness Picture
Strength training is just one part of your fitness journey. By connecting to Strava, PaperWeight can:

- **Correlate strength gains** with cardiovascular fitness
- **Track recovery** between training sessions
- **Monitor overall training load** across all activities
- **Provide holistic health insights** combining multiple data sources

### Enhanced Workout Data
When your paperWeight workouts sync with Strava activities, you get:

- ❤️ **Heart rate data** during strength training sessions
- ⚡ **Energy expenditure** calculations (kilojoules/calories)
- 📊 **Training zones** and intensity metrics
- 🕐 **Precise timing** and duration tracking

## How It Works

### Automatic Activity Matching
PaperWeight intelligently matches your strength training sessions with Strava activities:

1. **Time-based correlation** - finds Strava activities within 15 minutes of your logged workout
2. **Activity type prioritization** - prefers "Weight Training" activities but adapts to any type
3. **Smart matching** - selects the best fit based on start time and duration
4. **Manual override** - you can manually link activities if needed

### Data Enrichment Process
Once connected:
- Your handwritten workouts remain the primary data source
- Strava provides supplementary metrics (HR, energy)
- Combined data appears in your analytics dashboard
- Historical data can be backfilled

## Strava Developer Program Compliance

PaperWeight's integration is designed to meet all Strava Developer Program requirements:

### Data Usage
- **Respectful API usage** with proper rate limiting
- **User-centric design** - data serves the user, not advertising
- **Transparency** - clear explanation of what data is accessed
- **User control** - easy connection/disconnection at any time

### Privacy Protection
- **Minimal data collection** - only what's needed for functionality
- **Secure token storage** with automatic refresh handling
- **No data selling** or third-party sharing
- **User deletion** respected for all connected data

### Terms Compliance
- **Proper attribution** to Strava in all interfaces
- **Brand guidelines** followed for Strava logo usage
- **API terms** strictly adhered to
- **Review-ready** implementation meeting all guidelines

## Value for Athletes

### Training Insights
- **Recovery monitoring** - see how strength training affects your cardio
- **Overtraining prevention** - combined load across all activities
- **Performance correlation** - understand how different training affects strength
- **Periodization support** - plan training blocks across multiple disciplines

### Social Features
- **Strava timeline** shows your complete training story
- **Community engagement** with proper strength training documentation
- **Achievement sharing** for personal records and milestones
- **Training buddies** can see your complete fitness picture

## Technical Implementation

### OAuth 2.0 Flow
- **Secure authentication** using Strava's standard OAuth process
- **Scoped permissions** requesting only necessary data access
- **Token refresh** automatic handling of expired tokens
- **Graceful degradation** when Strava is unavailable

### Real-time Synchronization
- **Event-driven updates** when new activities are created
- **Webhook support** for immediate data consistency
- **Conflict resolution** for overlapping time periods
- **Error handling** with user-friendly feedback

## Getting Started

Ready to enhance your workout tracking with Strava? Check out our [Setup Guide](/strava/setup) for step-by-step instructions.

### Quick Setup
1. **Navigate to Settings** in PaperWeight
2. **Click "Connect to Strava"**
3. **Authorize the integration** on Strava
4. **Sync your workouts** to enrich with Strava data

### What You'll See
After connecting:
- The option to sync new workouts with Strava
    - After syncing, you will see your heart rate charted throughout the workout.
- Enhanced analytics combining all training data
- Complete activity timeline in Strava

---

<div class="tip custom-block" style="padding-top: 8px">

**🚀 Pro Tip**: Connect early to start building a comprehensive fitness dataset. Historical workouts can be backfilled with Strava data!

</div>

## Learn More

- 📋 [Setup Guide](/strava/setup) - Step-by-step connection process
- 🔄 [Data Synchronization](/strava/sync) - Understanding how data flows
