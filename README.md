# Central Repository System (CRS)

A centralized college-management system with modules for **Faculty**, **Alumni**, **Events**, and **Library** — built with secure RBAC, reusable components, with versioned APIs, well-defined/industry-wide-used folder structure and automated containerized deployment — Having MVC and Microservices Architecture.

---

## Table of Contents

1. [Overview](#overview)  
2. [Modules](#modules)  
3. [Technical Stack & Deployment](#technical-stack--deployment)  
4. [Getting Started](#getting-started)  
5. [License](#license)  

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

Access module APIs (for example):

```
/api/v1/auth
/api/v1/teachers
/api/v1/admin
/api/v1/library
/api/v1/docs
/api/v1/alumni
/api/v1/upload
/api/v1/events
```

## License  

This project is licensed under the MIT License — see the [LICENSE](./LICENSE) file for details.
