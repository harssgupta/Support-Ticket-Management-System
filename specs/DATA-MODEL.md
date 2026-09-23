# Data Model & Domain Entities

## Core Entities

### Ticket Entity
```java
@Entity
@Table(name = "tickets", indexes = {
    @Index(name = "idx_tickets_status_priority", columnList = "status,priority"),
    @Index(name = "idx_tickets_assignee", columnList = "assignee_id"),
    @Index(name = "idx_tickets_created_at", columnList = "created_at")
})
public class Ticket {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(unique = true, length = 20)
    private String key;  // TKT-1, TKT-2, etc.
    
    @Column(length = 255, nullable = false)
    private String title;
    
    @Column(columnDefinition = "TEXT")
    private String description;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TicketStatus status = TicketStatus.OPEN;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Priority priority = Priority.MEDIUM;
    
    @ManyToOne
    @JoinColumn(name = "reporter_id", nullable = false)
    private User reporter;
    
    @ManyToOne
    @JoinColumn(name = "assignee_id")
    private User assignee;
    
    @ManyToMany
    @JoinTable(name = "ticket_watchers")
    private Set<User> watchers = new HashSet<>();
    
    @OneToMany(mappedBy = "ticket", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Comment> comments = new ArrayList<>();
    
    @OneToMany(mappedBy = "ticket", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<TicketHistory> history = new ArrayList<>();
    
    @OneToMany(mappedBy = "ticket", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Attachment> attachments = new ArrayList<>();
    
    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    @Column(nullable = false)
    private LocalDateTime updatedAt;
    
    @Temporal(TemporalType.TIMESTAMP)
    private LocalDateTime firstResponseAt;
    
    @Temporal(TemporalType.TIMESTAMP)
    private LocalDateTime resolvedAt;
    
    @Version
    @Column(name = "version")
    private Long version;  // Optimistic locking
}
```

### TicketStatus Enum
```java
public enum TicketStatus {
    OPEN("Open"),
    IN_PROGRESS("In Progress"),
    RESOLVED("Resolved"),
    CLOSED("Closed"),
    CANCELLED("Cancelled");
    
    private final String label;
    
    // Allowed transitions
    public boolean canTransitionTo(TicketStatus target) {
        return switch (this) {
            case OPEN -> target == IN_PROGRESS || target == CANCELLED;
            case IN_PROGRESS -> target == RESOLVED || target == CANCELLED;
            case RESOLVED -> target == CLOSED;
            default -> false;
        };
    }
}
```

### Priority Enum
```java
public enum Priority {
    LOW(1),
    MEDIUM(2),
    HIGH(3),
    CRITICAL(4);
    
    private final int level;
}
```

### Comment Entity
```java
@Entity
@Table(name = "comments", indexes = {
    @Index(name = "idx_comments_ticket", columnList = "ticket_id"),
    @Index(name = "idx_comments_author", columnList = "author_id")
})
public class Comment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne
    @JoinColumn(name = "ticket_id", nullable = false)
    private Ticket ticket;
    
    @ManyToOne
    @JoinColumn(name = "author_id", nullable = false)
    private User author;
    
    @Column(columnDefinition = "TEXT", nullable = false)
    private String content;
    
    @ManyToOne
    @JoinColumn(name = "parent_id")
    private Comment parentComment;  // For threaded replies
    
    @OneToMany(mappedBy = "parentComment")
    private List<Comment> replies = new ArrayList<>();
    
    @ElementCollection
    @CollectionTable(name = "comment_mentions")
    private Set<String> mentions = new HashSet<>();  // @mentioned usernames
    
    @OneToMany(mappedBy = "comment", cascade = CascadeType.ALL)
    private List<Attachment> attachments = new ArrayList<>();
    
    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    @Column(nullable = false)
    private LocalDateTime updatedAt;
    
    @Version
    private Long version;  // Optimistic locking for edits
}
```

### TicketHistory Entity (Immutable Audit Trail)
```java
@Entity
@Table(name = "ticket_history", indexes = {
    @Index(name = "idx_history_ticket", columnList = "ticket_id"),
    @Index(name = "idx_history_changed_at", columnList = "changed_at")
})
public class TicketHistory {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne
    @JoinColumn(name = "ticket_id", nullable = false)
    private Ticket ticket;
    
    @Column(length = 50, nullable = false)
    private String fieldName;  // status, priority, assignee, title, description
    
    @Column(columnDefinition = "TEXT")
    private String oldValue;
    
    @Column(columnDefinition = "TEXT")
    private String newValue;
    
    @ManyToOne
    @JoinColumn(name = "changed_by", nullable = false)
    private User changedBy;
    
    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime changedAt;
    
    @Column(nullable = false)
    private String changeType;  // UPDATE, STATUS_CHANGE, ASSIGNMENT, etc.
}
```

### User Entity
```java
@Entity
@Table(name = "users", uniqueConstraints = {
    @UniqueConstraint(columnNames = "username"),
    @UniqueConstraint(columnNames = "email")
})
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(unique = true, length = 50, nullable = false)
    private String username;
    
    @Column(unique = true, length = 100, nullable = false)
    private String email;
    
    @Column(length = 255, nullable = false)
    private String passwordHash;
    
    @Column(length = 100)
    private String fullName;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private UserRole role;  // REQUESTER, AGENT, MANAGER, ADMIN
    
    @Column(nullable = false)
    private Boolean active = true;
    
    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    @Column(nullable = false)
    private LocalDateTime updatedAt;
}
```

### Attachment Entity
```java
@Entity
@Table(name = "attachments")
public class Attachment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne
    @JoinColumn(name = "ticket_id")
    private Ticket ticket;
    
    @ManyToOne
    @JoinColumn(name = "comment_id")
    private Comment comment;
    
    @Column(nullable = false)
    private String fileName;
    
    @Column(nullable = false)
    private String fileUrl;  // S3 or CDN URL
    
    @Column(nullable = false)
    private Long fileSize;
    
    @Column(length = 50)
    private String mimeType;
    
    @ManyToOne
    @JoinColumn(name = "uploaded_by", nullable = false)
    private User uploadedBy;
    
    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime uploadedAt;
}
```

## Relationships Summary

```
User (1) ──────M─── Ticket (as reporter)
User (1) ──────M─── Ticket (as assignee)
User (1) ──────M─── Comment (as author)
User (1) ──────M─── Attachment (as uploader)

Ticket (1) ──────M─── Comment
Ticket (1) ──────M─── TicketHistory
Ticket (1) ──────M─── Attachment

Comment (1) ──────M─── Attachment
Comment (0..1) ─M── Comment (parent_id, for threading)

User M────M Ticket (watchers join table)
```

## DTO Contracts

### TicketCreateRequest
```json
{
  "title": "string (required, 1-255 chars)",
  "description": "string (required, 1-5000 chars)",
  "priority": "LOW | MEDIUM | HIGH | CRITICAL",
  "assigneeId": "number (optional)"
}
```

### TicketUpdateRequest
```json
{
  "title": "string (optional)",
  "description": "string (optional)",
  "priority": "LOW | MEDIUM | HIGH | CRITICAL (optional)",
  "assigneeId": "number (optional)"
}
```

### TicketResponse
```json
{
  "id": 123,
  "key": "TKT-100",
  "title": "string",
  "description": "string",
  "status": "OPEN",
  "priority": "MEDIUM",
  "reporter": { "id": 1, "username": "john" },
  "assignee": { "id": 2, "username": "jane" },
  "comments": [ { ... } ],
  "attachments": [ { ... } ],
  "createdAt": "2026-09-23T10:00:00Z",
  "updatedAt": "2026-09-23T10:00:00Z",
  "firstResponseAt": "2026-09-23T10:05:00Z",
  "resolvedAt": null,
  "version": 5
}
```

## State Transition Tracking
Every status change is recorded in `ticket_history` table:
- Old status value
- New status value
- Timestamp of change
- User who made the change
- Change reason (optional)

This enables audit trails, SLA tracking, and time-series analytics.

## Constraints & Invariants
1. Ticket status must be one of: OPEN, IN_PROGRESS, RESOLVED, CLOSED, CANCELLED
2. Only valid transitions are allowed (enforced at service layer & DB triggers)
3. CLOSED tickets cannot be modified (read-only after closure)
4. CANCELLED tickets cannot be reopened
5. Comments can always be added, even to CLOSED tickets
6. Attachments have size limits (max 10MB per file, 100MB per ticket)
7. User must be ACTIVE to modify tickets
8. All timestamps are stored in UTC
