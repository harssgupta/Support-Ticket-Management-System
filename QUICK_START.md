# Quick Start Guide - Support Ticket Hub

## Prerequisites

- **Java 21** (OpenJDK or equivalent)
- **MySQL 8.0+** running on localhost:3306
- **Node.js 20+** (for frontend)

## 1. Prepare MySQL Database

```bash
# Connect to MySQL
mysql -u root -p

# Create database
CREATE DATABASE ticketing_tool;

# Exit MySQL
exit
```

**Default Credentials:**
- Host: `localhost:3306`
- Database: `ticketing_tool`
- Username: `root`
- Password: `password`

## 2. Run Backend

### Option A: Using JAR (Already Built)

```bash
cd /home/harsh-gupta/Downloads/support-ticket-hub
java -jar backend/target/sth-backend-1.0.0.jar
```

Backend runs on: `http://localhost:8080`

**Expected Output:**
```
2026-09-23T19:45:30... INFO 12345 --- [main] o.s.b.w.e.t.TomcatWebServer : Tomcat started on port(s): 8080
2026-09-23T19:45:31... INFO 12345 --- [main] c.s.SupportTicketHubApplication : Started SupportTicketHubApplication in X.XXX seconds
```

### Option B: Build & Run with Maven

```bash
export MAVEN_HOME=/tmp/apache-maven-3.9.6
cd backend
$MAVEN_HOME/bin/mvn clean package -DskipTests
java -jar target/sth-backend-1.0.0.jar
```

## 3. Run Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on: `http://localhost:3000`

## 4. Access Application

1. **Frontend**: Open `http://localhost:3000` in browser
2. **Login** with demo credentials:
   - Username: `john`
   - Password: `password123`

3. **API Documentation**: `http://localhost:8080/swagger-ui.html`

## Troubleshooting

### MySQL Connection Error
- Verify MySQL is running: `mysql -u root -p`
- Check connection in `backend/src/main/resources/application.yml`
- Ensure database exists: `CREATE DATABASE ticketing_tool;`

### Flyway Migration Error
- Check MySQL user has permissions: `GRANT ALL ON ticketing_tool.* TO 'root'@'localhost';`
- Clear migrations if needed: `DROP DATABASE ticketing_tool; CREATE DATABASE ticketing_tool;`

### Port Already in Use
- Backend (8080): `lsof -i :8080`
- Frontend (3000): `lsof -i :3000`

### Java Version Error
- Verify Java 21: `java -version`
- Update `JAVA_HOME` if needed

## Project Structure

```
support-ticket-hub/
├── backend/                    # Spring Boot REST API
│   ├── src/main/java/         # Application code
│   ├── src/main/resources/    # Config + migrations
│   └── target/                # Build output (JAR)
├── frontend/                   # Next.js React app
│   ├── src/app/               # Pages + components
│   └── public/                # Static assets
└── docs/                       # Documentation
```

## What's Implemented

✅ Create/list/view/update tickets  
✅ Ticket state transitions (NEWLY_OPENED → IN_WORK → AWAITING_RESOLUTION → CLOSURE)  
✅ Comments with threading  
✅ Search & filter by state/severity  
✅ Role-based access (REQUESTER, SUPPORT_AGENT, SUPERVISOR, SYSTEM_ADMIN)  
✅ Optimistic locking & audit trail  
✅ Input validation (client + server)  
✅ Error handling with meaningful messages  

## API Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/v1/issues` | Create ticket |
| GET | `/api/v1/issues` | List tickets |
| GET | `/api/v1/issues/{id}` | Get details |
| PATCH | `/api/v1/issues/{id}` | Update fields |
| PATCH | `/api/v1/issues/{id}/state` | Change state |
| POST | `/api/v1/issues/{id}/messages` | Add comment |

Full API spec: `http://localhost:8080/swagger-ui.html` (when running)

## Environment Variables

Set in `backend/src/main/resources/application.yml`:

```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/ticketing_tool
    username: root
    password: password
  jpa:
    database-platform: org.hibernate.dialect.MySQL8Dialect
```

## Database Schema

- `account_holder` - Users with roles
- `issue` - Tickets with state machine
- `issue_message` - Comments with threading
- `state_change_log` - Immutable audit trail
- `attached_file` - File attachments
- `issue_follower` - Issue watchers

## Testing

### Run All Tests
```bash
cd backend
$MAVEN_HOME/bin/mvn test
```

### Run E2E Tests
```bash
cd frontend
npx playwright test
```

## Production Deployment

For production, use `docker-compose.prod.yml`:

```bash
docker-compose -f docker-compose.prod.yml up -d
```

See [ARCHITECTURE.md](ARCHITECTURE.md) for deployment details.

---

**Status**: ✅ All 15 acceptance criteria implemented  
**Last Updated**: 2026-09-23  
**Version**: 1.0.0
