# DocTalkie - AI Assistant Integration Service

## Project Idea

DocTalkie is a web service designed to allow users to easily integrate a custom AI assistant into their own projects. The core idea is to provide a simple workflow:

1.  **Sign Up & Upload:** Users register on the DocTalkie website and upload documentation relevant to their project (e.g., API docs, user manuals, knowledge base articles).
2.  **Configure Bot:** Users configure basic settings for their AI assistant (bot), such as its name and whether it should strictly adhere to the uploaded documentation context.
3.  **Get Credentials:** Upon bot creation, users receive an API Key and API URL specific to their bot.
4.  **Integrate:** Users install a simple npm package (`doctalkie-react`) in their application and use the provided API Key and URL to embed a chat widget powered by their trained AI assistant.

**Subscription Model:** The service operates on a tiered subscription model (Free, Pro, Premium) which limits factors like the number of bots a user can create and the total size of documentation they can upload.

## Current Features

- **Authentication:**
  - User registration and login via Email/Password.
  - OAuth login with GitHub.
  - OAuth login with Google.
  - Secure session management using Supabase Auth.
- **Dashboard:**
  - Protected route accessible only to logged-in users.
  - Displays user's current subscription plan.
  - Interface for creating the first AI bot.
  - Interface for viewing and updating bot settings (Name, Strict Context).
  - Displays bot-specific API Key and API URL.
  - Section for managing documentation files (upload placeholder, file list, delete functionality).
  - Tabbed interface for Settings, Documentation (Quick Start Guide), and Analytics (placeholder).
- **Database:**
  - PostgreSQL database managed by Supabase.
  - Tables for Users, Subscriptions, Bots, and Documents.
  - Automatic user profile creation upon signup using DB triggers.
  - Row Level Security (RLS) policies implemented for secure data access (Users can only access their own data).
- **Frontend:**
  - Built with Next.js (App Router).
  - Styled using Tailwind CSS and shadcn/ui components.
  - Customizable Supabase Auth UI component.
  - Code block component with syntax highlighting (`react-syntax-highlighter`).
- **Storage:**
  - Uses Supabase Storage for documentation file uploads.
  - RLS policies ensure users can only manage files within their designated folder.

## Future Plans / TODO

- **Document Processing:** Implement backend logic (likely Supabase Functions) to:
  - Trigger upon file upload.
  - Parse document content (PDF, MD, TXT, HTML).
  - Generate text embeddings (e.g., using Supabase pg_vector and an embedding model).
  - Update document status in the database ('processing', 'ready', 'error').
- **Chat API Endpoint:** Create the actual API endpoint (`/api/chat/{bot_id}`) that the `doctalkie-react` package will call. This endpoint will:
  - Receive user query and API key.
  - Validate API key.
  - Perform semantic search over the bot's processed documents based on the query.
  - Generate a response using an LLM (like OpenAI's models), potentially using retrieved context.
  - Enforce `strict_context` setting.
- **NPM Package (`doctalkie-react`):** Develop the React chat widget package.
- **Multiple Bots:** Allow users (on higher tiers) to create and manage multiple bots.
- **Subscription Management:** Integrate a payment provider (e.g., Stripe) to handle subscription upgrades/downgrades.
- **Analytics:** Implement tracking and display of bot usage statistics.
- **UI/UX Enhancements:** Add toast notifications, improve error handling, refine loading states.
- **Testing:** Add unit and integration tests.
