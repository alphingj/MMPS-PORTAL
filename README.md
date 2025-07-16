
# MMPS Connect - School Management Portal

This is a comprehensive school management portal built with React, TypeScript, and Tailwind CSS. It provides separate dashboards and functionalities for administrators, teachers, and students.

## Tech Stack

- **Frontend:** React 18+, TypeScript, Tailwind CSS
- **Routing:** React Router (`HashRouter`)
- **Icons:** Lucide React
- **State Management:** React Context API with `useReducer`
- **PWA:** Service Worker for an offline-first App Shell
- **Backend (Recommended):** Supabase (PostgreSQL)
- **Deployment (Recommended):** Vercel

## Features

- **Progressive Web App (PWA):** The app can be installed on mobile (Android/iOS) and desktop. It uses an "App Shell" model, meaning the main application interface loads instantly, even offline. Data-related operations require an active internet connection to ensure information is always up-to-date.
- **Multi-Role System:** Distinct portals for Admins, Teachers, and Parents/Students.
- **Admin Dashboard:** Full control over students, teachers, announcements, events, exams, attendance, results, and transport.
- **Teacher Dashboard:** Manage assigned classes, create exams, mark attendance, and upload results.
- **Student Dashboard:** View attendance, results, announcements, and school events.
- **Public Pages:** View school-wide announcements and transport details without logging in.
- **CRUD Operations:** Comprehensive Create, Read, Update, Delete functionalities for all management sections.

## Progressive Web App (PWA) Support

This application is configured as a PWA using a robust **App Shell** caching strategy. Here’s how it works:
- **Instant Loading:** The core user interface (the "shell") is cached on your device. This makes the app load instantly on subsequent visits, similar to a native app.
- **Offline Shell:** The application shell will load and be visible even without an internet connection.
- **Fresh Data:** All dynamic data (student lists, announcements, etc.) and application logic are always fetched from the network. This ensures that users are always interacting with the most current information, which is critical for a database-driven application. An internet connection is required for any data-related tasks.

### How to Add App Icons

For the "Add to Home Screen" feature to work correctly with your branding, you must provide your own set of app icons. Create a folder named `icons` in the root directory of the project and add the following files. You can use an online PWA icon generator to create these from a single source image.

- `/icons/icon-192x192.png` (for Android)
- `/icons/icon-512x512.png` (for Android splash screens)
- `/icons/apple-touch-icon.png` (for iOS, preferably 180x180)

The paths are already configured in `manifest.json` and `index.html`.

## Local Development

To run this project locally, follow these steps:

1.  **Clone the repository:**
    ```bash
    git clone <repository_url>
    cd <repository_directory>
    ```

2.  **Install dependencies:**
    This project is pre-configured to use libraries via CDN (Tailwind CSS) or assumes they are available in the execution environment (`react`, `react-dom`, `lucide-react`, `react-router-dom`). If you are setting up a local build environment (e.g., with Vite or Create React App), you would run:
    ```bash
    npm install
    ```
    You would also need to install the libraries mentioned:
    ```bash
    npm install react react-dom react-router-dom lucide-react
    npm install -D @types/react @types/react-dom tailwindcss postcss autoprefixer
    ```

3.  **Start the development server:**
    ```bash
    npm run dev 
    ```
    (Or `npm start` depending on your setup)

The application currently runs on mock data located in `data/mock.ts`. All interactions are simulated locally.

---

## Deployment Guide: Vercel & Supabase

This guide explains how to deploy the application to Vercel and connect it to a real PostgreSQL database using the Supabase integration.

### Default Credentials

-   **Admin Username:** `principal@mmps`
-   **Admin Password:** `Moby@2025_`
-   **Teacher/Student Password (for mock):** `password`

### Step 1: Set up Supabase

1.  **Create a Vercel Account:** If you don't have one, sign up at [vercel.com](https://vercel.com).

2.  **Create a Supabase Project via Vercel:**
    - Go to the [Supabase integration page on Vercel](https://vercel.com/integrations/supabase).
    - Click "Add Integration".
    - Follow the prompts to connect your Vercel account and create a new Supabase project. Choose a region close to your users.

3.  **Get Supabase Credentials:**
    - Once your project is created, navigate to your project's dashboard on [supabase.com](https://supabase.com).
    - Go to **Project Settings** (the gear icon in the left sidebar).
    - Select the **API** tab.
    - You will find your **Project URL** and your **Project API Keys**. You will need the `anon` `public` key.

4.  **Create Database Tables:**
    - In your Supabase project dashboard, navigate to the **SQL Editor** (the icon with `<>` that says "SQL").
    - Click **+ New query**.
    - Copy the entire SQL script from the `schema.sql` section below and paste it into the editor.
    - Click **RUN** to create all the necessary tables and relationships.

5.  **Create the Admin User:**
    - Go to **Authentication** > **Users** in your Supabase dashboard.
    - Click **+ Add user** and create the admin user with the email `principal@mmps` and password `Moby@2025_`.
    - This is crucial for the admin login to work with a real backend.

#### `schema.sql`

```sql
-- schema.sql for MMPS Connect

-- Users table for authentication
-- Note: Supabase handles this via its auth.users table. 
-- We create a profiles table to link auth users to roles.
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE,
  full_name TEXT,
  role TEXT NOT NULL CHECK (role IN ('admin', 'teacher', 'student')),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Students Table
CREATE TABLE students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  roll_number TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  class TEXT NOT NULL,
  section TEXT,
  parent_name TEXT,
  parent_phone TEXT,
  address TEXT,
  date_of_birth DATE,
  admission_date DATE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'deactivated')),
  -- Link to auth user for student login
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Teachers Table
CREATE TABLE teachers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  subject TEXT,
  phone TEXT,
  email TEXT UNIQUE,
  qualification TEXT,
  experience_years INT,
  joining_date DATE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'deactivated')),
  -- Link to auth user for teacher login
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  -- Permissions
  can_manage_students BOOLEAN DEFAULT FALSE,
  can_manage_teachers BOOLEAN DEFAULT FALSE,
  can_manage_events BOOLEAN DEFAULT FALSE,
  can_view_all_results BOOLEAN DEFAULT FALSE,
  can_manage_attendance BOOLEAN DEFAULT FALSE,
  can_create_exams BOOLEAN DEFAULT FALSE,
  can_manage_announcements BOOLEAN DEFAULT FALSE,
  full_admin_access BOOLEAN DEFAULT FALSE
);


-- Announcements Table
CREATE TABLE announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT,
  date DATE NOT NULL,
  category TEXT,
  priority TEXT,
  target_audience TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Events Table
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  category TEXT,
  date_time TIMESTAMPTZ NOT NULL,
  venue TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive'))
);

-- Transport Routes Table
CREATE TABLE transport_routes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  route_number TEXT NOT NULL,
  route_name TEXT,
  driver_name TEXT,
  driver_phone TEXT,
  vehicle_number TEXT,
  monthly_fee INT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive'))
);

-- Bus Stops Table
CREATE TABLE bus_stops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  route_id UUID REFERENCES transport_routes(id) ON DELETE CASCADE,
  stop_name TEXT NOT NULL,
  stop_time TIME
);

-- Exams Table
CREATE TABLE exams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_name TEXT NOT NULL,
  subject TEXT,
  class TEXT,
  section TEXT,
  exam_date DATE,
  max_marks INT,
  exam_type TEXT,
  created_by_teacher_id UUID REFERENCES teachers(id)
);

-- Attendance Table
CREATE TABLE attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('present', 'absent', 'late', 'excused')),
  remarks TEXT,
  UNIQUE(student_id, date) -- Ensure one entry per student per day
);

-- Results Table
CREATE TABLE results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  exam_id UUID REFERENCES exams(id) ON DELETE CASCADE,
  marks_obtained INT,
  UNIQUE(student_id, exam_id)
);
```

### Step 2: Deploy to Vercel

1.  **Push to Git:** Push your project code to a GitHub, GitLab, or Bitbucket repository.

2.  **Import Project in Vercel:**
    - On your Vercel dashboard, click **Add New...** > **Project**.
    - Select your Git repository. Vercel will automatically detect that it's a React project.

3.  **Configure Environment Variables:**
    - In your project's settings in Vercel, go to the **Environment Variables** tab.
    - Add the following two variables:
      - `VITE_SUPABASE_URL`: Paste the **Project URL** from your Supabase API settings.
      - `VITE_SUPABASE_ANON_KEY`: Paste the `anon` `public` **Project API Key** from Supabase.
    - **Note:** The `VITE_` prefix is standard for Vite apps to expose variables to the browser. If you use Create React App, the prefix is `REACT_APP_`. Adjust accordingly.

4.  **Deploy:** Click the **Deploy** button. Vercel will build and deploy your application.

### Step 3: Connect Frontend to Supabase

To make the application use your new Supabase backend instead of mock data, you'll need to make the following changes.

1.  **Install Supabase Client:**
    ```bash
    npm install @supabase/supabase-js
    ```

2.  **Create a Supabase Client file:**
    Create a new file `services/supabaseClient.ts`:
    ```typescript
    import { createClient } from '@supabase/supabase-js';

    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error("Supabase URL or Anon Key is missing from environment variables.");
    }

    export const supabase = createClient(supabaseUrl, supabaseAnonKey);
    ```

3.  **Update API Service file:**
    - Go to `services/api.ts`.
    - Import the `supabase` client.
    - Replace the mock data functions with actual calls to your Supabase database.

    **Example: Replacing `getStudents`**
    ```typescript
    // In services/api.ts

    import { supabase } from './supabaseClient'; // Add this import
    import type { Student } from '../types'; // Ensure types are imported

    // ... other imports

    // Current mock function:
    // export const getStudents = async (): Promise<Student[]> => { ... };

    // NEW Supabase function:
    export const getStudents = async (): Promise<Student[]> => {
        const { data, error } = await supabase
            .from('students')
            .select('*');

        if (error) {
            console.error('Error fetching students:', error);
            throw error;
        }

        // You might need to map the data to match your frontend types if column names differ
        return data as Student[];
    };
    ```
    You will need to do this for all functions in `api.ts` (`getTeachers`, `createStudent`, `updateEvent`, etc.), mapping them to their corresponding Supabase queries. Authentication would also be handled by Supabase Auth methods (`supabase.auth.signInWithPassword`, `supabase.auth.signOut`).

After making these changes and redeploying to Vercel, your application will be a fully functional, data-persistent school management portal.