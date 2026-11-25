# Employee Attendance System API

REST API for admin authentication, employee management, and employee attendance. The API is served by Express and stores data in MongoDB.

## Run locally

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy `.env.example` to `.env` and set the required values:

   ```env
   ENV=development
   PORT=8000
   MONGO_URL=mongodb://<host>:<port>/<database>
   JWT_SECRET=<a-long-random-secret>
   JWT_EXPIRES_IN=1h
   SALT_ROUNDS=10
   ```

   `MONGO_URL` and `JWT_SECRET` must not be empty. Employee creation uses a MongoDB transaction, so the MongoDB deployment must support transactions (for example, a replica set).

3. Start the server:

   ```bash
   npm run dev
   ```

   The default base URL is `http://localhost:8000`.

## Authentication

Log in with an existing admin account to receive an access token. Admin employee-management and attendance endpoints require:

```http
Authorization: Bearer <access_token>
```

The admin routes also verify that the account is active and has the `admin` role. Creating an employee through the API assigns the default `emp` role; it does not create an admin account.

## Endpoints

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| `POST` | `/api/v1/admin/auth/login` | No | Log in and receive an access token. |
| `GET` | `/api/v1/admin/employees` | Admin | List active employees. |
| `GET` | `/api/v1/admin/employees/:id` | Admin | Get an active employee by numeric `emId`. |
| `POST` | `/api/v1/admin/employees` | Admin | Add an employee. |
| `PATCH` | `/api/v1/admin/employees/:id` | Admin | Update an employee by numeric `emId`. |
| `PATCH` | `/api/v1/admin/employees/check-in/:id` | Admin | Record today's check-in for an employee. |
| `PATCH` | `/api/v1/admin/employees/check-out/:id` | Admin | Record today's check-out for an employee. |
| `GET` | `/api/v1/admin/employees/:id/attendance` | Admin | View an employee's attendance history. |
| `DELETE` | `/api/v1/admin/employees/:id` | Admin | Deactivate an employee (soft delete). |

For employee routes, `:id` means the numeric employee ID (`emId`), not MongoDB's `_id`.

## Request details

### Log in

`POST /api/v1/admin/auth/login`

```json
{
  "email": "admin@example.com",
  "password": "your-password"
}
```

The successful response includes `access_token` and the admin object in `data`.

### List employees

`GET /api/v1/admin/employees?page=1&limit=10`

Both query parameters are optional; they default to page `1` and limit `10`. The response contains the employee array in `data` and page information in `pagination`. Only active employees are listed.

### Get one employee

`GET /api/v1/admin/employees/{emId}`

Returns the active employee in `data`.

### Add an employee

`POST /api/v1/admin/employees`

All of these fields are required:

```json
{
  "email": "jane@example.com",
  "firstName": "Jane",
  "lastName": "Doe",
  "department": "Engineering",
  "designation": "Developer",
  "joiningDate": "2026-11-25"
}
```

The API assigns `emId`, sets `isActive` to `true`, and defaults `role` to `emp`. The successful response uses HTTP `201` and returns the created employee in `data`.

### Update an employee

`PATCH /api/v1/admin/employees/{emId}`

Send at least one supported field. Updates may include `email`, `firstName`, `lastName`, `department`, `designation`, `joiningDate`, or `isActive`.

```json
{
  "department": "Operations",
  "designation": "Senior Developer"
}
```

The response returns the updated employee in `data`. Fields such as `emId`, `role`, and `password` cannot be changed through this endpoint.

### Check in

`PATCH /api/v1/admin/employees/check-in/{emId}`

No request body is required. The server records the current time and a UTC calendar date. A second check-in for the same employee on that date returns HTTP `409`.

### Check out

`PATCH /api/v1/admin/employees/check-out/{emId}`

No request body is required. The employee must have an open check-in for the current UTC calendar date. The server records the current time. A missing check-in, a repeated check-out, or a checkout time earlier than check-in returns HTTP `409`.

### View attendance history

`GET /api/v1/admin/employees/{emId}/attendance?page=1&limit=10`

`page` defaults to `1`; `limit` defaults to `10` and must be from `1` to `100`. Results are sorted newest date first. The response has employee details and an `attendance` array in `data`, with pagination metadata in `attendancePagination`.

Each attendance item contains `AttendanceId`, `emId`, `date`, `checkIn`, `checkOut`, and `status`.

### Deactivate an employee

`DELETE /api/v1/admin/employees/{emId}`

This is a soft delete: the employee is marked inactive and assigned a deletion timestamp. The response returns the employee's `emId` and `isActive` value.

## cURL examples

The examples use the default local URL. Replace the login credentials and `YOUR_ADMIN_TOKEN` with an admin account and the token returned by login. Replace `EMPLOYEE_ID` with the employee's numeric `emId`.

### Login

```bash
curl --request POST "http://localhost:8000/api/v1/admin/auth/login" \
  --header "Content-Type: application/json" \
  --data-raw "{\"email\":\"admin@example.com\",\"password\":\"your-password\"}"
```

### List employees

```bash
curl "http://localhost:8000/api/v1/admin/employees?page=1&limit=10" \
  --header "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

### Get one employee

```bash
curl "http://localhost:8000/api/v1/admin/employees/EMPLOYEE_ID" \
  --header "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

### Add an employee

```bash
curl --request POST "http://localhost:8000/api/v1/admin/employees" \
  --header "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  --header "Content-Type: application/json" \
  --data-raw "{\"email\":\"jane@example.com\",\"firstName\":\"Jane\",\"lastName\":\"Doe\",\"department\":\"Engineering\",\"designation\":\"Developer\",\"joiningDate\":\"2026-11-25\"}"
```

### Update an employee

```bash
curl --request PATCH "http://localhost:8000/api/v1/admin/employees/EMPLOYEE_ID" \
  --header "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  --header "Content-Type: application/json" \
  --data-raw "{\"department\":\"Operations\",\"designation\":\"Senior Developer\"}"
```

### Check in

```bash
curl --request PATCH "http://localhost:8000/api/v1/admin/employees/check-in/EMPLOYEE_ID" \
  --header "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

### Check out

```bash
curl --request PATCH "http://localhost:8000/api/v1/admin/employees/check-out/EMPLOYEE_ID" \
  --header "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

### Get attendance history

```bash
curl "http://localhost:8000/api/v1/admin/employees/EMPLOYEE_ID/attendance?page=1&limit=10" \
  --header "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

### Deactivate an employee

```bash
curl --request DELETE "http://localhost:8000/api/v1/admin/employees/EMPLOYEE_ID" \
  --header "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

## Errors

Errors use a JSON response with `success: false`, a `message`, and usually `data: null`. Common status codes are:

| Status | Meaning |
| --- | --- |
| `400` | Invalid request data, employee ID, attendance pagination values, or missing authentication token. |
| `401` | Invalid or expired authentication token. |
| `403` | Account is not an active admin. |
| `404` | Employee not found. An existing employee with no attendance records returns an empty attendance array. |
| `409` | Duplicate email/record or invalid repeated attendance action. |
| `500` | Unexpected server error. |
