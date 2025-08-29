# Overview

This is an Arabic accounting and inventory management system called "Ibrahim Accounting System" (نظام إبراهيم للمحاسبة). It's a full-stack web application built with React/TypeScript frontend and Node.js/Express backend, designed for small to medium businesses. The system supports multi-currency transactions (Syrian Pound, Turkish Lira, US Dollar), role-based access control, and comprehensive financial management features.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React with TypeScript and Vite for development/build tooling
- **UI Library**: shadcn/ui components built on Radix UI primitives
- **Styling**: TailwindCSS with custom Arabic font support (Cairo, Noto Sans Arabic)
- **State Management**: TanStack React Query for server state management
- **Routing**: Wouter for client-side routing
- **Form Handling**: React Hook Form with Zod validation
- **Charts**: Recharts for data visualization
- **RTL Support**: Full right-to-left layout support for Arabic interface

## Backend Architecture
- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Session Management**: Express-session with PostgreSQL session store
- **Authentication**: Session-based auth with bcrypt password hashing
- **API Design**: RESTful API with standardized error handling
- **Development**: Hot reload with Vite integration for full-stack development

## Database Design
- **Multi-tenant Architecture**: Each client has isolated data using tenant-based filtering
- **Core Entities**: Users, Tenants, Products, Revenues, Expenses, Notifications
- **Role-based Access**: Six user roles from super_admin to viewer with granular permissions
- **Currency Support**: Native support for SYP, TRY, and USD currencies
- **Session Storage**: PostgreSQL-based session persistence

## Key Features
- **Financial Management**: Revenue and expense tracking with multiple currencies
- **Inventory Management**: Product management with low-stock alerts
- **Dashboard Analytics**: Real-time charts and statistics
- **Role-based Permissions**: Hierarchical user roles with specific access controls
- **Responsive Design**: Mobile-first design with desktop optimization
- **Arabic Localization**: Full Arabic interface with proper RTL support

# External Dependencies

## Database & Infrastructure
- **Neon Database**: Serverless PostgreSQL hosting
- **Drizzle ORM**: Type-safe database operations with PostgreSQL dialect
- **Express Session**: Session management with connect-pg-simple for PostgreSQL storage

## UI & Styling
- **shadcn/ui**: Modern component library built on Radix UI
- **TailwindCSS**: Utility-first CSS framework with custom theme
- **Radix UI**: Accessible component primitives
- **Lucide React**: Icon library for consistent iconography
- **Google Fonts**: Cairo and Noto Sans Arabic fonts for proper Arabic typography

## Development Tools
- **Vite**: Fast build tool with development server
- **TypeScript**: Type safety across frontend and backend
- **Replit Integration**: Development environment optimizations
- **PostCSS**: CSS processing with Autoprefixer

## Validation & Forms
- **Zod**: Schema validation for forms and API endpoints
- **React Hook Form**: Performant form handling with validation
- **Drizzle-Zod**: Integration between Drizzle schemas and Zod validation