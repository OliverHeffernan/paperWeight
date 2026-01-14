# Strava Integration Setup

Connect your PaperWeight account to Strava and start enriching your strength training data with heart rate, energy expenditure, and complete activity tracking.

## Prerequisites

Before starting, make sure you have:

- ✅ A PaperWeight account (create one at the app)
- ✅ An active Strava account
- ✅ At least one workout logged in PaperWeight

## Step 1: Navigate to Settings

1. Open the PaperWeight app
2. Tap the **⚙️ Settings** icon in the top-right corner
3. Scroll to the **"Strava Integration"** section

## Step 2: Connect Your Account

### Initiate Connection

1. Click the **"Connect to Strava"** button
2. You'll be redirected to Strava's authorization page
3. **Log in** to your Strava account if prompted

### Authorize PaperWeight

On the Strava authorization page, you'll see:

```
PaperWeight would like to:
✅ View your activities and segments
✅ View your detailed activity information 
✅ Upload activities on your behalf
```

**What this means:**
- **View activities**: To match workouts with Strava activities
- **Detailed information**: To get heart rate and energy data
- **Upload activities**: To create strength training activities in Strava

### Grant Permission

1. **Click "Authorize"** to grant permission
2. You'll be redirected back to PaperWeight
3. See a success message confirming the connection

## Step 3: Verify Connection

After successful authorization:

1. **Connection status** should show "Connected as: [Your Strava Name]"
2. **New options** will appear:
   - 🔄 **Sync Workouts** button
   - 🔗 **Disconnect** button
3. **Settings page** will show your Strava athlete information

## Step 4: Initial Sync

### Sync Your Workouts

1. Click the **"Sync Workouts"** button
2. Watch the sync progress indicator
3. Wait for **"Sync completed"** message

Or you can sync individual workouts manually.

### What Gets Synced

During initial sync, PaperWeight will:

- 🔍 **Scan your workout history** for unlinked activities
- 🕐 **Search Strava activities** within 15 minutes of each workout
- 📊 **Match activities** based on timing and type
- 💓 **Import heart rate data** when available
- ⚡ **Add energy expenditure** (kilojoules/calories)

## Step 5: Verify Data

### Check Enhanced Workouts

1. Navigate to **📊 Stats** or **🏠 Home**
2. Open a recent workout
3. Look for new data fields:
   - **Heart rate zones** (if you wore a HR monitor)
   - **Energy expenditure** in kilojoules
   - **Linked Strava activity** indicator

### Review Analytics

Enhanced analytics now include:
- Combined cardio + strength training load
- Recovery metrics between sessions
- Heart rate trends during strength training
- Comprehensive activity timeline

## Troubleshooting

### Common Issues

**❌ "Connection failed" error**
- Check your internet connection
- Try clearing browser cache

**❌ "No activities found" after sync**
- Verify you have activities in Strava within the last 30 days
- Check that workout times align with Strava activity times
- Ensure activities aren't private in Strava

**❌ "Authorization expired" message**
- Click **"Connect to Strava"** again to refresh authorization
- This happens automatically but can be done manually

### Getting Help

If you continue to experience issues:

1. **Check Strava status** at status.strava.com
2. **Verify permissions** in your [Strava privacy settings](https://www.strava.com/settings/privacy)
3. **Contact support** through the PaperWeight app

## Privacy & Security

### What We Access
- **Activity data**: Start time, duration, type, and basic metrics
- **Profile info**: Name and athlete ID for account linking
- **Heart rate**: When available and recorded during activities

### What We Don't Access
- ❌ Personal messages or comments
- ❌ Location data
- ❌ Social connections or follower information

### Data Storage
- **Secure encryption** for all stored tokens
- **Automatic token refresh** without storing passwords
- **User-controlled deletion** - disconnect anytime

## Advanced Configuration

### Manual Activity Linking

If automatic matching missed some activities:

1. Go to the workout in PaperWeight
2. Click **"Sync with Strava"**
3. Select from a list of recent activities
4. Confirm the connection

## Next Steps

Now that you're connected:

- 📊 [Explore enhanced analytics](/guide/features#comprehensive-analytics)
- 🔄 [Learn about data synchronization](/strava/sync)
- 🏃‍♀️ Start your next workout and see the magic happen!

---

<div class="tip custom-block" style="padding-top: 8px">

**🎉 Success!** Your PaperWeight workouts are now enhanced with Strava data. Every future workout will automatically sync for a complete fitness picture.

</div>
