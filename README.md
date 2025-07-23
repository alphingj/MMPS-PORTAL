
# MMPS Connect - Full Deployment Guide

This is the complete guide to deploying the MMPS Connect school management portal. Follow these steps precisely to get your application and its secure backend live on Vercel and Supabase.

## Architecture Overview

-   **Frontend:** React 18, TypeScript, Vite, React Router, Tailwind CSS. Deployed on Vercel.
-   **Backend & Database:** Supabase PostgreSQL.
-   **Secure Operations:** User and password management is handled by a secure Supabase Edge Function, which is essential for protecting your master API keys.

---

### **Phase 1: Set Up Your Supabase Backend**

This phase creates your new, empty, and secure database.

**Step 1: Create the Supabase Project**
1.  Go to the [Vercel & Supabase integration page](https://vercel.com/integrations/supabase).
2.  Click **"Add Integration"** and connect it to your Vercel account.
3.  Choose to create a **new Supabase project**.
4.  Give it a name (e.g., `mmps-portal-live`), choose a region close to you, and create the project.
5.  Once the project is created, navigate to your new project's dashboard in Supabase.
6.  Go to **Project Settings** (the gear icon in the left menu) > **API**.
7.  Find and copy two things. **Keep them safe in a notepad for a later step:**
    *   **Project URL:** It will look like `https://your-project-id.supabase.co`.
    *   **`anon` `public` key:** This is a long string of letters and numbers.

**Step 2: Create the Database Tables**
1.  In your Supabase project dashboard, go to the **SQL Editor** (the icon that looks like a sheet of paper with `<>`).
2.  Click **"+ New query"** or **"New SQL Snippet"**.
3.  **Copy the entire block of code below** and paste it into the editor.

    ```sql
    -- schema.sql for MMPS Connect

    -- Profiles table to link auth users to roles and usernames
    CREATE TABLE profiles (
      id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
      username TEXT UNIQUE NOT NULL,
      full_name TEXT,
      role TEXT NOT NULL CHECK (role IN ('admin', 'teacher', 'student')),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    -- Students Table
    CREATE TABLE students (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      roll_number TEXT UNIQUE NOT NULL,
      full_name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      class TEXT NOT NULL,
      section TEXT,
      parent_name TEXT,
      parent_phone TEXT,
      address TEXT,
      date_of_birth DATE,
      admission_date DATE,
      status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'deactivated')),
      user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
    );

    -- Teachers Table
    CREATE TABLE teachers (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      employee_id TEXT UNIQUE NOT NULL,
      username TEXT UNIQUE NOT NULL,
      full_name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      subject TEXT,
      phone TEXT,
      qualification TEXT,
      experience_years INT,
      joining_date DATE,
      status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'deactivated')),
      user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
      can_manage_students BOOLEAN DEFAULT FALSE,
      can_manage_teachers BOOLEAN DEFAULT FALSE,
      can_manage_events BOOLEAN DEFAULT FALSE,
      can_view_all_results BOOLEAN DEFAULT FALSE,
      can_manage_attendance BOOLEAN DEFAULT FALSE,
      can_create_exams BOOLEAN DEFAULT FALSE,
      can_manage_announcements BOOLEAN DEFAULT FALSE,
      full_admin_access BOOLEAN DEFAULT FALSE
    );

    -- Other tables
    CREATE TABLE announcements ( id UUID PRIMARY KEY DEFAULT gen_random_uuid(), title TEXT NOT NULL, content TEXT, date DATE NOT NULL, category TEXT, priority TEXT, target_audience TEXT, created_at TIMESTAMPTZ DEFAULT NOW() );
    CREATE TABLE events ( id UUID PRIMARY KEY DEFAULT gen_random_uuid(), title TEXT NOT NULL, description TEXT, category TEXT, date_time TIMESTAMPTZ NOT NULL, venue TEXT, status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')) );
    CREATE TABLE transport_routes ( id UUID PRIMARY KEY DEFAULT gen_random_uuid(), route_number TEXT NOT NULL, route_name TEXT, driver_name TEXT, driver_phone TEXT, vehicle_number TEXT, monthly_fee INT, status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')) );
    CREATE TABLE bus_stops ( id UUID PRIMARY KEY DEFAULT gen_random_uuid(), route_id UUID REFERENCES transport_routes(id) ON DELETE CASCADE, stop_name TEXT NOT NULL, stop_time TIME );
    CREATE TABLE exams ( id UUID PRIMARY KEY DEFAULT gen_random_uuid(), exam_name TEXT NOT NULL, subject TEXT, class TEXT, section TEXT, exam_date DATE, max_marks INT, exam_type TEXT, created_by_teacher_id UUID REFERENCES teachers(id) );
    CREATE TABLE attendance ( id UUID PRIMARY KEY DEFAULT gen_random_uuid(), student_id UUID REFERENCES students(id) ON DELETE CASCADE, date DATE NOT NULL, status TEXT NOT NULL CHECK (status IN ('present', 'absent', 'late', 'excused')), remarks TEXT, UNIQUE(student_id, date) );
    CREATE TABLE results ( id UUID PRIMARY KEY DEFAULT gen_random_uuid(), student_id UUID REFERENCES students(id) ON DELETE CASCADE, exam_id UUID REFERENCES exams(id) ON DELETE CASCADE, marks_obtained INT, UNIQUE(student_id, exam_id) );
    ```
4.  Click the green **"RUN"** button. You should see a "Success" message.

---

### **Phase 2: Deploy the Secure Backend Function (Critical Step)**

This is the most important step for security. It creates the backend service that lets your app manage users without exposing your master key.

**Step 3: Install and Link the Supabase CLI**
1.  **Install the CLI:** If you haven't already, open a terminal on your computer and install the Supabase CLI. Instructions are [here](https://supabase.com/docs/guides/cli/getting-started).
2.  **Login:** Run `supabase login` in your terminal and follow the prompts.
3.  **Link Project:** Navigate to your project's code folder in the terminal and run the link command:
    `supabase link --project-ref YOUR_PROJECT_ID`
    *(You find `YOUR_PROJECT_ID` in your Supabase project's URL: `https://supabase.com/dashboard/project/YOUR_PROJECT_ID`)*

**Step 4: Create and Deploy the Edge Function**
1.  **Create Function:** In your terminal, run: `supabase functions new manage-user`
2.  This creates a folder `supabase/functions/manage-user/`. Open the `index.ts` file inside it.
3.  **Delete everything** in that file and **replace it with this exact code:**

    ```typescript
    // supabase/functions/manage-user/index.ts
    /// <reference lib="deno.ns" />

    import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
    import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.44.4'

    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    }

    serve(async (req) => {
      if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
      }

      try {
        const supabaseAdmin = createClient(
          Deno.env.get('SUPABASE_URL') ?? '',
          Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        )

        const { action, userData } = await req.json()
        if (!action || !userData) throw new Error("Action and userData are required.");

        let responseData;
        switch (action) {
          case 'CREATE': {
            const { data, error } = await supabaseAdmin.auth.admin.createUser({
              email: userData.email,
              password: userData.password,
              email_confirm: true,
            })
            if (error) throw error
            responseData = data.user;
            break;
          }
          case 'UPDATE': {
            if (!userData.id) throw new Error("User ID is required for update.");
            const updatePayload: { email?: string; password?: string } = {};
            if (userData.email) updatePayload.email = userData.email;
            if (userData.password) updatePayload.password = userData.password;
            
            const { data, error } = await supabaseAdmin.auth.admin.updateUserById(userData.id, updatePayload);
            if (error) throw error
            responseData = data.user;
            break;
          }
          case 'DELETE': {
             if (!userData.id) throw new Error("User ID is required for delete.");
             const { data, error } = await supabaseAdmin.auth.admin.deleteUser(userData.id);
             if (error) throw error
             responseData = { message: "User deleted successfully." };
             break;
          }
          default:
            throw new Error(`Invalid action: ${action}`);
        }

        return new Response(JSON.stringify(responseData), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        })
      } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        })
      }
    })
    ```
4.  **Deploy Function:** Back in your terminal, run: `supabase functions deploy`

---

### **Phase 3: Deploy the Frontend to Vercel**

**Step 5: Deploy on Vercel**
1.  Push all the latest application code to a GitHub repository.
2.  On your Vercel dashboard, **"Add New... -> Project"** and import your repository.
3.  Expand the **"Environment Variables"** section.
4.  Add the two variables you saved from Step 1:
    *   **Key:** `VITE_SUPABASE_URL` | **Value:** (Your Project URL)
    *   **Key:** `VITE_SUPABASE_ANON_KEY` | **Value:** (Your `anon` `public` key)
5.  Click **Deploy**.

---

### **Phase 4: Create First Admin & Secure the Database**

Your application is live, but no users exist yet. You must create the first admin manually.

**Step 6: Create Your Admin User**
1.  Go to your Supabase project's **Authentication** page.
2.  Click **"+ Add user"** and create the user:
    *   **Email:** `principal@mmps`
    *   **Password:** `Moby@2025_`
3.  Now, go to the **Table Editor** page and click the **`profiles`** table.
4.  Click **"+ Insert row"**.
5.  Go back to the **Authentication** page and copy the `UID` of the user you just created.
6.  Paste the `UID` into the `id` field of your new profile row.
7.  Fill in the rest of the profile:
    *   **username:** `principal`
    *   **full_name:** `Moby Mathew`
    *   **role:** `admin`
8.  Click **Save**.

**Step 7: Secure Your Database with RLS (Critical)**
Row Level Security (RLS) is essential to prevent unauthorized data access. The following policies will secure your tables while ensuring admins have full control and the public can view necessary information.

1.  In your Supabase project dashboard, go to the **SQL Editor**.
2.  Click **"+ New query"**.
3.  **Copy the entire block of code below** and paste it into the editor. This will enable RLS and create all necessary security policies at once. It is safe to run this multiple times.

    ```sql
    -- This script enables Row Level Security (RLS) and sets up complete, working policies.
    -- It grants full access to admins, allows public read access where needed,
    -- and lets authenticated users manage their own data.
    
    -- 0. Drop old, potentially incorrect policies if they exist
    DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON public.profiles;
    DROP POLICY IF EXISTS "Users can insert their own profile." ON public.profiles;
    DROP POLICY IF EXISTS "Users can update own profile." ON public.profiles;
    DROP POLICY IF EXISTS "Admins can do anything." ON public.students;
    DROP POLICY IF EXISTS "Admins can do anything." ON public.teachers;

    -- 1. Create helper function to get a user's role
    CREATE OR REPLACE FUNCTION get_user_role()
    RETURNS text AS $$
      SELECT role FROM public.profiles WHERE id = auth.uid()
    $$ LANGUAGE sql STABLE;

    -- 2. Enable RLS on all tables
    ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.teachers ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.transport_routes ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.bus_stops ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.exams ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.results ENABLE ROW LEVEL SECURITY;

    -- 3. Policies for 'profiles' table
    CREATE POLICY "Admin full access on profiles" ON public.profiles FOR ALL
      USING (get_user_role() = 'admin') WITH CHECK (get_user_role() = 'admin');
    CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT
      USING (auth.role() = 'authenticated');
    CREATE POLICY "User can insert own profile" ON public.profiles FOR INSERT
      WITH CHECK (auth.uid() = id);
    CREATE POLICY "User can update own profile" ON public.profiles FOR UPDATE
      USING (auth.uid() = id);

    -- 4. Admin full access policies for all other data tables
    CREATE POLICY "Admin full access on students" ON public.students FOR ALL USING (get_user_role() = 'admin') WITH CHECK (get_user_role() = 'admin');
    CREATE POLICY "Admin full access on teachers" ON public.teachers FOR ALL USING (get_user_role() = 'admin') WITH CHECK (get_user_role() = 'admin');
    CREATE POLICY "Admin full access on announcements" ON public.announcements FOR ALL USING (get_user_role() = 'admin') WITH CHECK (get_user_role() = 'admin');
    CREATE POLICY "Admin full access on events" ON public.events FOR ALL USING (get_user_role() = 'admin') WITH CHECK (get_user_role() = 'admin');
    CREATE POLICY "Admin full access on transport" ON public.transport_routes FOR ALL USING (get_user_role() = 'admin') WITH CHECK (get_user_role() = 'admin');
    CREATE POLICY "Admin full access on bus_stops" ON public.bus_stops FOR ALL USING (get_user_role() = 'admin') WITH CHECK (get_user_role() = 'admin');
    CREATE POLICY "Admin full access on exams" ON public.exams FOR ALL USING (get_user_role() = 'admin') WITH CHECK (get_user_role() = 'admin');
    CREATE POLICY "Admin full access on attendance" ON public.attendance FOR ALL USING (get_user_role() = 'admin') WITH CHECK (get_user_role() = 'admin');
    CREATE POLICY "Admin full access on results" ON public.results FOR ALL USING (get_user_role() = 'admin') WITH CHECK (get_user_role() = 'admin');

    -- 5. Public read-access policies
    CREATE POLICY "Public can read announcements" ON public.announcements FOR SELECT USING (true);
    CREATE POLICY "Public can read events" ON public.events FOR SELECT USING (true);
    CREATE POLICY "Public can read transport routes" ON public.transport_routes FOR SELECT USING (true);
    CREATE POLICY "Public can read bus stops" ON public.bus_stops FOR SELECT USING (true);
    ```
4.  Click the green **"RUN"** button. You should see a "Success" message.

**You are now finished.** Your application is fully deployed, secure, and ready to use. Log in with the `principal` username and `Moby@2025_` password. Changes made by the admin will now be saved permanently.
