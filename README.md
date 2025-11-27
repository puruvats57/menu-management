# Digital Menu Management System

A comprehensive Digital Menu Management System for restaurants built with the T3 Stack. This platform allows restaurant owners to efficiently manage their menus and enables customers to view them digitally through QR codes or shared links.

## Technology Stack

- **T3 Stack** - Next.js, tRPC, Prisma, TypeScript
- **Prisma** - ORM for database management
- **PostgreSQL** - Database (hosted on Neon)
- **shadcn/ui** - UI component library
- **Tailwind CSS** - Styling
- **Resend** - Email service for verification codes
- **QRCode** - QR code generation

## Features

### User Management
- Email-based registration and login
- Email verification via 6-digit code
- User profiles with full name and country

### Restaurant Management
- Create and manage multiple restaurants
- Each restaurant has a name and location
- Full CRUD operations for restaurants

### Menu Management
- Create categories (e.g., Starters, Main Course, Desserts)
- Add dishes under categories
- Dishes can belong to multiple categories
- Each dish includes:
  - Name
  - Image (URL)
  - Description
  - Spice level (0-5, optional)
  - Price

### Customer Access
- View restaurant menus via QR code
- View restaurant menus via shared link
- Fixed category tabs at the top while scrolling
- Floating menu button for quick navigation
- Responsive design matching the provided UI reference

## Setup Instructions

### Prerequisites

- Node.js 18+ installed
- PostgreSQL database (Neon account recommended)
- Resend account for email sending

### Installation

1. **Clone the repository and install dependencies:**

```bash
npm install
```

2. **Set up environment variables:**

Create a `.env` file in the root directory:

```env
DATABASE_URL="your-postgresql-connection-string"
RESEND_API_KEY="your-resend-api-key"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

3. **Set up the database:**

```bash
# Generate Prisma client
npm run postinstall

# Run migrations
npm run db:push
```

4. **Start the development server:**

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## Project Structure

```
src/
├── app/
│   ├── (auth)/
│   │   └── login/          # Login/Register page
│   ├── dashboard/          # Admin dashboard
│   │   └── restaurant/[id]/ # Restaurant management
│   ├── menu/[restaurantId]/ # Public menu view
│   └── api/trpc/           # tRPC API endpoint
├── components/
│   └── ui/                 # shadcn/ui components
├── server/
│   ├── api/
│   │   └── routers/        # tRPC routers
│   ├── auth.ts             # Authentication utilities
│   └── db.ts               # Prisma client
└── trpc/                   # tRPC client setup
```

## Usage

### For Restaurant Owners

1. **Register/Login:**
   - Go to `/login`
   - Enter your email
   - You'll receive a verification code via email
   - Enter the code to log in

2. **Create a Restaurant:**
   - After logging in, click "Create Restaurant"
   - Enter restaurant name and location

3. **Manage Menu:**
   - Click "Manage Menu" on a restaurant
   - Create categories (e.g., "Starters", "Main Course")
   - Add dishes to categories
   - Each dish can belong to multiple categories

4. **Share Menu:**
   - Click "View Public Menu" to see the customer view
   - Share the link or QR code with customers

### For Customers

1. **Access Menu:**
   - Scan the QR code or open the shared link
   - Browse categories using the tabs at the top
   - Use the floating menu button for quick navigation

## Database Schema

- **User** - User accounts with email verification
- **Session** - User sessions for authentication
- **VerificationCode** - Email verification codes
- **Restaurant** - Restaurant information
- **Category** - Menu categories
- **Dish** - Menu items
- **DishCategory** - Many-to-many relationship between dishes and categories

## Deployment

### Vercel Deployment

1. Push your code to GitHub
2. Import the project in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

### Environment Variables for Production

Make sure to set:
- `DATABASE_URL` - Your Neon PostgreSQL connection string
- `RESEND_API_KEY` - Your Resend API key
- `NEXT_PUBLIC_APP_URL` - Your production URL (e.g., `https://your-app.vercel.app`)

## Image Upload

Currently, the system supports image URLs. For production, consider integrating:
- Cloudinary
- AWS S3
- Vercel Blob Storage

You can add an image upload API route and update the dish creation form to support file uploads.

## License

MIT
