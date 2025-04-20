

https://github.com/user-attachments/assets/5e050714-9fd4-4eeb-9bc6-874d12df4b8b

# Conditioning Dhamaka - Frontend

A React-based frontend application for an AC service booking platform with user authentication and role-based access.

## Features

- 🔐 Multi-role Authentication System
  - Customer Login/Registration
  - Staff Login (Admin/Rider)
  - Google Authentication for Customers
  
- 👥 User Roles
  - Customers: Book services, manage appointments
  - Admin: Manage services and bookings
  - Riders: Handle service deliveries

- 🎯 Core Functionalities
  - Secure login/registration system
  - Role-based access control
  - Password validation and confirmation
  - Session management with cookies
  - Form validation and error handling

## Tech Stack

- React
- TypeScript
- Tailwind CSS
- Lucide React (Icons)
- Zustand (State Management)

## Getting Started

1. Clone the repository:
```bash
git clone https://github.com/your-username/ConditioningDhamaka-Frontend.git
cd ConditioningDhamaka-Frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

## Environment Setup

Create a `.env` file in the root directory:

```env
VITE_API_URL=http://localhost:5000
```

## Testing Credentials

For testing purposes, use the following credentials:

### Admin Access
- Email: admin@example.com
- Password: password123

### Rider Access
- Email: rider1@example.com or rider2@example.com
- Password: password123

### Customer Access
- Register a new account or use Google Sign-in

## API Integration

The frontend connects to a MongoDB backend with the following endpoints:

- POST `/auth/login` - User authentication
- POST `/auth/register` - User registration
- GET `/auth/me` - Session verification


## License

MIT License - Feel free to use this project for your own purposes.
