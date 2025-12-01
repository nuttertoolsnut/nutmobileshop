# Deployment Guide (Vercel)

The easiest way to deploy your Next.js application is using [Vercel](https://vercel.com), the creators of Next.js.

## Prerequisites

1.  **GitHub Repository**: Ensure your project is pushed to a GitHub repository.
2.  **Vercel Account**: Sign up at [vercel.com](https://vercel.com/signup).

## Steps to Deploy

1.  **Login to Vercel**: Go to your Vercel dashboard.
2.  **Add New Project**: Click "Add New..." -> "Project".
3.  **Import Git Repository**: Find your `mobile-shop` repository and click "Import".
4.  **Configure Project**:
    *   **Framework Preset**: Next.js (should be auto-detected).
    *   **Root Directory**: `./` (default).
    *   **Environment Variables**: You MUST add the variables from your `.env.local` file here.
        *   `NEXT_PUBLIC_SUPABASE_URL`
        *   `NEXT_PUBLIC_SUPABASE_ANON_KEY`
        *   `NEXT_PUBLIC_PROMPTPAY_ID`
5.  **Deploy**: Click "Deploy".

## Post-Deployment

*   **Supabase URL**: Your Supabase backend is already in the cloud, so it will work automatically.
*   **Authentication Redirects**:
    *   Go to your **Supabase Dashboard** -> Authentication -> URL Configuration.
    *   Add your new Vercel domain (e.g., `https://your-project.vercel.app`) to the **Site URL** and **Redirect URLs**.
    *   This is crucial for login to work correctly after deployment.

## Troubleshooting

*   **Build Errors**: If the deployment fails, check the "Logs" tab in Vercel. It usually points to type errors or linting issues.
*   **Missing Images**: If images don't load, ensure your `next.config.js` allows the image domains (Supabase storage).

## Updating

Whenever you push changes to your `main` branch on GitHub, Vercel will automatically redeploy your application!
