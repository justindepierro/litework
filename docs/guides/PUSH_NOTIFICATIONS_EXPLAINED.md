# 📱 How Push Notifications Reach Your Phone - Simple Explanation

## The Simple Version

**Question:** "How does a notification from LiteWork get to my phone?"

**Answer:** When Coach assigns you a workout, here's what happens:

1. **Coach clicks "Assign Workout"** in LiteWork
2. **LiteWork server** sends a message to Google/Apple
3. **Google/Apple** delivers it to your phone
4. **Your phone shows the notification** 🔔

That's it! Your phone doesn't need the LiteWork app open. It just needs to be connected to the internet.

---

## The Technical Version (Step-by-Step)

### Setup (One-Time)

#### Step 1: You Install LiteWork
```
You → Add LiteWork to Home Screen → Now it's a "real app"
```

#### Step 2: You Grant Permission
```
LiteWork asks: "Allow notifications?"
You tap: "Allow" ✅
```

#### Step 3: Your Phone Subscribes
```
Your Phone → Contacts Google/Apple Push Service
Push Service → Gives you a unique ID
Your Phone → Saves the ID
LiteWork → Stores your ID in database
```

Think of this like signing up for a newsletter. Google/Apple gives you a unique subscriber ID, and LiteWork keeps it on file.

### When Coach Assigns a Workout

#### Step 1: Assignment Created
```
Coach → Assigns workout to you
LiteWork database → Saves assignment
API → Looks up your unique ID
```

#### Step 2: LiteWork Sends to Push Service
```
LiteWork Server → Calls Google/Apple API
Message: {
  "To": "your-unique-id",
  "Title": "New Workout Assigned! 🏋️",
  "Body": "Upper Body Strength - Monday 3:30 PM",
  "URL": "/workouts/view/123"
}
```

#### Step 3: Push Service Delivers to Your Phone
```
Google/Apple → Finds your device using your ID
Google/Apple → Sends encrypted message to your phone
Your Phone → Wakes up and receives it
```

This happens even if:
- ❌ LiteWork is closed
- ❌ Phone is locked
- ❌ You're in another app

As long as your phone is connected to internet (WiFi or cellular).

#### Step 4: Your Phone Shows Notification
```
Your Phone → Displays notification
Lock Screen shows:
┌─────────────────────────────────┐
│ 🏋️ LiteWork                     │
│ New Workout Assigned!           │
│ Upper Body Strength - Monday... │
│ [View Workout] [Dismiss]        │
└─────────────────────────────────┘
```

#### Step 5: You Tap It
```
You → Tap notification
Phone → Opens LiteWork
LiteWork → Shows workout details
```

---

## The Key Players

### 1. **LiteWork Server** (Your Backend)
- Knows WHO to notify (athlete ID)
- Knows WHAT to send (workout info)
- Stores your push subscription ID
- Sends message to Google/Apple

### 2. **Push Service** (Google FCM or Apple APNs)
- **FCM** = Firebase Cloud Messaging (Android/Chrome)
- **APNs** = Apple Push Notification service (iOS/Safari)
- Maintains connections to ALL phones
- Delivers messages to specific devices
- FREE to use (Google/Apple provide this)

### 3. **Your Phone** (The Device)
- Stays connected to Push Service 24/7
- Receives messages in real-time
- Shows notifications
- Wakes up app when tapped

### 4. **Service Worker** (Background Script)
- Lives in browser/PWA
- Handles incoming messages
- Displays notifications
- Routes clicks to correct page

---

## Why This Architecture?

### Problem: Direct Connection Won't Work

**Why not connect phone directly to LiteWork server?**

```
❌ Your Phone ←→ LiteWork Server

Problems:
- Phone needs to stay connected 24/7 (battery drain)
- Phone IP address changes constantly
- Server doesn't know where your phone is
- What if phone is offline?
```

### Solution: Use Google/Apple as Middleman

```
✅ Your Phone ←→ Google/Apple ←→ LiteWork Server

Benefits:
- Google/Apple already connected to phones 24/7
- They handle delivery, retries, offline queuing
- Battery efficient (shared connection)
- Works across all apps
```

---

## Real-World Analogy

**Push Notifications = Post Office**

### Setup Phase (Subscription)
```
You (Phone) → Visit Google Post Office
Google → Gives you mailbox #XYZ123
You → Tell LiteWork: "Send my mail to Google mailbox #XYZ123"
LiteWork → Writes down your mailbox number
```

### Notification Phase (Delivery)
```
Coach → Assigns workout
LiteWork → Writes letter: "Workout assigned!"
LiteWork → Addresses to Google mailbox #XYZ123
LiteWork → Hands to Google Post Office
Google → Delivers to your mailbox
You → Check mailbox, see notification
You → Open letter (tap notification)
```

---

## Platform Differences

### Android / Chrome
```
Phone → Connected to Google FCM
Process:
1. Chrome generates subscription
2. Subscription endpoint = FCM URL
3. LiteWork → Sends to FCM → Phone
4. Works in browser OR as PWA ✅
```

**Example endpoint:**
```
https://fcm.googleapis.com/fcm/send/dXoFa...xyz
```

### iOS / Safari
```
Phone → Connected to Apple APNs
Process:
1. Safari generates subscription (PWA ONLY)
2. Subscription endpoint = APNs URL
3. LiteWork → Sends to APNs → Phone
4. Only works as installed PWA ⚠️
```

**Requirements:**
- iOS 16.4 or later
- Must be added to home screen
- Must open from home screen icon

**Example endpoint:**
```
https://web.push.apple.com/vXqR...abc
```

---

## Security & Privacy

### How LiteWork Proves It's Allowed to Send

**VAPID Keys** = Your server's ID card

```
LiteWork generates:
- Public Key (shared with everyone)
- Private Key (kept secret)

When you subscribe:
- Your subscription includes public key
- Google/Apple knows: "Only holder of private key can send"

When LiteWork sends:
- Signs message with private key
- Google/Apple verifies: "Yep, this is from LiteWork ✅"
- Rejects messages from imposters ❌
```

### End-to-End Encryption

```
LiteWork → Encrypts message with YOUR device key
Google/Apple → Can't read message (just delivers envelope)
Your Device → Decrypts with your key
```

Google/Apple see:
- ✅ "Deliver this to device XYZ"
- ❌ Can't read: "New workout assigned"

---

## What Happens When...

### Phone is Offline?
```
LiteWork → Sends to Google/Apple
Google/Apple → Queues message
Phone comes online → Receives queued message
Notification shows ✅
```

### Phone is Off?
```
Same as offline. Message waits up to 4 weeks.
```

### User Revokes Permission?
```
User → Settings → Disables LiteWork notifications
Phone → Tells Google/Apple: "Stop accepting for LiteWork"
LiteWork → Sends notification
Google/Apple → Returns 410 error
LiteWork → Removes subscription from database
```

### Subscription Expires?
```
After ~6 months of not using device:
Google/Apple → Expires subscription
LiteWork → Gets 410 error when sending
LiteWork → Auto-deletes expired subscription
User needs to re-subscribe next visit
```

### User Has Multiple Devices?
```
User subscribed on:
- iPhone ✅
- iPad ✅
- Laptop ✅

LiteWork database stores:
- 3 separate subscriptions
- All with user_id: "athlete-123"

When notification sent:
- LiteWork sends to ALL 3 devices
- iPhone gets it 🔔
- iPad gets it 🔔
- Laptop gets it 🔔
```

---

## Data Flow Example

### Complete Flow with Data

**Coach assigns workout:**

```json
// 1. Assignment created
POST /api/assignments
{
  "athlete_id": "athlete-uuid-456",
  "workout_id": "workout-uuid-789",
  "scheduled_date": "2025-11-05"
}

// 2. Look up push subscriptions
SELECT * FROM push_subscriptions 
WHERE user_id = 'athlete-uuid-456'

Results:
[
  {
    "endpoint": "https://fcm.googleapis.com/fcm/send/xyz123",
    "p256dh": "encryption-key-abc",
    "auth": "auth-secret-def",
    "device_name": "Justin's iPhone"
  }
]

// 3. Send to FCM
POST https://fcm.googleapis.com/fcm/send/xyz123
Headers:
  Authorization: Bearer vapid-signature-here
  Content-Type: application/json
Body:
{
  "title": "New Workout Assigned! 🏋️",
  "body": "Upper Body Strength - Monday 3:30 PM",
  "url": "/workouts/view/workout-uuid-789",
  "icon": "/icons/icon-192x192.png",
  "tag": "workout-assignment"
}

// 4. FCM delivers to device (encrypted)

// 5. Service worker receives and displays
self.registration.showNotification("New Workout Assigned! 🏋️", {
  body: "Upper Body Strength - Monday 3:30 PM",
  icon: "/icons/icon-192x192.png",
  actions: [
    { action: "view", title: "View Workout" },
    { action: "dismiss", title: "Dismiss" }
  ]
});
```

---

## Troubleshooting Guide

### "Not Getting Notifications on iPhone"

**Check:**
1. iOS version → Must be 16.4+
2. Installed as PWA? → Must add to home screen
3. Opening from home screen? → Must open PWA icon (not Safari)
4. Permission granted? → Settings → LiteWork → Notifications: ON
5. Focus mode off? → Disable Do Not Disturb

**Fix:**
```
1. Delete LiteWork from home screen
2. Open Safari → litework.app
3. Share → Add to Home Screen
4. Open from HOME SCREEN icon
5. Grant notification permission
6. Test notification
```

### "Notifications Work Sometimes"

**Likely causes:**
- Subscription expired (re-subscribe)
- Multiple devices (only newest subscription works)
- Battery saver mode (limits background)
- Poor internet connection (queued, will arrive)

### "Click Doesn't Open Workout"

**Check:**
- URL in notification correct?
- Service worker notification click handler working?
- App opens but wrong page? (routing issue)

---

## Cost & Limits

### Completely Free
- ✅ Google FCM: Free unlimited
- ✅ Apple APNs: Free unlimited
- ✅ No per-notification fees
- ✅ No monthly charges

### Rate Limits
- **FCM:** 600,000/minute (way more than needed)
- **APNs:** No documented limit
- **LiteWork:** Limit to prevent abuse

### Size Limits
- **Message payload:** 4KB max
- **Title:** ~50 characters recommended
- **Body:** ~120 characters recommended

---

## Summary

**How it works (TL;DR):**

1. **One-time:** User grants permission → Phone subscribes → LiteWork stores subscription
2. **Every notification:** LiteWork → Google/Apple → Phone → User sees it
3. **On tap:** Notification → Opens LiteWork app → Shows workout

**Key benefits:**
- ✅ Works when app is closed
- ✅ Free forever
- ✅ Battery efficient
- ✅ Real-time delivery
- ✅ Secure & private

**Platform support:**
- ✅ Android (browser or PWA)
- ✅ iOS (PWA only, iOS 16.4+)
- ✅ Desktop (all browsers)

---

**Questions?** Read the full technical guide:
- `docs/guides/NOTIFICATION_SYSTEM_GUIDE.md`

**Ready to implement?** Follow the roadmap:
- `docs/guides/NOTIFICATION_IMPLEMENTATION_ROADMAP.md`

---

**Last Updated:** November 2, 2025
