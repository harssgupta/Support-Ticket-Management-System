# UI/UX Flow & Component Design

## Design System (Enhanced)

### Color Palette
```css
/* Light Theme */
--color-primary: #2563eb      /* Blue */
--color-success: #10b981      /* Green */
--color-warning: #f59e0b      /* Amber */
--color-danger: #ef4444       /* Red */
--color-critical: #991b1b     /* Dark Red */
--color-neutral: #6b7280      /* Gray */
--color-bg: #ffffff
--color-bg-secondary: #f9fafb
--color-border: #e5e7eb
--color-text: #111827
--color-text-muted: #6b7280

/* Dark Theme */
--color-bg: #0f172a
--color-bg-secondary: #1e293b
--color-border: #334155
--color-text: #f1f5f9
--color-text-muted: #94a3b8
```

### Typography
- **Headings**: Inter, Bold, 24px/20px/18px/16px
- **Body**: Inter, Regular, 16px line-height 1.5
- **Monospace**: Monaco, 14px (for keys, IDs, code)

### Spacing
- Base unit: 8px
- xs: 4px, sm: 8px, md: 16px, lg: 24px, xl: 32px, 2xl: 48px

### Components
- Built on Radix UI (unstyled, composable)
- Tailwind CSS for styling
- Custom components: TicketCard, StatusBadge, PriorityBadge, UserAvatar

---

## Page Flows

### 1. Authentication Flow

#### Login Page
```
┌─────────────────────────────────┐
│  Support Ticket Hub             │
│  ──────────────────────────────  │
│                                 │
│  Username: [____________]       │
│  Password: [____________]       │
│                                 │
│  [Sign In]                      │
│                                 │
│  Forgot password?               │
└─────────────────────────────────┘

Error states:
- Invalid credentials
- User not found
- User not active
- Session expired (redirect to login)
```

#### Dashboard After Login
```
┌─────────────────────────────────────────────────────────┐
│ Support Ticket Hub      🌓 Search 👤 john ⋯             │
├─────────────────────────────────────────────────────────┤
│ SIDEBAR              │ MAIN CONTENT                      │
│                      │                                   │
│ 📊 Dashboard         │ Welcome back, John!               │
│ 🎫 All Tickets       │                                   │
│ 👤 Assigned to Me [5]│ Your Workload                    │
│ 🔎 Search            │ ┌────────────┬────────────┐      │
│ 📝 Create Ticket     │ │ Open: 3    │ In Prog: 2 │      │
│ ⚙️ Settings          │ └────────────┴────────────┘      │
│                      │                                   │
│                      │ Recent Activity                   │
│                      │ • TKT-001: Status changed (2min)│
│                      │ • TKT-003: Comment added (1h) │
│                      │ • TKT-002: Assigned to you (3h)│
│                      │                                   │
└─────────────────────────────────────────────────────────┘
```

---

### 2. Ticket Listing Page

#### Main View
```
┌─────────────────────────────────────────────────────────┐
│ All Tickets                      [Filter] [Sort] [View] │
├─────────────────────────────────────────────────────────┤
│ Status: [OPEN ▼] Priority: [ALL ▼] Assignee: [ALL ▼]   │
│ Search: [____________] [X]                              │
│                                                         │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ TKT-100  Login broken           ⚠️ CRITICAL  🔴 NEW  │ │
│ │ Reported by John • Assigned to Jane (45m)           │ │
│ │ 3 comments • 1 attachment                           │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                         │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ TKT-099  Database connection issues  🟠 HIGH  ⏳    │ │
│ │ Reported by Bob • Assigned to Jane (2h)            │ │
│ │ 1 comment                                           │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                         │
│ Page 1 of 8 [< 1 2 3 4 5 ... 8 >]                      │
└─────────────────────────────────────────────────────────┘
```

#### Card Details
- **Title**: Bold, primary color on hover → clickable
- **Key + Status**: Left side, badge-styled
- **Priority + Age**: Right side with visual indicators
- **Submeta**: "Reported by X • Assigned to Y (time)"
- **Engagement**: Comment count, attachment indicator
- **Quick Actions**: Hover to show (assign, status, comment buttons)

---

### 3. Ticket Detail Page

#### Header
```
┌─────────────────────────────────────────────────────────┐
│ ← Back to Tickets                                       │
│                                                         │
│ TKT-100: Login broken                                   │
│ ⚠️ CRITICAL  🔴 OPEN  [Edit ▼] [More ⋯]               │
│                                                         │
│ Reported by John (2h ago) • Last updated 5m ago        │
└─────────────────────────────────────────────────────────┘
```

#### Status Timeline
```
┌─────────────────────────────────────────────────────────┐
│ Status Progress                                         │
│                                                         │
│  OPEN ──→ IN_PROGRESS ──→ RESOLVED ──→ CLOSED         │
│   ✓          ○            ○            ○               │
│ 2h ago    --             --           --               │
│                                                         │
│ [Change Status ▼]                                      │
└─────────────────────────────────────────────────────────┘
```

#### Ticket Details Panel
```
┌──────────────────────┐
│ Details              │
├──────────────────────┤
│ Status:  OPEN [▼]    │
│ Priority: CRITICAL   │
│          [▼]         │
│ Assignee: Jane [X]   │
│          [Assign]    │
│ Created: 2h ago      │
│ Updated: 5m ago      │
│ First Response: -    │
│ Resolved: -          │
│                      │
│ Watchers (1)         │
│ • Bob [X]            │
│ [Add Watcher]        │
└──────────────────────┘
```

#### Description & Comments
```
┌─────────────────────────────────────────────────────────┐
│ Description (Editable by reporter/assignee)             │
├─────────────────────────────────────────────────────────┤
│ Users are unable to login. They report seeing a blank   │
│ page after entering credentials. This has affected 50+  │
│ customers in the last 2 hours.                         │
│                                                         │
│ Attachments:                                           │
│ 📎 error-screenshot.png (200KB) [Download]            │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ Comments (3)                                            │
├─────────────────────────────────────────────────────────┤
│ Jane (45m ago) [Edit] [Delete] [Reply]                │
│ ├─ Assigned to myself to investigate                   │
│ └─ @bob can you check the app server logs?             │
│    └─ Reply from Bob (40m ago) [Edit] [Delete]        │
│       Checked logs, no errors visible. Could be         │
│       CDN issue.                                        │
│                                                         │
│ John (30m ago) [Edit]                                  │
│ ├─ Confirmed. CDN is returning stale assets.           │
│ │ Need to purge cache.                                 │
│                                                         │
│ [Post Comment]                                         │
│ ┌────────────────────────────────────┐                │
│ │ Type your comment... (/mention)    │ [Attach] [Post]│
│ └────────────────────────────────────┘                │
└─────────────────────────────────────────────────────────┘
```

---

### 4. Create/Edit Ticket Modal

#### New Ticket Dialog
```
┌─────────────────────────────────────────────────────────┐
│ Create New Ticket                              [X]      │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ Title *                                                 │
│ [________________] (max 255 chars)                     │
│                                                         │
│ Description *                                          │
│ [_____________________________________]               │
│ [     Rich text editor with          ]               │
│ [     markdown support               ] (max 5000)   │
│ [_____________________________________]               │
│                                                         │
│ Priority *            │ Assignee                       │
│ [MEDIUM ▼]           │ [Search or select...] [X]       │
│                      │                                │
│                      │ Watchers                       │
│                      │ [Add people...]                │
│                      │ • john                         │
│                      │ • bob [X]                      │
│                                                         │
│ [Cancel]              [Save]                           │
└─────────────────────────────────────────────────────────┘
```

#### Validation Errors
```
Displays inline near fields:
┌────────────────────────────────┐
│ ⚠️ Title is required           │
└────────────────────────────────┘

And bottom summary modal for multiple errors:
┌─────────────────────────────────────────┐
│ ⚠️ Cannot create ticket                │
├─────────────────────────────────────────┤
│ • Title is required                     │
│ • Invalid priority selected             │
│ • Assignee is not available             │
└─────────────────────────────────────────┘
```

---

### 5. Filter/Search Sidebar

#### Expandable Filter Panel
```
┌──────────────────────────┐
│ Filters                  │
├──────────────────────────┤
│ Status                   │
│ ☑ Open (45)             │
│ ☑ In Progress (23)      │
│ ☐ Resolved (89)         │
│ ☐ Closed (156)          │
│ ☐ Cancelled (3)         │
│                          │
│ Priority                 │
│ ☑ Critical (8)          │
│ ☑ High (12)             │
│ ☐ Medium (34)           │
│ ☐ Low (102)             │
│                          │
│ Assignee                 │
│ [Search...] ↓            │
│ ☑ Jane (5)              │
│ ☑ Bob (3)               │
│ ☐ Alice (2)             │
│ ☐ Unassigned (78)       │
│                          │
│ Date Range               │
│ From: [___/___/___]      │
│ To:   [___/___/___]      │
│                          │
│ [Apply] [Reset]         │
└──────────────────────────┘
```

---

### 6. Assigned to Me Page

#### Personal Dashboard
```
┌─────────────────────────────────────────────────────────┐
│ My Tickets                                              │
│                                                         │
│ Quick Stats:                                            │
│ ┌─────────────┬─────────────┬─────────────┐            │
│ │ 5 Open      │ 3 In Prog   │ 0 Critical  │            │
│ └─────────────┴─────────────┴─────────────┘            │
│                                                         │
│ Open Tickets (Priority order)                           │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ TKT-100  Login broken  ⚠️ CRITICAL  45m            │ │
│ │ 🔴 Not started  • 3 comments                       │ │
│ │ [Start Work]                                       │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                         │
│ In Progress (Time tracking)                             │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ TKT-099  Database issues  🟠 HIGH  2h 30m         │ │
│ │ Working on this • 1 comment • Last updated 5m ago  │ │
│ │ [Change Status] [Add Comment]                      │ │
│ └─────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

---

## Key UI Enhancements Over Original

1. **Visual Status Indicators**
   - Color-coded status badges
   - Timeline view showing progression
   - Age indicators (45m, 2h ago)

2. **Inline Actions**
   - Quick status change dropdowns
   - Assign buttons on cards
   - Reply buttons on comments

3. **Better Forms**
   - Clear error messages with field highlighting
   - Rich text editor for descriptions
   - Live character counters
   - Autocomplete for mentions and assignees

4. **Real-time Updates**
   - Comments update without page reload
   - Status changes reflected immediately
   - Activity feed shows latest changes

5. **Dark Mode**
   - Full theme support
   - CSS variables for easy customization
   - Respects system preference

6. **Accessibility**
   - Keyboard navigation (Tab, arrow keys)
   - ARIA labels on all interactive elements
   - Screen reader friendly
   - High contrast option

7. **Mobile Responsive**
   - Sidebar collapses on small screens
   - Single-column layout for mobile
   - Touch-friendly buttons (48px minimum)
   - Simplified forms on mobile

8. **Performance Optimizations**
   - Virtual scrolling for large lists
   - Image lazy loading
   - Code splitting per route
   - Service worker for offline access

9. **Data Visualization**
   - Ticket lifecycle diagram
   - Team workload charts
   - Response/resolution time metrics
   - SLA compliance indicators

10. **Bulk Operations**
    - Select multiple tickets
    - Bulk assign
    - Bulk status change
    - Bulk archive/delete
