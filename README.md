# SecureCloud

SecureCloud is a React and Vite application for private cloud file management. The login and registration forms use Supabase Auth when configured. Authenticated users can upload, list, download, and delete their own files through Supabase Storage, with file metadata stored in Supabase Postgres.

File sharing and client-side encryption are not implemented. Files uploaded in this stage are stored in the private bucket without SecureCloud application-level encryption.

The Admin Console is a monitoring view, not a full user-management tool. Its file activity feed is application-reported and should not be treated as a tamper-proof forensic audit trail.

## Requirements

- Node.js and npm
- A Supabase project

## Configure Supabase

1. In the Supabase dashboard, open **Project Settings → API** and copy the project URL and publishable key.
2. Copy `.env.example` to `.env` in the project root and set:

   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
   ```

3. Run `supabase/schema.sql` in the Supabase SQL Editor. It creates the private `securecloud-files` bucket, the `file_records` table, and owner-only row and storage policies. The current upload limit is 50 MiB per file.
4. In Supabase Auth settings, configure the site URL and allowed redirect URLs for the local Vite address and any deployed site.
5. Run `supabase/admin-schema.sql` in the SQL Editor to add protected admin roles and file activity logging.
6. After your normal user account is confirmed, assign it the admin role from the SQL Editor. Replace the email with the exact email used in SecureCloud:

   ```sql
   insert into public.user_roles (user_id, role)
   select id, 'admin'
   from auth.users
   where lower(email) = lower('your-admin-email@gmail.com')
   on conflict (user_id) do update set role = excluded.role;
   ```

   This inserts no row if that email is not registered yet. The Admin Console appears after the admin signs out and back in or refreshes the app. Regular users cannot grant themselves the role.

If SecureCloud later updates `supabase/admin-schema.sql`, rerun the full file in the SQL Editor. Its table/index creation is idempotent and its functions are replaced safely.

Use only the publishable key in the frontend. Never put a Supabase secret or service-role key in a `VITE_` variable or commit `.env`.

## Run the frontend

```powershell
npm.cmd install
npm.cmd run dev
```

Open the local URL printed by Vite. Restart Vite after changing `.env`. Without valid Supabase settings and the SQL schema, account and file operations will not work.

## Optional Express health endpoint

The small Express server is retained only as an optional API health-check scaffold. Supabase handles authentication, file storage, metadata, and database-enforced admin summaries directly for this stage. The browser never receives an elevated Supabase key.

```powershell
cd server
npm.cmd install
npm.cmd run dev
```

The endpoint is `http://localhost:3000/api/health`; while Vite is running, it is also available through `http://localhost:5173/api/health`. The server does not handle accounts or files.

## Project layout

```text
src/                 React frontend and Supabase client/services
supabase/schema.sql  Bucket, metadata table, and row/storage policies
supabase/admin-schema.sql  Protected admin roles and file activity
server/              Optional Express health endpoint
PROJECT_STATUS.md    Project progress and planned work
```
