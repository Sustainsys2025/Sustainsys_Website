# SustainSys Events Management Guide

## Quick Start

Your webpage now has a dynamic events section that appears in the hero area. You can easily manage all events by editing a simple configuration section at the top of the JavaScript code.

## Location of Configuration

Open the HTML file and scroll to the `<script>` section near the bottom. You'll find:

```javascript
// ============================================
// EVENTS CONFIGURATION - EDIT THIS SECTION
// ============================================
const EVENTS_CONFIG = {
    ...
}
```

## How to Add a New Event

Simply add a new event object to the `events` array:

```javascript
events: [
    {
        type: "webinar",           // Event type (see options below)
        title: "Your Event Title", // Name of the event
        date: "March 15, 2026",    // Date of the event
        time: "14:00 GMT",         // Time of the event
        location: "Online",        // Location (can be "Online" or physical)
        link: "https://register.example.com",  // Registration link (optional)
        linkText: "Register Now"   // Button text (optional)
    },
    // Add more events here...
]
```

## Event Types

Choose from these event types (affects the color badge):
- `"webinar"` - Purple to Cyan gradient
- `"workshop"` - Green to Cyan gradient  
- `"meetup"` - Pink to Purple gradient
- `"session"` - Default styling

## Full Configuration Options

### Main Settings

```javascript
const EVENTS_CONFIG = {
    enabled: true,  // Set to false to hide the entire events section
    title: "Upcoming Events & Sessions",  // Section heading
    icon: "📅",  // Emoji icon (you can use any emoji)
    events: [...]  // Array of events
};
```

### Event Object Properties

| Property | Required | Description | Example |
|----------|----------|-------------|---------|
| `type` | Yes | Event category | `"webinar"`, `"workshop"`, `"meetup"` |
| `title` | Yes | Event name | `"GenAI Workshop"` |
| `date` | Yes | Event date | `"February 15, 2026"` |
| `time` | Yes | Event time | `"14:00 GMT"` or `"10:00 - 16:00 GMT"` |
| `location` | Yes | Where it's happening | `"Online"` or `"London, UK"` |
| `link` | No | Registration URL | `"https://example.com/register"` |
| `linkText` | No | Button text | `"Register Now"`, `"Sign Up"`, `"Join Us"` |

## Examples

### Example 1: Online Webinar

```javascript
{
    type: "webinar",
    title: "Introduction to Agentic AI",
    date: "March 10, 2026",
    time: "15:00 GMT",
    location: "Online",
    link: "https://zoom.us/webinar/register",
    linkText: "Register Free"
}
```

### Example 2: In-Person Workshop

```javascript
{
    type: "workshop",
    title: "Hands-on RAG Development",
    date: "March 20, 2026",
    time: "09:00 - 17:00 GMT",
    location: "Cambridge Innovation Centre",
    link: "https://eventbrite.com/workshop",
    linkText: "Book Your Spot"
}
```

### Example 3: Event Without Registration Link

```javascript
{
    type: "meetup",
    title: "AI Engineers Networking",
    date: "March 25, 2026",
    time: "18:30 GMT",
    location: "London Tech Hub"
    // No link or linkText - the button won't appear
}
```

## Step-by-Step: Adding Your First Event

1. **Open the HTML file** in any text editor (VS Code, Notepad++, etc.)

2. **Find the EVENTS_CONFIG section** (search for "EVENTS CONFIGURATION")

3. **Add your event** to the events array:
   ```javascript
   events: [
       // Existing events...
       {
           type: "webinar",
           title: "My New Event",
           date: "April 1, 2026",
           time: "14:00 GMT",
           location: "Online",
           link: "https://example.com",
           linkText: "Join Now"
       }
   ]
   ```

4. **Save the file** and refresh your browser

5. **Done!** Your new event will appear in the events section

## Managing Events

### To Edit an Event
Simply modify the values in the event object:
```javascript
title: "Updated Event Title",  // Changed the title
date: "March 15, 2026",        // Changed the date
```

### To Remove an Event
Delete the entire event object (including the curly braces and comma):
```javascript
events: [
    {
        type: "webinar",
        title: "Keep This Event",
        ...
    },
    // Delete this entire block to remove an event
    // {
    //     type: "workshop",
    //     title: "Remove This Event",
    //     ...
    // },
    {
        type: "meetup",
        title: "Keep This Event Too",
        ...
    }
]
```

### To Temporarily Hide All Events
Set `enabled` to `false`:
```javascript
const EVENTS_CONFIG = {
    enabled: false,  // Events section won't display
    ...
}
```

### To Show Events Again
Set `enabled` back to `true`:
```javascript
const EVENTS_CONFIG = {
    enabled: true,  // Events section will display
    ...
}
```

## Customization

### Change the Section Title
```javascript
title: "Join Our Upcoming Sessions",  // Your custom title
```

### Change the Icon
```javascript
icon: "🎯",  // Use any emoji you like
// Other options: 🚀 📢 💡 ⚡ 🎪 🎓 🎉
```

### Change Event Type Colors
Edit the CSS if you want different colors for event types. Find this section in the `<style>` tag:

```css
.event-type.workshop {
    background: linear-gradient(135deg, var(--accent-green), var(--accent-cyan));
}

.event-type.meetup {
    background: linear-gradient(135deg, var(--accent-pink), var(--accent-purple));
}
```

## Tips

1. **Keep it Current**: Remove past events regularly to keep the section fresh
2. **Limit Events**: Show 3-6 upcoming events for best visual impact
3. **Clear Dates**: Use consistent date format (e.g., "Month Day, Year")
4. **Time Zones**: Always specify the timezone (GMT, EST, etc.)
5. **Test Links**: Verify registration links work before publishing

## Troubleshooting

**Events not showing up?**
- Check that `enabled: true`
- Make sure you have at least one event in the `events` array
- Verify all required fields are filled in
- Check browser console for JavaScript errors (F12)

**Events look weird?**
- Ensure all commas are in place between event objects
- Check that opening and closing braces `{}` match
- Validate your JavaScript syntax

**Button not appearing?**
- Make sure you included both `link` and `linkText` properties
- Check that the link starts with `http://` or `https://`

## Need Help?

If you encounter any issues:
1. Check the browser console (F12) for error messages
2. Make sure your JavaScript syntax is correct
3. Verify all required event properties are present
4. Contact support at accounts@sustainsys.co.uk

---

## Complete Example Configuration

Here's a complete, ready-to-use configuration with multiple events:

```javascript
const EVENTS_CONFIG = {
    enabled: true,
    title: "Upcoming AI & Engineering Events",
    icon: "🚀",
    events: [
        {
            type: "webinar",
            title: "GenAI for Enterprise Applications",
            date: "February 15, 2026",
            time: "14:00 GMT",
            location: "Online",
            link: "https://zoom.us/webinar/12345",
            linkText: "Register Free"
        },
        {
            type: "workshop",
            title: "Building AI Agents Workshop",
            date: "February 22, 2026",
            time: "09:00 - 17:00 GMT",
            location: "Cambridge, UK",
            link: "https://eventbrite.com/workshop",
            linkText: "Book Now"
        },
        {
            type: "meetup",
            title: "AI Engineers London Meetup",
            date: "March 5, 2026",
            time: "18:30 GMT",
            location: "Shoreditch, London",
            link: "https://meetup.com/ai-engineers",
            linkText: "Join Us"
        },
        {
            type: "session",
            title: "Office Hours: AI Implementation Q&A",
            date: "March 8, 2026",
            time: "11:00 - 12:00 GMT",
            location: "Online (Google Meet)"
        }
    ]
};
```

---

**Last Updated**: January 2026  
**Version**: 1.0
