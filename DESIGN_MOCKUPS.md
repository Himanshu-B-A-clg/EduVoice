# EduVoice UI Mockups 🎨

This document describes the 4 key UI mockups for EduVoice's microphone-aware reading interface.

---

## Mockup 1: Reader - Listening State 🎤

**Filename**: `mockup-1-reader-listening.html`
**Purpose**: Show the reader interface while actively listening to user's speech

### Visual Elements

#### Top Bar
- **Left**: "Reading Practice" title + passage name ("The Curious Cat")
- **Right Controls**:
  - Zoom Out button (-)
  - Zoom In button (+)
  - **Active Microphone** (green, pulsing animation)
  - Help button (?)

#### Status Cards (3-column grid)
1. **Microphone Status**
   - Icon: Animated microphone with pulse rings
   - Text: "Listening" (green)
   - Live waveform visualization (5 animated bars)
   - "Permission granted" indicator

2. **WPM Counter**
   - Large number: "82"
   - Label: "Words Per Minute"
   - Trend arrow

3. **Assists Counter**
   - Large number: "3"
   - Label: "Assists Used"
   - Yellow/accent color

#### Reading Passage
- **Large text** (adjustable size: 24-32px)
- **Dyslexia-friendly font** (OpenDyslexic)
- **Wide line spacing** (1.8-2.0)
- **Neutral background** (off-white: #FAFAFA)
- Words are spaced widely for easy tracking
- **Live highlight**: Currently spoken word has subtle yellow background

#### Live Transcript Bar (bottom)
- Light blue background
- Shows: "The small cat was very curious..."
- Updates in real-time as user speaks

#### Design Notes
- **Color**: Pastel palette—calm blues, soft yellows, gentle greens
- **Animations**: 
  - Microphone pulses every 2 seconds
  - Waveform bars animate up/down
  - Live word highlight fades in/out smoothly
- **Mobile**: Stack cards vertically, larger touch targets

---

## Mockup 2: Reader - Assist Popover 💡

**Filename**: `mockup-2-assist-popover.html`
**Purpose**: Show the assistance interface when difficulty is detected

### Visual Elements

#### Background
- Reading passage (slightly dimmed with overlay)
- **Problem word** highlighted in red with pulsing border: "magnificent"

#### Assist Popover (Center Modal)
- **Header**:
  - Icon: Sparkle/magic wand (yellow)
  - Title: "Let's help with this word"
  - Subtitle: "hesitation detected" (small, gray)
  - Close button (X, top-right)

- **Difficult Word Card** (red background):
  - Label: "Difficult word:"
  - Word: **"magnificent"** (large, bold)

- **Simplified Alternative** (green background):
  - Label: "Try this instead:"
  - Word: **"amazing"** (large, bold)

- **Explanation Section**:
  - Icon: Book icon
  - Heading: "What it means:"
  - Text: "Something very beautiful or impressive." (simple, 16px)

- **Example Sentence** (purple accent, bordered):
  - Label: "Example:"
  - Text: *"The sunset was amazing."* (italic)

- **Action Buttons** (bottom, 2 columns):
  - **"Hear It"** (primary blue, speaker icon):
    - Animated: pulse if TTS is playing
  - **"Got It!"** (success green, checkmark)

#### Animations
- Popover slides up from bottom with elastic bounce
- Problem word pulses 3 times then stops
- "Hear It" button icon animates when TTS active
- Word-by-word highlight during TTS playback

#### Design Notes
- **Rounded corners**: 24px (very friendly)
- **Shadow**: Large, soft shadow for depth
- **Contrast**: High contrast text for readability
- **Motion**: Can be disabled via "reduce motion" setting

---

## Mockup 3: Self Dashboard - Session Timeline 📊

**Filename**: `mockup-3-self-dashboard.html`
**Purpose**: Show user's progress overview with session timeline

### Visual Elements

#### Welcome Header
- Title: "Welcome back, Alex! 👋"
- Subtitle: "Let's continue your reading journey"

#### Quick Actions (2 large cards, side-by-side)
1. **Start Reading** (gradient blue):
   - Icon: Book (large)
   - Arrow icon (right)
   - Text: "Begin a new practice session with microphone assistance"

2. **View Progress** (gradient purple):
   - Icon: Bar chart
   - Arrow icon (right)
   - Text: "See detailed reports and track your improvement"

#### Stats Grid (4 columns)
1. **Avg WPM**: 82 (with trending up icon)
2. **Accuracy**: 94% (with target icon)
3. **Assists**: 3 (with microphone icon)
4. **Sessions**: 3 (with clock icon)

#### Recent Sessions List
- **Heading**: "Recent Sessions" + "View All" link
- **Session Cards** (3 shown):
  1. **Nov 26** | 15 min • 245 words | **82 WPM** | 94% accuracy | *3 assists*
  2. **Nov 25** | 12 min • 198 words | **78 WPM** | 91% accuracy | *5 assists*
  3. **Nov 24** | 18 min • 312 words | **85 WPM** | 96% accuracy | *2 assists*
  
  Each card has:
  - Calendar icon (left)
  - Date prominently displayed
  - Metrics in compact layout
  - Assist count in yellow badge

#### Achievements Section
- **Heading**: "Achievements" with trophy icon
- **Achievement Cards** (2x2 grid):
  1. ✅ **First Steps** - "Completed your first reading session" (earned, golden)
  2. ✅ **Speed Reader** - "Read at 80+ WPM" (earned, golden)
  3. ⬜ **Persistent** - "Complete 5 sessions" (locked, grayed)
  4. ✅ **Perfectionist** - "Achieve 95% accuracy" (earned, golden)

#### Design Notes
- **Gradient backgrounds** for action cards
- **Micro-animations** on hover (scale 1.02)
- **Color coding**: Blue (WPM), Green (Accuracy), Yellow (Assists)
- **White cards** with subtle shadows for content

---

## Mockup 4: Parent Dashboard - Child Progress 👨‍👩‍👧‍👦

**Filename**: `mockup-4-parent-dashboard.html`
**Purpose**: Show parent's view of multiple children's reading progress

### Visual Elements

#### Header
- Icon: Users/family icon (large, purple)
- Title: "Parent Dashboard"
- Subtitle: "Monitor your children's reading progress"

#### Children Cards (3-column grid, 2 shown + Add button)

**Child Card 1: Emma** (selected, highlighted border):
- Name: **Emma** (large)
- Info: Age 9 • Grade 3
- Mini Stats Grid (2x2):
  - **65** Avg WPM
  - **89%** Accuracy
  - **16** Assists
  - **2** Sessions

**Child Card 2: Lucas**:
- Name: **Lucas** (large)
- Info: Age 11 • Grade 5
- Mini Stats Grid (2x2):
  - **88** Avg WPM
  - **94%** Accuracy
  - **7** Assists
  - **2** Sessions

**Add Child Card** (dashed border):
- Large + icon
- Text: "Add Child"
- Hover: border changes to purple

#### Selected Child Details (Emma)

**Header Bar**:
- Title: "Emma's Progress"
- **Download Report** button (PDF icon)

**Sessions Accordion**:

**Session 1 - Expanded** (Nov 26, Monday, November 26):
- **Summary Bar** (clickable):
  - Calendar icon
  - Date
  - Quick stats: "65 WPM • 89% accuracy • 7 assists"
  - Chevron (down when expanded)

- **Expanded Content**:
  - **Stats Cards** (4 columns):
    1. 65 WPM (blue, trend icon)
    2. 89% Accuracy (green)
    3. 7 Assists (yellow, mic icon)
    4. 12m Duration (purple, clock icon)
  
  - **Problem Words**:
    - Heading: "Words That Needed Help:"
    - Badges: `magnificent` `enormous` `ancient` (red background)

**Session 2 - Collapsed** (Nov 25):
- Summary bar only
- Chevron up

#### Assist Heatmap (Timeline Visualization)
- Horizontal timeline showing session duration
- Dots/markers at timestamps where assists occurred
- Color-coded by type:
  - 🟡 Hesitation
  - 🟠 Repeat
  - 🔵 Manual help
  - 🟣 Low confidence
  - 🔴 Mismatch

#### Design Notes
- **Purple/calm theme** for parent features (distinct from child blue)
- **Card-based design** for easy scanning
- **Expandable sections** to reduce clutter
- **Hover effects** on child cards
- **Clear visual hierarchy**: Child selection → Session details
- **PDF download** prominent but not intrusive

---

## Design System Summary

### Color Palette
```css
Primary (Blue):   #0ea5e9 - Actions, links, primary buttons
Accent (Yellow):  #fbbf24 - Highlights, assists, attention
Success (Green):  #10b981 - Positive metrics, achievements
Calm (Purple):    #c084fc - Parent features, secondary actions
Error (Red):      #ef4444 - Problem indicators, difficulty
Gray (Neutral):   #6b7280 - Text, borders, backgrounds
```

### Typography
- **Headings**: 24-48px, bold, tight letter-spacing
- **Body**: 16-20px, OpenDyslexic or Verdana
- **Reading Text**: 24-32px (adjustable), wide spacing
- **Labels**: 12-14px, medium weight

### Spacing
- **Card Padding**: 24-32px
- **Grid Gaps**: 16-24px
- **Section Margins**: 32-48px
- **Line Height**: 1.8-2.0 for reading text

### Animations
- **Durations**: 200-400ms (interactions), 800-1500ms (attention)
- **Easing**: cubic-bezier for natural motion, spring for playful effects
- **Reduce Motion**: All animations disabled if user preference set

### Accessibility
- **Minimum Touch Target**: 44x44px
- **Focus Indicators**: 4px outline, offset 2px
- **Contrast Ratios**: Minimum 4.5:1 for text, 3:1 for UI elements
- **Font Scaling**: Supports up to 200% zoom without horizontal scroll

---

## Implementation Assets

### Required Icons (Lucide React)
- `BookOpen`, `Mic`, `MicOff`, `Volume2`, `HelpCircle`
- `ZoomIn`, `ZoomOut`, `Settings`, `Download`, `Calendar`
- `TrendingUp`, `Award`, `Clock`, `Users`, `Plus`
- `ChevronDown`, `ChevronUp`, `ArrowRight`, `Target`
- `Sparkles`, `AlertCircle`, `CheckCircle2`, `X`

### Fonts
- **Primary**: OpenDyslexic (via CDN or local)
- **Fallback**: Comic Sans MS, Verdana, Arial, sans-serif

### Animation Libraries
- **Framer Motion**: For component animations
- **CSS Keyframes**: For continuous effects (pulse, waveform)

---

## Responsive Breakpoints

```css
sm:  640px  - Small tablets
md:  768px  - Tablets, small laptops
lg:  1024px - Laptops, desktops
xl:  1280px - Large desktops
2xl: 1536px - Extra large screens
```

### Mobile Adaptations
- **Navigation**: Hamburger menu
- **Stats**: Vertical stacking (2 columns → 1 column)
- **Cards**: Full-width on mobile
- **Popover**: Takes 90% width, centered
- **Font Sizes**: Slightly smaller (18-28px for reading)

---

## Figma/Design Tool Export

For high-resolution mockups, export these screens at:
- **Desktop**: 1920x1080 @ 2x (Retina)
- **Tablet**: 1024x768 @ 2x
- **Mobile**: 375x812 (iPhone) @ 3x

Format: PNG with transparency for overlays, JPG for full screens

---

**Note**: The actual React components implement these designs. This document serves as a visual specification guide.
