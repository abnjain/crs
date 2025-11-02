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


Navigate into the project folder and install dependencies both apps:
```
cd apps/backend
```
```
npm install
```
```
cd apps/frontend
```
```
npm install
```

Start the development server:
```
npm run dev
```


Access module APIs (for example):
```
/api/v1/faculty

/api/v1/alumni

/api/v1/events

/api/v1/library
```


## License

This project is licensed under the free to use License.

```

If you like, I can **generate a version with badges**, or a **detailed API/end-point section** (for each of the four modules) for the README.md. Would you like that?
::contentReference[oaicite:3]{index=3}

```

