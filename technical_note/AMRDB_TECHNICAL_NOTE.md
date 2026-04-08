# AMRDB Frontend

Antimicrobial Resistance Database (AMRDB) - A Next.js web application for accessing and visualizing AMR data in Uganda. The frontend interfaces with a central AMR data lakehouse to provide researchers, healthcare professionals, and policymakers with powerful data access and analysis capabilities.

Live site: `https://amrdb.idi.co.ug`

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Runtime**: React 19
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui, Radix UI
- **State Management**: TanStack Query (React Query)
- **Maps**: Leaflet, react-leaflet
- **Animations**: Framer Motion
- **HTTP Client**: Axios
- **Monitoring**: Sentry
- **Form Validation**: React Hook Form (inferred from usage patterns)

## Getting Started

### Prerequisites

- Node.js 20+
- Yarn package manager

### Installation

```bash
# Install dependencies
yarn install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your configuration
```

### Development

```bash
# Run development server
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

### Build

```bash
# Production build
yarn build

# Start production server
yarn start
```

### Linting

```bash
yarn lint
```

## Project Structure

```
src/
├── app/                    # Next.js app router pages
│   ├── authenticate/       # Auth pages (login, register, reset password)
│   ├── datasets/          # Dataset pages (catalogue, details, access)
│   │   ├── admin/         # Admin management pages
│   │   ├── access/        # Dataset access requests
│   │   ├── card/          # Dataset detail views
│   │   ├── external/      # External data submission
│   │   └── publication/   # Publication listings
│   ├── models/            # ML model interface
│   ├── profile/           # User profile
│   ├── referee/           # Dataset review/validation
│   └── guide/             # Platform guide
├── components/            # React components
│   ├── ui/               # Reusable UI components (shadcn)
│   ├── homePage/         # Homepage components
│   ├── dataDetails/      # Dataset detail components
│   ├── userCatalogue/    # Data visualization components
│   └── ...               # Feature-specific components
├── lib/                  # Utilities and hooks
│   ├── hooks/           # Custom React hooks
│   └── utils/           # Helper functions
└── public/              # Static assets
```

## Key Features (Technical)

### Authentication & Authorization
- JWT-based authentication
- Role-based access control (RBAC)
- Protected routes with middleware
- Password reset flow

### Data Visualization
- Interactive choropleth maps (Leaflet)
- Resistance visualization by region

### Dataset Management
- Dataset catalogue with filtering/search
- Detailed metadata views
- Credibility scoring panel
- Variable grid display
- Download functionality (with access control)
- Request access workflow

### Admin Panel
- User management
- Dataset CRUD operations
- Access request approval
- Referee assignment

### ML Models
- Model listing and selection
- Prediction interface with form inputs
- Result visualization

### UI/UX
- Responsive design (mobile-first)
- Dark mode support (next-themes)
- Guided tour (react-joyride)
- Loading states and skeletons
- Toast notifications (sonner)

## Environment Variables

```bash
NEXT_PUBLIC_API_URL=          # Backend API URL
NEXT_PUBLIC_SENTRY_DSN=       # Sentry monitoring
# Add other required variables
```

## API Integration

This frontend connects to a backend API that interfaces with the AMR data lakehouse for:
- User authentication
- Dataset CRUD operations
- Access request management
- Model predictions
- Analytics data queries and aggregations
- Data warehouse/lakehouse operations

API client configuration: `src/lib/api/` (inferred location)

## Deployment

The application is deployed at `https://amrdb.idi.co.ug`

### Build & Deploy

```bash
yarn build
yarn start
```

Or deploy to platforms like:
- Vercel (recommended for Next.js)
- Netlify
- Docker + Nginx

## Contributing

1. Create a feature branch from `main`
2. Make changes with clear commit messages
3. Test thoroughly
4. Submit a pull request

## Monitoring

- **Error Tracking**: Sentry integration for production error monitoring
- **Performance**: Next.js built-in analytics

## License

[Add license information]

## Support

For issues or questions, contact the development team.
