# Ghost Booking Solution - Auto-Cancellation & Waitlist System

## 📋 Overview

**Problem Statement**: Users book venues in advance but forget to cancel when their events are cancelled. This creates "ghost bookings" that block time slots and prevent other users from booking, reducing overall venue utilization.

**Solution**: Implement an automated system that combines:
1. **Auto-Cancellation with Reminders** - Proactively prevents ghost bookings
2. **Waitlist System** - Fills slots immediately when they open up

**Expected Outcome**: 
- 80-90% reduction in ghost bookings
- 50-60% increase in venue utilization
- Improved user satisfaction

---

## 🎯 Implementation Phases

### **Phase 1: Foundation (3-4 hours)**
Database schema changes and Celery Beat setup

**Database Changes:**
```python
# Booking model additions
reminder_sent = BooleanField(default=False)
reminder_sent_at = DateTimeField(null=True, blank=True)
confirmed = BooleanField(default=False)
confirmed_at = DateTimeField(null=True, blank=True)
auto_cancelled = BooleanField(default=False)
auto_cancelled_at = DateTimeField(null=True, blank=True)
auto_cancel_reason = CharField(max_length=255, blank=True)
```

**New Waitlist Model:**
```python
class Waitlist(models.Model):
    venue = ForeignKey(Venue)
    user = ForeignKey(User)
    date = DateField()
    start_time = TimeField()
    end_time = TimeField()
    created_at = DateTimeField(auto_now_add=True)
    notified = BooleanField(default=False)
    notified_at = DateTimeField(null=True)
    claimed = BooleanField(default=False)
    expired = BooleanField(default=False)
    priority = IntegerField(default=0)  # Lower = higher priority
```

**Celery Beat Configuration:**
```python
# settings.py
CELERY_BEAT_SCHEDULE = {
    'send-booking-reminders': {
        'task': 'booking_system.tasks.send_booking_reminders',
        'schedule': crontab(minute=0),  # Every hour
    },
    'auto-cancel-unconfirmed': {
        'task': 'booking_system.tasks.auto_cancel_unconfirmed_bookings',
        'schedule': crontab(minute='*/30'),  # Every 30 minutes
    },
    'process-waitlist-expirations': {
        'task': 'booking_system.tasks.expire_old_waitlist_notifications',
        'schedule': crontab(minute='*/5'),  # Every 5 minutes
    },
}
```

**Deliverables:**
- ✅ Migration files for Booking model changes
- ✅ Waitlist model created
- ✅ Celery Beat configured in settings.py
- ✅ booking_system/tasks.py file created

---

### **Phase 2: Auto-Cancellation System (2-3 hours)**
Implement automated reminder and cancellation logic

**Task 1: Send Booking Reminders**
```python
@shared_task
def send_booking_reminders():
    """
    Runs every hour
    Sends reminder 24 hours before event
    """
    # Find bookings 24 hours ahead
    # Send reminder email
    # Mark reminder_sent = True
```

**Task 2: Auto-Cancel Unconfirmed Bookings**
```python
@shared_task
def auto_cancel_unconfirmed_bookings():
    """
    Runs every 30 minutes
    Cancels unconfirmed bookings 2 hours before event
    Triggers waitlist notifications
    """
    # Find bookings 2 hours ahead, not confirmed
    # Cancel booking, mark auto_cancelled = True
    # Send cancellation email to user
    # Trigger waitlist processing
```

**Email Templates Needed:**
1. `booking_reminder.html` - 24-hour reminder
2. `booking_auto_cancelled.html` - Auto-cancellation notice
3. `waitlist_slot_available.html` - Slot available notification

**API Endpoints:**
- `POST /api/bookings/{id}/confirm/` - User confirms booking
- `POST /api/bookings/{id}/override-cancel/` - Admin overrides auto-cancel

**Deliverables:**
- ✅ Reminder email task implemented
- ✅ Auto-cancel task implemented
- ✅ 3 new email templates created
- ✅ Confirmation API endpoint
- ✅ Admin override API endpoint

---

### **Phase 3: Waitlist System (4-5 hours)**
Build complete waitlist functionality with auto-notifications

**Waitlist API Endpoints:**
```python
POST /api/waitlist/join/
{
  "venue_id": 1,
  "date": "2025-11-15",
  "start_time": "14:00",
  "end_time": "16:00"
}

GET /api/waitlist/my-waitlist/
# Returns user's waitlist entries

POST /api/waitlist/{id}/claim/
# User claims available slot (15-min window)

DELETE /api/waitlist/{id}/leave/
# User leaves waitlist
```

**Task 3: Process Waitlist When Slot Opens**
```python
@shared_task
def notify_waitlist_users(venue_id, date, start_time, end_time):
    """
    Called when booking is cancelled
    Notifies first user in waitlist
    Starts 15-minute claim timer
    """
    # Find highest priority waitlist entry
    # Send notification email
    # Mark notified = True
    # Set expiration time (15 mins)
```

**Task 4: Expire Unclaimed Slots**
```python
@shared_task
def expire_old_waitlist_notifications():
    """
    Runs every 5 minutes
    Expires notifications after 15 minutes
    Moves to next person in waitlist
    """
    # Find expired notifications (15+ mins old)
    # Mark expired = True
    # Notify next person in queue
```

**Frontend Changes:**
1. **Booking Page** - Add "Join Waitlist" button when slot is full
2. **My Waitlist Page** - New page showing user's waitlist entries
3. **Notification Bell** - Alert when slot becomes available
4. **Claim Dialog** - 15-minute countdown timer to claim slot

**Deliverables:**
- ✅ Waitlist API endpoints (join, leave, claim, list)
- ✅ Waitlist processing tasks
- ✅ Email template: waitlist_slot_available.html
- ✅ Frontend: Join Waitlist button
- ✅ Frontend: My Waitlist page
- ✅ Frontend: Claim slot dialog with timer

---

## 🔧 Technical Specifications

### **Auto-Cancellation Rules**
1. **Reminder Time**: 24 hours before event
2. **Auto-Cancel Time**: 2 hours before event (if not confirmed)
3. **Grace Period**: 22 hours to confirm after reminder
4. **Admin Override**: Hall Admins can prevent auto-cancellation
5. **Email Notifications**: User notified at both reminder and cancellation

### **Waitlist Rules**
1. **Priority**: First-come-first-serve (FIFO)
2. **Claim Window**: 15 minutes after notification
3. **Max Entries**: 3 waitlist entries per user per day
4. **Expiration**: Move to next person if not claimed in 15 mins
5. **Auto-Book**: No, user must actively claim the slot
6. **Duplicate Prevention**: User cannot be on waitlist for slot they already booked

### **Celery Beat Schedule**
| Task | Frequency | Purpose |
|------|-----------|---------|
| `send_booking_reminders` | Every hour | Send 24h reminders |
| `auto_cancel_unconfirmed_bookings` | Every 30 minutes | Cancel 2h before event |
| `expire_old_waitlist_notifications` | Every 5 minutes | Process expired claims |

---

## 🎨 User Experience Flow

### **Scenario 1: Successful Confirmation**
```
Day 1:  User books venue for Day 30 at 2 PM
Day 29 (2 PM): Receives reminder email "Confirm your booking"
Day 29 (3 PM): User clicks "Confirm Booking" in email/app
Day 30 (2 PM): Event happens successfully
```

### **Scenario 2: Ghost Booking Prevented**
```
Day 1:  User A books venue for Day 30 at 2 PM
Day 29 (2 PM): Receives reminder email
Day 30 (12 PM): Auto-cancel triggered (no confirmation)
Day 30 (12:01 PM): User A gets cancellation email
Day 30 (12:01 PM): Slot released back to system
```

### **Scenario 3: Waitlist Success**
```
Day 1:  User A books venue for Day 30 at 2 PM
Day 15: User B tries to book same slot → Slot full
Day 15: User B clicks "Join Waitlist" → Added to queue
Day 29: User A doesn't confirm → Auto-cancelled
Day 30 (12:01 PM): User B gets "Slot Available!" email
Day 30 (12:10 PM): User B clicks "Claim Slot" → Booking created
Day 30 (2 PM): User B's event happens successfully
```

### **Scenario 4: Waitlist Expiration**
```
Day 30 (12:01 PM): User B gets "Slot Available!" email
Day 30 (12:16 PM): No response → Notification expires
Day 30 (12:17 PM): User C (next in queue) gets notification
Day 30 (12:20 PM): User C claims slot → Success!
```

---

## 📊 Success Metrics

### **Key Performance Indicators (KPIs)**
1. **Ghost Booking Rate**: Target < 5% (down from ~20-30%)
2. **Confirmation Rate**: Target > 90% of reminded users confirm
3. **Waitlist Conversion**: Target > 70% of notified users claim slots
4. **Venue Utilization**: Target 20-30% increase in actual usage
5. **Average Time to Fill Cancelled Slots**: Target < 30 minutes

### **Monitoring Points**
- Count of auto-cancelled bookings per day
- Waitlist queue lengths per venue
- Claim success rate (claimed vs expired notifications)
- User engagement with reminder emails
- Admin override frequency

---

## 🔐 Security Considerations

1. **Rate Limiting**: Max 3 waitlist entries per user per day
2. **Authorization**: Users can only claim their own waitlist notifications
3. **Validation**: Verify slot is still available before creating booking
4. **Admin Controls**: Hall Admins can override auto-cancellations
5. **Email Throttling**: Prevent spam with Celery rate limits

---

## 🧪 Testing Checklist

### **Phase 1: Foundation**
- [ ] Booking model migrations applied successfully
- [ ] Waitlist model created and queryable
- [ ] Celery Beat starts without errors
- [ ] Beat schedule shows all 3 tasks

### **Phase 2: Auto-Cancellation**
- [ ] Reminder email sent 24 hours before event
- [ ] Auto-cancel triggered 2 hours before event
- [ ] Confirmation API works correctly
- [ ] Admin override prevents auto-cancel
- [ ] Email templates render correctly

### **Phase 3: Waitlist**
- [ ] Users can join waitlist for full slots
- [ ] Notification sent when slot opens
- [ ] 15-minute claim window enforced
- [ ] Next person notified after expiration
- [ ] Duplicate entries prevented
- [ ] Max 3 entries per user enforced

### **Integration Testing**
- [ ] End-to-end: Booking → Reminder → No confirm → Auto-cancel → Waitlist notified → Claimed
- [ ] Multiple users in waitlist queue handled correctly
- [ ] Concurrent claim attempts prevented
- [ ] All email templates work in Gmail/Outlook
- [ ] Frontend UI responsive on mobile

---

## 📝 Implementation Notes

### **Database Indexes Needed**
```python
# Booking model
class Meta:
    indexes = [
        models.Index(fields=['date', 'status', 'reminder_sent']),
        models.Index(fields=['date', 'start_time', 'confirmed']),
    ]

# Waitlist model
class Meta:
    indexes = [
        models.Index(fields=['venue', 'date', 'start_time']),
        models.Index(fields=['notified', 'expired', 'claimed']),
        models.Index(fields=['priority']),
    ]
```

### **Celery Task Best Practices**
- Use database transactions for atomic operations
- Implement idempotency (safe to retry)
- Log all auto-cancellations for audit trail
- Use select_for_update() to prevent race conditions
- Set task time limits (5 minutes max)

### **Frontend State Management**
- Refresh booking list after claim action
- Show countdown timer for claim window
- Real-time notification when slot becomes available
- Badge showing waitlist position
- Disable "Join Waitlist" if already in queue

---

## 🚀 Deployment Checklist

### **Before Going Live**
- [ ] All migrations applied to production database
- [ ] Celery Beat service configured and running
- [ ] Email templates tested with real email clients
- [ ] Rate limiting configured
- [ ] Monitoring/logging enabled for tasks
- [ ] Admin documentation created
- [ ] User documentation/FAQ created

### **Rollout Strategy**
1. **Week 1**: Deploy Phase 1 & 2 (auto-cancel only)
2. **Week 2**: Monitor metrics, adjust timing if needed
3. **Week 3**: Deploy Phase 3 (waitlist)
4. **Week 4**: Full monitoring and optimization

---

## 📚 Related Documentation

- [NOTIFICATION_SYSTEM.md](./NOTIFICATION_SYSTEM.md) - Email system architecture
- [AUTO_CANCEL_WAITLIST_IMPLEMENTATION.md](./AUTO_CANCEL_WAITLIST_IMPLEMENTATION.md) - Detailed implementation guide
- [STARTUP_GUIDE.md](./STARTUP_GUIDE.md) - How to start Celery Beat
- [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md) - Complete database schema

---

## 🔄 Future Enhancements (Post-Phase 3)

1. **Smart Reminders**: ML-based prediction of who needs reminders
2. **Priority Waitlist**: Allow Hall Admins to prioritize certain users
3. **Recurring Bookings**: Auto-cancellation for series bookings
4. **No-Show Tracking**: Track users with multiple auto-cancellations
5. **SMS Notifications**: Alternative to email for urgent notifications
6. **Analytics Dashboard**: Visual metrics for admins
7. **Waitlist Preferences**: Notify about similar venues/times

---

**Last Updated**: November 5, 2025  
**Status**: Planning Phase  
**Next Steps**: Begin Phase 1 implementation
