# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/2d6bb789-ce30-4da4-90c1-4e7040ab3950

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/2d6bb789-ce30-4da4-90c1-4e7040ab3950) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with .

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

### Deploy with Lovable

Simply open [Lovable](https://lovable.dev/projects/2d6bb789-ce30-4da4-90c1-4e7040ab3950) and click on Share -> Publish.

### Deploy with Vercel

This project is configured for easy deployment with Vercel. Follow these steps:

1. Create a Vercel account at [vercel.com](https://vercel.com) if you don't have one
2. Install the Vercel CLI: `npm install -g vercel`
3. Run `vercel login` and follow the prompts to log in
4. From the project directory, run `vercel` to deploy
5. For production deployment, run `vercel --prod`

You can also deploy directly from the Vercel dashboard:

1. Push your code to a Git repository (GitHub, GitLab, or Bitbucket)
2. Import your repository in the Vercel dashboard
3. Vercel will automatically detect the Vite configuration
4. Configure any environment variables needed (see `.env.example`)
5. Deploy your application

## I want to use a custom domain - is that possible?

You can use a custom domain with Vercel by following these steps:

1. Go to your project in the Vercel dashboard
2. Navigate to "Settings" > "Domains"
3. Add your custom domain and follow the verification steps

Alternatively, we don't support custom domains in Lovable (yet). If you want to deploy your project under your own domain using Lovable then we recommend using Netlify. Visit our docs for more details: [Custom domains](https://docs.lovable.dev/tips-tricks/custom-domain/)
