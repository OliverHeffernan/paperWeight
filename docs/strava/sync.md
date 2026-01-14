# Data Synchronization

Understanding how PaperWeight synchronizes data with Strava helps you get the most out of the integration and troubleshoot any issues.

## Sync Process Overview

PaperWeight uses a sophisticated matching algorithm to connect your handwritten workouts with Strava activities, ensuring accurate data correlation while respecting both platforms' data integrity.

### Automatic Sync Triggers

Synchronization happens automatically in these scenarios:

1. **After workout upload** - When you upload a new workout photo
2. **On app startup** - Checks for new activities since last sync
3. **Manual trigger** - When you click "Sync Workouts" in Settings
4. **Periodic background** - Daily check for missed activities

### Sync Direction

Data flows in both directions:

**PaperWeight → Strava**
- Creates "Weight Training" activities when none exist
- Adds detailed exercise data to activity descriptions
- Uploads workout photos as activity images

**Strava → PaperWeight**  
- Imports heart rate data and zones
- Adds energy expenditure (kilojoules)
- Enriches with environmental data (temperature, location)

## Activity Matching Algorithm

### Time-Based Correlation

PaperWeight uses a smart matching system:

```
Workout Time: 10:00 AM
Search Window: 9:45 AM - 10:15 AM

Strava Activities Found:
- 9:50 AM: Weight Training (15 min) ✅ Best Match
- 10:05 AM: Yoga (30 min) ✅ Backup Match
- 10:30 AM: Running (45 min) ❌ Outside window
```

### Matching Priority

1. **Exact activity type**: "Weight Training" activities get priority
2. **Closest start time**: Activities starting nearest to workout time
3. **Reasonable duration**: Activities lasting 15-120 minutes
4. **Manual activities**: User-created activities over auto-recorded

### Conflict Resolution

When multiple activities match:
- **Best fit algorithm** considers time + type + duration
- **User confirmation** for ambiguous matches
- **Manual override** option in workout settings

## Data Enhancement Process

### Heart Rate Integration

When a Strava activity includes heart rate data:

```json
{
  "average_heartrate": 142,
  "max_heartrate": 165,
  "heartrate_zones": {
    "zone1": "12 minutes",
    "zone2": "18 minutes", 
    "zone3": "8 minutes"
  }
}
```

This enriches your workout with:
- 💓 **Training intensity** indicators
- 📊 **Zone distribution** charts
- 🔥 **Effort level** calculations
- 📈 **Recovery insights** between sessions

### Energy Expenditure

Strava's energy calculations provide:
- **Kilojoules burned** during the workout
- **Calorie estimates** based on effort and body weight
- **Training load** contribution to weekly totals
- **Efficiency metrics** (energy per set/rep)

### Environmental Context

Additional Strava data enhances your records:
- 🌡️ **Temperature** and weather conditions
- 📍 **Gym location** (if GPS enabled)
- 🕐 **Precise timing** down to the second
- 💨 **Perceived exertion** if logged in Strava

## Sync Status & Monitoring

### Real-Time Feedback

During sync, you'll see:
- **Progress indicators** for each workout being processed
- **Match confirmation** for successful correlations
- **Error messages** for failed attempts
- **Summary statistics** of sync results

### Sync History

Track synchronization in Settings:
- **Last sync time** and duration
- **Processed workout count** in latest sync  
- **Error log** for troubleshooting
- **Manual sync** button for immediate updates

## Handling Edge Cases

### Missing Activities

When no Strava activity matches a workout:

**Automatic Solutions:**
- 📱 PaperWeight can create a new Strava activity
- 📝 Adds detailed exercise breakdown to description
- 🏋️ Tags as "Weight Training" for proper categorization

**Manual Options:**
- Link to an existing activity later
- Skip linking for this workout
- Create activity with custom details

### Overlapping Activities

For workouts spanning multiple Strava activities:

```
Workout: 10:00 AM - 11:30 AM (90 min)
Strava Activities:
- 10:00 AM: Weight Training (45 min)
- 10:50 AM: Cardio Cool-down (20 min)
```

**Resolution:**
- Links to primary activity (Weight Training)
- Combines metrics from both activities
- User can manually adjust linkage

### Data Conflicts

When Strava and PaperWeight data disagree:

**Duration Conflicts:**
- Uses PaperWeight timing as primary
- Notes Strava duration as "activity duration"

**Date Conflicts:**  
- Preserves workout date from handwritten log
- Links to closest Strava activity by time

## Performance Optimization

### Rate Limiting

PaperWeight respects Strava's API limits:
- **15-minute request windows** with smart queuing
- **Batch processing** for multiple workouts
- **Exponential backoff** for temporary errors
- **Priority queuing** for recent workouts

### Incremental Sync

Efficient sync strategies:
- **Delta sync** - only new/modified data
- **Checkpoint system** - resume from interruptions
- **Background processing** - no UI blocking
- **Cache optimization** - reduce redundant API calls

## Troubleshooting Sync Issues

### Common Problems

**❌ Workout not linking to Strava activity**
- Check activity timing (within 15-minute window)
- Verify activity privacy settings in Strava
- Ensure activity type is compatible

**❌ Missing heart rate data**
- Confirm you wore a heart rate monitor
- Check device connection in Strava activity
- Verify data sharing permissions

**❌ Sync taking too long**
- Large workout history takes time on first sync
- Background sync continues if you close the app
- Check internet connection stability

### Advanced Troubleshooting

**Force Re-sync:**
1. Go to Settings → Strava Integration
2. Click "Advanced" → "Force Full Sync"
3. Confirms re-processing all historical data

**Clear Sync Cache:**
1. Settings → Advanced → Clear Strava Cache
2. Removes temporary sync data
3. Next sync will be fresh start

**Check Sync Logs:**
1. Settings → Advanced → View Sync Logs
2. Shows detailed sync attempt information
3. Helpful for reporting issues

## Data Privacy During Sync

### Secure Processing
- **Encrypted API calls** using OAuth 2.0
- **Temporary data storage** during processing only
- **No caching** of sensitive Strava data
- **Automatic token refresh** without password storage

### User Control
- **Granular permissions** - choose what to sync
- **Immediate disconnect** - stop sync anytime
- **Data deletion** - removes all linked data
- **Sync audit trail** - see what was accessed

---

## Sync Best Practices

1. **Consistent timing** - Start Strava recording before your workout
2. **Activity naming** - Use descriptive names for easy matching
3. **Regular sync** - Don't wait weeks between syncs
4. **Monitor data** - Check sync results occasionally
5. **Privacy settings** - Configure Strava sharing preferences

Understanding sync helps you maximize the value of connected data while maintaining control over your fitness information.