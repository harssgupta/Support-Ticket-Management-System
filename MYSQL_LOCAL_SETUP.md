# MySQL Local Setup Guide

To run the application locally with MySQL instead of PostgreSQL:

## 1. Update `backend/pom.xml`

Replace:
```xml
<!-- PostgreSQL Driver -->
<dependency>
  <groupId>org.postgresql</groupId>
  <artifactId>postgresql</artifactId>
  <scope>runtime</scope>
</dependency>
```

With:
```xml
<!-- MySQL Driver -->
<dependency>
  <groupId>com.mysql</groupId>
  <artifactId>mysql-connector-java</artifactId>
  <version>8.0.33</version>
  <scope>runtime</scope>
</dependency>
```

## 2. Update `backend/src/main/resources/application.yml`

Replace PostgreSQL config:
```yaml
datasource:
  url: ${DB_URL}
  username: ${DB_USERNAME}
  password: ${DB_PASSWORD}
...
jpa:
  database-platform: org.hibernate.dialect.PostgreSQLDialect
```

With MySQL config:
```yaml
datasource:
  url: jdbc:mysql://localhost:3306/ticketing_tool?autoReconnect=true&useUnicode=yes&characterEncoding=UTF-8
  username: root
  password: password
...
jpa:
  database-platform: org.hibernate.dialect.MySQL8Dialect
```

## 3. Update Database Migrations

Convert PostgreSQL syntax to MySQL in:
- `backend/src/main/resources/db/migration/V001__init_core_tables.sql`
- `backend/src/main/resources/db/migration/V002__init_issue_tables.sql`

Key changes:
- `BIGSERIAL` → `BIGINT AUTO_INCREMENT`
- `TIMESTAMPTZ` → `DATETIME`
- `DEFAULT NOW()` → `DEFAULT CURRENT_TIMESTAMP`
- Remove `COMMENT ON` statements (use inline comments instead)
- Add `ENGINE=InnoDB DEFAULT CHARSET=utf8mb4` to all CREATE TABLE statements

## 4. Setup MySQL Database

```bash
# Start MySQL (if not running)
mysql -u root -p

# Create database
CREATE DATABASE ticketing_tool;

# Exit MySQL
exit
```

## 5. Run Application

```bash
cd backend
./mvnw clean install
./mvnw spring-boot:run
```

Flyway will automatically create tables from migrations.

## 6. Alternative: Use Docker MySQL

```bash
docker run --name mysql-ticketing \
  -e MYSQL_ROOT_PASSWORD=password \
  -e MYSQL_DATABASE=ticketing_tool \
  -p 3306:3306 \
  -d mysql:8.0
```

Then run the application as shown above.

## Default Credentials

- **Database**: `ticketing_tool`
- **Username**: `root`
- **Password**: `password`
- **Host**: `localhost:3306`

## Demo Users (created by seed script)

- **Username**: `john`  
  **Password**: `password123`

- **Username**: `jane`  
  **Password**: `password123`

## Verify Connection

After running migrations, you should see tables in MySQL:
```sql
SHOW TABLES;
```

Expected tables:
- `account_holder`
- `issue`
- `issue_message`
- `state_change_log`
- `attached_file`
- `issue_follower`

---

**Note**: The application works with both PostgreSQL and MySQL. Update only the driver, dialect, and migration syntax as shown above.
