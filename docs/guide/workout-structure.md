# Workout Structure

Understanding how PaperWeight organizes your workout data and how to optimize your handwritten logs for the best digital experience.

## How Workouts Are Structured

### Basic Components

Every workout in PaperWeight consists of:

1. **📅 Date & Time** - When the workout occurred
2. **💪 Exercises** - The movements performed
3. **📊 Sets & Reps** - Volume and intensity data
4. **⚖️ Weight/Resistance** - Load progression tracking
5. **📝 Notes** - Additional context and observations

### Workout Hierarchy

```
Workout Session
├── Exercise 1 (e.g., Squats)
│   ├── Set 1: Weight, Reps, RPE
│   ├── Set 2: Weight, Reps, RPE
│   └── Set 3: Weight, Reps, RPE
├── Exercise 2 (e.g., Bench Press)
│   ├── Set 1: Weight, Reps, RPE
│   └── Set 2: Weight, Reps, RPE
└── Workout Notes
```

## Exercise Organization

### Exercise Database Integration

PaperWeight automatically maps your written exercises to a comprehensive database:

**Primary Categories:**
- **🏋️ Barbell** - Squats, deadlifts, bench press, rows
- **🔩 Dumbbell** - Presses, curls, flies, lunges
- **🤸 Bodyweight** - Push-ups, pull-ups, dips, planks
- **⚙️ Machine** - Cable work, isolation movements
- **🏃 Cardio** - Running, cycling, rowing

**Muscle Group Targeting:**
- **Upper Body**: Chest, back, shoulders, arms
- **Lower Body**: Quads, hamstrings, glutes, calves  
- **Core**: Abs, obliques, lower back
- **Full Body**: Compound movements, functional training

### Exercise Name Recognition

The AI understands various ways you might write exercise names:

```
✅ "Squats" → Back Squat
✅ "BP" → Bench Press
✅ "Pull-ups" → Pull-up
✅ "RDL" → Romanian Deadlift
✅ "OHP" → Overhead Press
✅ "DB Press" → Dumbbell Press
```

## Set and Rep Tracking

### Standard Formats

PaperWeight recognizes multiple notation styles:

**Traditional Format:**
```
Bench Press: 3 sets × 8 reps @ 155 lbs
```

**Shorthand:**
```
BP: 3x8 @ 155
```

**Set-by-Set Breakdown:**
```
Bench Press:
Set 1: 135 × 10 (warm-up)
Set 2: 155 × 8  
Set 3: 155 × 8
```

**Progressive Sets:**
```
Squats: 135×10, 185×8, 225×6, 275×3
```

### Advanced Notations

**RPE (Rate of Perceived Exertion):**
```
Deadlifts: 225 × 5 @ RPE 8
Squats: 3x8 @ 185 (felt easy - RPE 6)
```

**Tempo Training:**
```
Bench Press: 3x8 @ 155 (3-1-2-1 tempo)
Squats: 4x6 @ 185 (slow negatives)
```

**Rest Periods:**
```
Squats: 3x8 @ 185 (2 min rest)
Superset: BP 3x8 / Rows 3x8 (90s between rounds)
```

## Workout Types

### Strength Training Sessions

**Linear Progression:**
```
Week 1: 3x8 @ 155
Week 2: 3x8 @ 160  
Week 3: 3x8 @ 165
Week 4: Test 1RM
```

**Periodized Training:**
```
Block 1 (Volume): 4x10 @ 60%
Block 2 (Intensity): 5x5 @ 80%
Block 3 (Peak): 3x3 @ 90%
```

**Circuit Training:**
```
Round 1: Squats, Push-ups, Rows (3 exercises)
Round 2: Lunges, Dips, Pull-ups
Round 3: Plank, Burpees, Mountain climbers
```

### Cardio Integration

**Standalone Cardio:**
```
Running: 5K in 22:30
Cycling: 45 min @ moderate pace
Rowing: 2000m in 8:45
```

**Cardio Finishers:**
```
Main workout: Strength training
Finisher: 10 min HIIT bike
Cool-down: 5 min walk
```

## Data Relationships

### Progressive Overload Tracking

PaperWeight analyzes your progression across workouts:

**Volume Progression:**
```
Week 1: 3x8 @ 155 = 3,720 lbs total
Week 2: 3x8 @ 160 = 3,840 lbs total (+120 lbs)
Week 3: 3x8 @ 165 = 3,960 lbs total (+240 lbs)
```

**Intensity Progression:**
```
Month 1: Average working weight = 155 lbs
Month 2: Average working weight = 170 lbs (+15 lbs)
Month 3: Average working weight = 185 lbs (+30 lbs)
```

### Exercise Relationships

**Compound vs. Isolation:**
- Track how accessory work supports main lifts
- Monitor muscle group balance
- Identify weak points and imbalances

**Movement Patterns:**
- **Push**: Bench, shoulder press, dips
- **Pull**: Rows, pull-ups, face pulls  
- **Squat**: Back squat, front squat, leg press
- **Hinge**: Deadlift, RDL, good mornings

## Workout Planning Templates

### Sample Workout Structures

**Push/Pull/Legs Split:**
```
Push Day:
- Bench Press: 4x6-8
- Overhead Press: 3x8-10
- Dips: 3x10-12
- Tricep Work: 3x12-15

Pull Day:
- Deadlifts: 4x5-6
- Pull-ups: 4x8-10
- Rows: 3x8-10
- Bicep Work: 3x12-15

Leg Day:
- Squats: 4x6-8
- Romanian Deadlifts: 3x8-10
- Lunges: 3x12 each leg
- Calf Raises: 4x15-20
```

**Upper/Lower Split:**
```
Upper Body:
- Bench Press: 4x6-8
- Rows: 4x6-8
- Overhead Press: 3x8-10
- Pull-ups: 3x8-10
- Arms: 6 sets total

Lower Body:
- Squats: 4x6-8
- Romanian Deadlifts: 3x8-10
- Bulgarian Split Squats: 3x10 each
- Hip Thrusts: 3x12-15
- Calves: 4x15-20
```

## Optimizing Your Handwritten Logs

### Consistent Structure

**Use the same format** for similar workouts:
```
Date: [MM/DD/YY]
Workout Type: [Push/Pull/Legs/Upper/Lower]

Exercise 1:
Set details...

Exercise 2: 
Set details...

Notes: Overall feel, PRs, observations
```

### Clear Exercise Names

**Be consistent** with exercise naming:
- Choose one name and stick with it
- Use common abbreviations consistently
- Avoid mixing different naming conventions

### Logical Flow

**Order exercises logically:**
1. Warm-up movements
2. Main compound lifts
3. Accessory exercises
4. Isolation work
5. Cool-down/stretching

This structure helps the AI understand your workout flow and provides better insights into your training patterns.

## Advanced Features

### Workout Templates

Once PaperWeight learns your routine:
- **Auto-suggest** exercises based on previous sessions
- **Template creation** for recurring workouts
- **Progress tracking** across similar sessions
- **Volume recommendations** based on progression

### Exercise Substitutions

When you write variations:
- **"Close-grip BP"** → Tagged as bench press variation
- **"Sumo DL"** → Tagged as deadlift variation
- **"Incline DB"** → Tagged as chest press variation

This allows for comprehensive movement pattern analysis while respecting your specific exercise choices.

---

Understanding workout structure helps you write more effective logs and get better insights from your digital data. The key is finding a balance between natural logging and structured data that powers meaningful analysis.

Next: [Learn about exercise management →](/guide/exercise-management)