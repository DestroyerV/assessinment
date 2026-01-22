# RBAC Admin Dashboard

A modern Role-Based Access Control (RBAC) administration system built with Next.js, featuring an AI-powered natural language interface for managing roles and permissions.

## What is Role-Based Access Control (RBAC)?

RBAC is a security model that controls what users can do in a system based on their assigned **roles**. Instead of giving permissions directly to each user, you:

1. **Create Roles** – Define job functions (e.g., Admin, Editor, Viewer)
2. **Create Permissions** – Define specific actions (e.g., `posts:create`, `users:delete`)
3. **Assign Permissions to Roles** – Give each role the permissions it needs
4. **Assign Roles to Users** – Users inherit all permissions from their roles

### Simple Example

```
┌─────────────┐      ┌─────────────┐      ┌──────────────────┐
│    User     │─────▶│    Role     │─────▶│   Permissions    │
│   (Alice)   │      │   (Editor)  │      │  - posts:create  │
└─────────────┘      └─────────────┘      │  - posts:edit    │
                                          │  - posts:delete  │
                                          └──────────────────┘
```

Alice is assigned the "Editor" role → She automatically gets `posts:create`, `posts:edit`, and `posts:delete` permissions.

### Why Use RBAC?

- **Simplified Management** – Manage roles instead of individual user permissions
- **Scalability** – Easy to add new users by just assigning roles
- **Security** – Clear visibility of who can do what
- **Compliance** – Easy to audit access rights

---

## Features

- 🔐 **User Authentication** – Secure login/signup with JWT tokens
- 👥 **Role Management** – Create, edit, and delete roles
- 🔑 **Permission Management** – Define granular permissions
- 📊 **Permission Matrix** – Visual grid to toggle role-permission assignments
- 🤖 **AI Commander** – Manage RBAC using natural language (powered by Google Gemini)
- 🎨 **Modern UI** – Built with shadcn/ui and Tailwind CSS

---

## Tech Stack

| Technology | Purpose |
|------------|---------|
| **Next.js 16** | React framework with App Router |
| **TypeScript** | Type-safe development |
| **Prisma** | Database ORM |
| **PostgreSQL** | Database |
| **Tailwind CSS** | Styling |
| **shadcn/ui** | UI components |
| **Google Gemini** | AI-powered commands |
| **JWT** | Authentication |

---

## Database Schema

The RBAC system uses five interconnected tables:

```
┌──────────────┐       ┌──────────────┐       ┌──────────────┐
│    Users     │       │    Roles     │       │ Permissions  │
├──────────────┤       ├──────────────┤       ├──────────────┤
│ id           │       │ id           │       │ id           │
│ email        │       │ name         │       │ name         │
│ password_hash│       │ description  │       │ description  │
└──────────────┘       └──────────────┘       └──────────────┘
       │                    │    │                    │
       │                    │    │                    │
       ▼                    ▼    ▼                    ▼
   ┌────────────────┐    ┌─────────────────────┐
   │   UserRoles    │    │  RolePermissions    │
   ├────────────────┤    ├─────────────────────┤
   │ user_id (FK)   │    │ role_id (FK)        │
   │ role_id (FK)   │    │ permission_id (FK)  │
   └────────────────┘    └─────────────────────┘
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm
- PostgreSQL database

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd assessinment
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   
   Create a `.env` file in the root directory:
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/rbac_db"
   JWT_SECRET="your-super-secret-jwt-key"
   GEMINI_API_KEY="your-gemini-api-key"  # Optional: for AI Commander
   ```

4. **Run database migrations**
   ```bash
   pnpm prisma migrate dev
   ```

5. **Start the development server**
   ```bash
   pnpm dev
   ```

6. **Open the app**
   
   Visit [http://localhost:3000](http://localhost:3000)

---

## Project Structure

```
src/
├── app/
│   ├── api/                    # API Routes
│   │   ├── auth/               # Authentication endpoints
│   │   │   ├── login/
│   │   │   ├── logout/
│   │   │   ├── register/
│   │   │   └── me/
│   │   ├── roles/              # Role CRUD operations
│   │   ├── permissions/        # Permission CRUD operations
│   │   └── agent/              # AI Commander endpoint
│   ├── auth/                   # Auth pages (login, signup)
│   └── dashboard/              # Dashboard pages
│       ├── roles/              # Role management UI
│       ├── permissions/        # Permission management UI
│       └── matrix/             # Permission matrix UI
├── components/                 # React components
├── lib/                        # Utility functions
└── generated/prisma/           # Generated Prisma client
```

---

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login user |
| POST | `/api/auth/logout` | Logout user |
| GET | `/api/auth/me` | Get current user |

### Roles
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/roles` | List all roles |
| POST | `/api/roles` | Create a role |
| GET | `/api/roles/[id]` | Get role by ID |
| PUT | `/api/roles/[id]` | Update role |
| DELETE | `/api/roles/[id]` | Delete role |

### Permissions
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/permissions` | List all permissions |
| POST | `/api/permissions` | Create a permission |
| GET | `/api/permissions/[id]` | Get permission by ID |
| PUT | `/api/permissions/[id]` | Update permission |
| DELETE | `/api/permissions/[id]` | Delete permission |

### Role-Permission Assignment
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/roles/[id]/permissions` | Assign permission to role |
| DELETE | `/api/roles/[id]/permissions/[permissionId]` | Remove permission from role |

---

## AI Commander

The AI Commander feature lets you manage RBAC using natural language. Examples:

- *"Create an editor role with description 'Can edit content'"*
- *"Create permissions for posts: create, edit, delete"*
- *"Give the editor role the posts:edit permission"*
- *"Create a moderator role and assign it posts:delete"*

> **Note:** Requires a valid `GEMINI_API_KEY` in your environment variables.

---

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start development server with Turbopack |
| `pnpm build` | Build for production |
| `pnpm start` | Start production server |
| `pnpm lint` | Run Biome linter |
| `pnpm format` | Format code with Biome |

---

