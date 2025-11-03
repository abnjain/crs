# Central Repository System (CRS)

A centralized college-management system with modules for **Faculty**, **Alumni**, **Events**, and **Library** — built with secure RBAC, reusable components, with versioned APIs, well-defined/industry-wide-used folder structure and automated containerized deployment — Having MVC and Microservices Architecture.

---

## Table of Contents

1. [Overview](#overview)  
2. [Modules](#modules)  
3. [API Routes](#api-routes)  
4. [Technical Stack & Deployment](#technical-stack--deployment)  
5. [Getting Started](#getting-started)  
6. [License](#license)  

---

## Overview  

This system aims to provide a unified platform for college administrative and academic functions — managing data and processes for faculty, alumni relations, events coordination and library resources. It emphasises modular architecture, secure role-based access control (RBAC), and production-ready deployment using containers.  

This project is live here -
<https://crs.abnjain.me/>

---

## Modules

###### SuperAdmin

Manages the complete Ecosystem.

###### Admin

Manages self profile and credentials, can manage the resources even revoke and eastablish role/permission assignments.

###### Faculty

Manages faculty profiles and credentials, academic contributions, resources and role/permission assignments.

###### Alumni

Handles alumni information, professional details, networking, and engagement activities.

###### Events

Covers scheduling, creation and management of college events, registration and tracking.

###### Library

Provides inventory and borrowing management of physical/digital resources, search/filter capabilities, and usage tracking.

---

## API Routes

Base path for all endpoints: `/api/v1`

Notes:
- Most endpoints require authentication via `Authorization: Bearer <token>`.
- Roles are enforced via RBAC; only listed roles can access the route.
- Paths below are shown relative to each module's base prefix.

### Auth (`/auth`)
- POST `/register` — Register a new user
  - Body: `email` (string, req), `password` (string, req), `phone` (string, req), `name` (string), `roles` (string|array, default "Student")
- POST `/login` — Obtain access/refresh tokens
  - Body: `email` (string, req), `password` (string, req)
- POST `/refresh` — Rotate/refresh access token
  - Body: `refresh` (string, req)
- POST `/reset/request` — Request password reset (email/OTP)
  - Body: `email` (string, req)
- POST `/reset/confirm` — Confirm password reset
  - Body: `token` (string, req), `password` (string, req)
- POST `/logout` — Logout current session (roles: user, teacher, staff, student, admin, superadmin)
- POST `/otp/send` — Send OTP
- POST `/otp/verify` — Verify OTP

User profile (auth required):
- GET `/users/me` — Get current user profile
- PATCH `/users/me` — Update current user profile
  - Body: any user fields allowed by model (e.g., `name`, `phone`)
- GET `/users/:id` — Get user by id
  - Params: `id` (string, req)
- PATCH `/users/:id/roles` — Update roles for a user
  - Params: `id` (string, req)
  - Body: `roles` (string|array, req)
- GET `/users` — List users
- POST `/revoke-all` — Revoke all tokens (roles: admin, superadmin)
<!-- 
### Students (`/students`)
- POST `/` — Create student (roles: Admin, SuperAdmin)
  - Body: `userId` (string, req), `rollNo` (string, req), `admissionYear` (number), `section` (string)
- GET `/me` — Get my student profile (roles: Student)
- PATCH `/:enrollmentNo` — Update student by enrollment no (roles: Student, Admin, SuperAdmin)
  - Params: `enrollmentNo` (string, req)
  - Body: `rollNo` (string), `admissionYear` (number), `section` (string)
- GET `/` — List students (roles: Admin, SuperAdmin)
- GET `/:enrollmentNo/idcard` — Get ID card (roles: Student, Admin, SuperAdmin)
  - Params: `enrollmentNo` (string, req)
- POST `/:enrollmentNo/idcard` — Generate ID card (roles: Admin, SuperAdmin)
  - Params: `enrollmentNo` (string, req)
  - Body: `name` (string), `course` (string), `year` (string|number) -->

### Teachers (`/teachers`)
- POST `/` — Create teacher (roles: Teacher, Admin, SuperAdmin)
  - Body: `userId` (string, req), `empCode` (string, req), `deptId` (string), `designation` (string)
- POST `/materials` — Upload material (roles: Teacher, Admin, SuperAdmin)
  - Body: `subjectId` (string, req), `title` (string, req), `fileKey` (string, req)
- GET `/upcoming-classes` — Upcoming classes (roles: Teacher)
- GET `/my-subjects` — Subjects taught by me (roles: Teacher)

### Alumni (`/alumni`)
- POST `/` — Create alumnus (roles: Admin, SuperAdmin, Alumni, Teacher)
  - Body: dynamic alumnus fields (e.g., `name`, `email`, `phone`, `enrollmentNo`, `batch`, `department`, `degree`, `graduationYear`, `currentCompany`, `currentRole`, `linkedin`, `profilePhoto` as base64 or URL)
- GET `/` — List alumni (auth)
  - Query: `q` (string), `batch` (string|number), `department` (string), `page` (number, default 1), `limit` (number, default 20)
- GET `/:id` — Get alumnus by id (auth)
  - Params: `id` (string, req)
- PATCH `/:id` — Update alumnus (roles: Admin, SuperAdmin, Alumni, Teacher) [multipart: `profilePhoto`]
  - Params: `id` (string, req)
  - Body: any alumnus fields; if multipart, `profilePhoto` as file
- DELETE `/:id` — Delete alumnus (roles: Admin, SuperAdmin, Alumni, Teacher)
  - Params: `id` (string, req)
- POST `/message` — Message selected alumni (roles: Teacher, Admin, SuperAdmin)
  - Body: `alumniIds` (array<string>, default []), `subject` (string), `body` (string)
- POST `/upload/excel` — Bulk upload alumni via Excel (roles: Teacher, Admin, SuperAdmin) [multipart: `file`]

### Events (`/events`)
- POST `/` — Create event (roles: Admin, SuperAdmin, Staff, Teacher) [multipart: `photos[]`]
  - Body: event fields (`title`, `date`, `location`, etc.)
  - Files: `photos` (array)
- GET `/` — List events (auth)
- GET `/:id` — Get event by id (auth)
  - Params: `id` (string, req)
- PATCH `/:id` — Update event (roles: Admin, SuperAdmin, Staff, Teacher) [multipart: `photos[]`]
  - Params: `id` (string, req)
  - Body: event fields to update; optional Files: `photos` (array)
- DELETE `/:id` — Delete event (roles: Admin, SuperAdmin, Staff, Teacher)
  - Params: `id` (string, req)

### Library (`/library`)
- POST `/books` — Add book (roles: Librarian, Admin, SuperAdmin)
  - Body: `title` (string, req), `author` (string, req), `isbn` (string, req)
- GET `/books` — Search/list books (auth)
  - Query: `q` (string), `author` (string), `subject` (string)
- POST `/books/:bookId/issue` — Issue a book (roles: Librarian, Admin, SuperAdmin)
  - Params: `bookId` (string, req)
  - Body: `bookId` (string, req), `userId` (string, req)
- POST `/books/:bookId/return` — Return a book (roles: Librarian, Admin, SuperAdmin)
  - Params: `bookId` (string, req)
  - Body: `loanId` (string, req)
- GET `/loans` — Current user's loans (auth)
  - Query: `studentId` (string)
- GET `/fines` — Current user's fines (auth)
  - Query: `studentId` (string)

<!-- ### Documents (`/docs`)
- POST `/` — Create document (roles: Teacher, Admin, SuperAdmin)
  - Body: `title` (string, req), `content` (string, req), plus optional fields
- GET `/` — List documents (auth)
  - Query: `q` (string), `type` (string)
- GET `/:docId` — Get signed URL for document (auth)
  - Params: `docId` (string, req)
- POST `/:docId/versions` — Add a version (roles: Teacher, Admin, SuperAdmin)
  - Params: `docId` (string, req)
  - Body: `fileKey` (string, req), `size` (number, req)
- PATCH `/:docId/visibility` — Update visibility (roles: Admin, SuperAdmin)
  - Params: `docId` (string, req)
  - Body: `visibility` (string, req) -->

<!-- ### Placements (`/placements`)
- POST `/jobs` — Create job (roles: Admin, SuperAdmin)
  - Body: job fields (e.g., `title`, `company`, `location`, `description`, ...)
- GET `/jobs` — List jobs (auth)
  - Query: `q` (string), `company` (string)
- POST `/jobs/:jobId/apply` — Apply to job (roles: Student)
  - Params: `jobId` (string, req)
  - Body: `jobId` (string, req), `resumeKey` (string, req)
- GET `/applications` — List applications (auth)
  - Query: `studentId` (string) -->

<!-- ### Assessments (`/assessments`)
- POST `/exams` — Create exam (roles: Teacher, Admin, SuperAdmin)
  - Body: `title` (string, req), `subjectId` (string, req), `date` (ISO string, req), `duration` (number|string, req), `totalMarks` (number, req)
- GET `/exams` — List exams (auth)
  - Query: `subjectId` (string)
- POST `/marks` — Upload marks in bulk (roles: Teacher, Admin, SuperAdmin)
  - Body: `examId` (string, req), `entries` (array<{ studentId: string, marksObtained: number }>, req)
- GET `/marks` — Query marks (auth)
  - Query: `studentId` (string), `examId` (string)
- GET `/gradesheet/:studentId/:term` — Get gradesheet (auth)
  - Params: `studentId` (string, req), `term` (string|number, req) -->

<!-- ### Notices (`/notices`)
- POST `/` — Create notice (roles: Admin, Staff, SuperAdmin)
  - Body: notice fields (e.g., `title`, `body`, `audience`, `publishAt`, `expiresAt`, `pinned`, `priority`)
- GET `/` — List notices (auth)
- POST `/messages` — Send notice message (auth) [placeholder]
- GET `/messages/thread/:userId` — Get message thread (auth) [placeholder]
  - Params: `userId` (string, req) -->

### Uploads (`/upload`)
- POST `/` — Upload a file [multipart: `file`]
  - Files: `file` (single)
  - Body (optional): `type` (string) to route processing

<!-- ### Analytics (`/analytics`)
- GET `/overview` — System overview (roles: Admin, SuperAdmin)
- GET `/performance` — Performance metrics (roles: Teacher, Admin, SuperAdmin)
  - Query: `subjectId` (string), `classId` (string)
- GET `/library` — Library analytics (roles: Admin, SuperAdmin) -->

### Admin (`/admin`)
- POST `/users` — Create user (roles: Admin, SuperAdmin)
  - Body: `email` (string, req), `password` (string, req), `phone` (string, req), `name` (string), `roles` (string|array)
- GET `/overview` — Admin overview (roles: Admin, SuperAdmin)

### Health (`/health`)
- GET `/` — Health check (no auth)

---

## Technical Stack & Deployment

- **Backend and Frontend**: Built primarily in JavaScript (using Nodejs, Reactjs, Shadcn, Tailwind).
- **Deployment**: Containerised using Docker (and orchestration tools) for automated, repeatable deployments.
- **Security**: Role-Based Access Control (RBAC) to ensure secure access based on user roles.

---

### Getting Started

Clone the repository:

```
git clone https://github.com/abnjain/crs.git
```

Navigate into the root project folder and install dependencies both apps:

```
npm run install-all
```

or

```
npm install
```

To uninstall and reinstall packages (works in git bash or linux/unix variants) :

```
npm run reinstall
```

or

```
npm run uninstall
```

To run both the servers simultaneously:

```
npm run dev
```

To build the packages:

```
npm run build
```

To preview build the packages:

```
npm run preview
```

To start the server after the complete built packages:

```
npm run start
```

## License  

This project is licensed under the MIT License — see the [LICENSE](./LICENSE) file for details.
