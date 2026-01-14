# Exercise Management

Learn how to effectively manage your exercise database, track personal records, and organize your training data in PaperWeight.

## Exercise Database Overview

### Comprehensive Exercise Library

PaperWeight includes over 800 exercises across all training modalities:

**By Equipment:**
- 🏋️ **Barbell**: Squats, deadlifts, presses, rows
- 🔩 **Dumbbell**: Unilateral work, isolation movements
- 🤸 **Bodyweight**: Calisthenics, functional movements
- ⚙️ **Cable/Machine**: Guided resistance training
- 🎾 **Other**: Resistance bands, kettlebells, specialty tools

**By Muscle Group:**
- **Chest**: Presses, flies, dips
- **Back**: Rows, pull-ups, pulldowns
- **Shoulders**: Presses, raises, rotations  
- **Arms**: Curls, extensions, compound movements
- **Legs**: Squats, lunges, single-leg work
- **Glutes**: Hip hinges, bridges, lateral work
- **Core**: Planks, rotations, anti-movement

### Smart Exercise Recognition

When you write exercises in your log, PaperWeight intelligently maps them:

**Automatic Mapping:**
```
"squats" → Back Squat
"bench" → Bench Press
"pullups" → Pull-up
"curls" → Bicep Curl
"plank" → Plank
```

**Variation Recognition:**
```
"incline bench" → Incline Bench Press
"goblet squats" → Goblet Squat  
"hammer curls" → Hammer Curl
"side plank" → Side Plank
```

**Abbreviation Understanding:**
```
"BP" → Bench Press
"OHP" → Overhead Press
"RDL" → Romanian Deadlift
"DB" → Dumbbell (when combined with exercise)
```

## Personal Records (PRs)

### Automatic PR Detection

PaperWeight automatically tracks your personal bests:

**1-Rep Max Estimates:**
- Calculates based on your best sets
- Updates when you hit new rep maxes
- Shows progression over time

**Volume Records:**
- Highest total weight moved in a session
- Best single set (weight × reps)
- Most reps at a given weight

**Frequency Milestones:**
- First time performing an exercise
- Consistency streaks
- Return after extended breaks

### PR Tracking Display

**In Workout View:**
```
Bench Press: 185 × 8 🎉 PR!
Previous best: 185 × 6 (2 weeks ago)
Estimated 1RM: 231 lbs (+5 lbs)
```

**In Exercise History:**
```
Bench Press PRs:
• Weight: 225 lbs (1 rep max)
• Volume: 185 × 10 reps  
• Total: 4,650 lbs (3×8@185 + 2×6@195)
```

### Setting Personal Goals

**Progressive Targets:**
- Set weight goals for major lifts
- Target rep ranges for endurance
- Volume goals for overall development
- Consistency goals for habit building

## Exercise Categories and Tags

### Movement Patterns

PaperWeight organizes exercises by fundamental movement patterns:

**Primary Patterns:**
- **🔽 Squat**: Bilateral knee-dominant movements
- **🔄 Hinge**: Hip-dominant posterior chain movements
- **⬆️ Push**: Pressing movements away from body
- **⬇️ Pull**: Drawing movements toward body
- **🚶 Gait**: Single-leg and locomotion patterns
- **🧘 Core**: Anti-movement and stabilization

**Secondary Classifications:**
- **Compound**: Multi-joint movements
- **Isolation**: Single-joint focus
- **Unilateral**: Single-limb training
- **Bilateral**: Both limbs working together

### Custom Exercise Creation

**Adding New Exercises:**

When you write an exercise that's not in the database:

1. **Auto-detection** prompts you to define it
2. **Category selection** from movement patterns
3. **Muscle group targeting** specification
4. **Equipment requirements** notation
5. **Personal notes** for form cues

**Example Custom Exercise:**
```
Exercise: "Deficit Bulgarian Split Squats"
Pattern: Single-leg squat
Primary: Quadriceps, Glutes
Secondary: Core, Balance
Equipment: Dumbbells + Platform
Notes: "Use 4-inch deficit, focus on front leg"
```

### Exercise Variations

**Linking Related Movements:**

PaperWeight understands exercise families:

**Squat Family:**
```
Back Squat (parent)
├── High Bar Back Squat
├── Low Bar Back Squat  
├── Front Squat
├── Goblet Squat
└── Overhead Squat
```

**Bench Press Family:**
```
Bench Press (parent)
├── Incline Bench Press
├── Decline Bench Press
├── Dumbbell Bench Press
├── Close-Grip Bench Press
└── Pause Bench Press
```

This allows you to:
- Track progression across similar movements
- Compare strength ratios between variations
- Substitute exercises while maintaining data continuity

## Workout Program Integration

### Routine Recognition

PaperWeight learns your training patterns:

**Split Detection:**
- Identifies your training split (Push/Pull/Legs, Upper/Lower, etc.)
- Recognizes workout A/B alternations
- Tracks deload and peak weeks

**Exercise Frequency:**
- How often you perform each movement
- Optimal rest periods between sessions
- Volume distribution across workouts

### Exercise Progression Tracking

**Linear Progression:**
```
Week 1: Squats 3×8 @ 185 lbs
Week 2: Squats 3×8 @ 190 lbs (+5 lbs)
Week 3: Squats 3×8 @ 195 lbs (+10 lbs)
Progression Rate: +5 lbs/week
```

**Periodized Training:**
```
Block 1 (Volume): 4×10 @ 60% 1RM
Block 2 (Intensity): 5×5 @ 80% 1RM  
Block 3 (Peak): 3×3 @ 90% 1RM
```

**Auto-deload Detection:**
```
Notice: Volume decreased 40% this week
Suggestion: This appears to be a deload week
Continue pattern or adjust targets?
```

## Exercise Analytics

### Performance Metrics

**Strength Trends:**
- 1RM progression over time
- Volume progression (sets × reps × weight)
- Frequency and consistency patterns
- Relative strength ratios

**Muscle Group Balance:**
- Push vs. Pull volume ratios
- Bilateral vs. Unilateral training balance
- Upper vs. Lower body distribution
- Compound vs. Isolation emphasis

### Visualization Tools

**Progress Charts:**
- Weight progression over time
- Volume accumulation graphs
- Frequency heatmaps
- PR timeline displays

**Comparative Analysis:**
- Exercise performance correlations
- Strength ratio maintenance
- Training balance indicators
- Weakness identification tools

## Best Practices

### Effective Exercise Logging

**Consistency Tips:**
1. **Use the same names** for exercises across sessions
2. **Be specific** about variations (incline vs. flat)
3. **Include relevant details** (tempo, pause, etc.)
4. **Note equipment changes** (barbell to dumbbell)

**Progress Optimization:**
1. **Track all working sets**, not just top sets
2. **Include warm-up progression** for context
3. **Note RPE or effort level** when helpful
4. **Record form cues** that help performance

### Long-term Data Management

**Exercise Evolution:**
- **Equipment changes**: Barbell → Dumbbell → Machine
- **Range of motion**: Full → Partial → Deficit
- **Assistance work**: Adding chains, bands, pause reps
- **Injury accommodations**: Modified ranges or angles

**Data Continuity:**
- Link related exercises to maintain progression history
- Note significant form or equipment changes
- Archive exercises you no longer perform
- Tag temporary modifications (injury, equipment unavailable)

## Troubleshooting Exercise Recognition

### Common Recognition Issues

**Exercise Not Found:**
- Check spelling and common abbreviations
- Try writing the full exercise name
- Use standard terminology when possible
- Add new exercises through the app interface

**Wrong Exercise Mapped:**
- Edit the exercise name post-upload
- Train the AI with corrections
- Use more specific naming (e.g., "Incline DB Press" vs. "DB Press")

**Inconsistent Tracking:**
- Standardize your exercise naming conventions
- Create a personal abbreviation guide
- Review and clean up historical data periodically

---

Effective exercise management is key to getting meaningful insights from your training data. By understanding how PaperWeight organizes and tracks exercises, you can optimize your logging for better progression analysis and goal achievement.

The goal is to maintain the natural flow of handwritten logging while building a comprehensive digital training history that helps you train smarter and more effectively.

Ready to explore your exercise data? Check out the **💪 Exercises** section in the app!