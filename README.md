# VocalHealth AI - Medical Voice Assistant

VocalHealth AI is a state-of-the-art medical consultation platform that uses real-time AI voice agents to conduct symptom triage and health assessments. Built with Next.js and integrated with advanced AI models, it provides users with instant, accurate medical guidance through natural conversations.

## 🚀 Features

- **AI Voice Consultation**: Natural voice-based interaction with specialized AI doctors (Cardiologists, Dermatologists, etc.) powered by Vapi.
- **Real-time Transcription**: See your conversation transcribed in real-time as you speak.
- **Automated Medical Reports**: Instant structured health reports generated at the end of every session using OpenRouter.
- **Consultation History**: Securely fetch and review all past conversations and medical summaries.
- **Usage Credits**: Built-in 5-credit limit system to manage API consumption for consultations.
- **Modern UI/UX**: Premium design with glassmorphism, smooth animations, and global page loaders (`nextjs-toploader`).

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React, Tailwind CSS
- **Backend**: Next.js API Routes, MongoDB (via Mongoose)
- **Authentication**: Clerk
- **AI Voice**: Vapi SDK
- **AI Text/LLM**: OpenRouter (GPT-OSS Models)
- **Icons & Styling**: Lucide React, Sonner (Toasts)

## 📦 Getting Started

### Prerequisites

- Node.js 18+ 
- MongoDB Atlas Account
- Clerk Account
- OpenRouter API Key
- Vapi Account & Public Key

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd vocal-health-ai
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure Environment Variables:
   Create a `.env` file in the root directory and add the following:

   ```env
   # Clerk Auth
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_key
   CLERK_SECRET_KEY=your_secret

   # MongoDB
   MONGODB_URI=your_mongodb_connection_string

   # AI Services
   OPEN_ROUTER_API_KEY=your_openrouter_key
   NEXT_PUBLIC_VAPI_PUBLIC_KEY=your_vapi_public_key
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

## 🏗️ Project Structure

- `app/`: Next.js App Router (Routes & API)
- `config/`: Database connection and AI model configurations.
- `models/`: Mongoose schemas for Users and Session History.
- `context/`: React context for managing global User details.
- `components/`: Reusable UI components.
- `app/(routes)/dashboard`: User dashboard and consultation flows.

## 🛡️ Usage Limits (Credits)

To ensure sustainable API usage, the platform implements a credit system:
- **Starting Balance**: Every new user receives **5 credits**.
- **Consumption**: **1 credit** is deducted for every new consultation session started.
- **Enforcement**: Consultations are automatically blocked when the balance reaches zero.

## 📄 License

© 2026 VocalHealth AI.
© Chandan Naik.
All rights reserved.
