# Campus Transit

A modern, real-time campus shuttle tracking application built with React, TypeScript, and Vite. This application provides a comprehensive solution for universities to manage and track their shuttle fleet, allowing students to track buses in real-time, drivers to manage their routes, and administrators to oversee fleet operations.

## Features

### Student Portal
- **Real-time Bus Tracking**: View all buses on a map with their current locations
- **Route Information**: Access detailed information about all shuttle routes
- **Seat Availability**: Check available seats on each bus before boarding
- **Stop Times**: View estimated arrival times at each stop

### Driver Interface
- **Live Navigation**: See current location and navigate through assigned routes
- **Stop Management**: Update bus status at each stop
- **Passenger Count**: Track and update seat availability
- **Emergency Reporting**: Quickly report breakdowns or weather delays
- **Trip Controls**: Start, stop, and resume trips

### Admin Dashboard
- **Fleet Overview**: Monitor all buses in the fleet
- **Route Analytics**: View performance metrics and route statistics
- **Alert Management**: Track and manage system alerts
- **Route Management**: Add and modify shuttle routes

## Technology Stack

- **Frontend**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Routing**: React Router
- **Icons**: Lucide React
- **State Management**: React Context API

## Getting Started

### Prerequisites

- Node.js 18 or higher
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd campus-transit
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

## Authentication

The application uses simple email-based authentication. Users can log in with any email address and password (minimum 3 characters). The role is automatically determined based on the email:

- **Student**: Default role for most emails
- **Driver**: Emails containing "driver"
- **Admin**: Emails containing "admin"

### Demo Accounts

- Student: `student@university.edu` / any password
- Driver: `driver@university.edu` / any password  
- Admin: `admin@university.edu` / any password

## Project Structure

```
src/
├── components/       # Reusable UI components
│   └── Layout.tsx   # Main layout wrapper
├── context/          # React Context for state management
│   ├── BusContext.ts
│   └── BusProvider.tsx
├── data/             # Mock data and static data
│   └── mockData.ts
├── pages/            # Page components
│   ├── Login.tsx
│   ├── Student.tsx
│   ├── Driver.tsx
│   └── Admin.tsx
├── utils/           # Utility functions
│   └── geo.ts       # Geographic calculations
├── types/           # TypeScript type definitions
│   └── index.ts
├── App.tsx          # Main application component
└── main.tsx         # Application entry point
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build

## License

Free-to-use
