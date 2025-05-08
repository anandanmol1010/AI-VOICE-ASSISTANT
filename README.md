# 🎙️ IntervuBuddy - AI Voice Interview Assistant 🤖

<p align="center">
  <img src="public/logo.png" alt="IntervuBuddy Logo" width="200" />
</p>

<div align="center">
  
  ![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
  ![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
  ![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black)
  ![Firebase](https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)
  ![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
  
</div>

## ✨ Overview

IntervuBuddy is an AI-powered voice interview platform designed to help job seekers practice and improve their interview skills. Using advanced voice AI technology, it simulates realistic interview scenarios, provides real-time feedback, and helps users prepare for their actual job interviews.

## 🚀 Features

- 🎤 **AI Voice Interviews**: Engage in natural, conversational interviews with our AI interviewer
- 📹 **Camera Integration**: Practice with video to improve your body language and eye contact
- 🔍 **Customizable Interviews**: Practice for specific roles, technologies, and experience levels
- 📊 **Detailed Feedback**: Receive comprehensive feedback on your responses, communication style, and areas for improvement
- 📝 **Interview History**: Review past interviews and track your progress over time
- 🔐 **User Authentication**: Secure login and personalized experience

## 🛠️ Tech Stack

### Frontend

- ![Next.js](https://img.shields.io/badge/Next.js-000000?style=flat-square&logo=nextdotjs&logoColor=white) Next.js for the framework
- ![React](https://img.shields.io/badge/React-61DAFB?style=flat-square&logo=react&logoColor=black) React for UI components
- ![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat-square&logo=typescript&logoColor=white) TypeScript for type safety
- ![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white) Tailwind CSS for styling

### Backend & Services

- ![Firebase](https://img.shields.io/badge/Firebase-FFCA28?style=flat-square&logo=firebase&logoColor=black) Firebase for database and authentication
- ![Google Cloud](https://img.shields.io/badge/Google_Cloud-4285F4?style=flat-square&logo=google-cloud&logoColor=white) Google Gemini for AI-powered feedback
- ![VAPI.ai](https://img.shields.io/badge/VAPI.ai-FF6B6B?style=flat-square&logo=voiceflow&logoColor=white) VAPI.ai for voice conversations

## 🏁 Getting Started

### 📋 Prerequisites

- ![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat-square&logo=nodedotjs&logoColor=white) Node.js (v18 or higher)
- ![npm](https://img.shields.io/badge/npm-CB3837?style=flat-square&logo=npm&logoColor=white) npm or ![Yarn](https://img.shields.io/badge/Yarn-2C8EBB?style=flat-square&logo=yarn&logoColor=white) yarn
- ![Firebase](https://img.shields.io/badge/Firebase-FFCA28?style=flat-square&logo=firebase&logoColor=black) Firebase account
- ![VAPI.ai](https://img.shields.io/badge/VAPI.ai-FF6B6B?style=flat-square&logo=voiceflow&logoColor=white) VAPI.ai API key

### ⚙️ Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/yourusername/intervubuddy.git
   cd intervubuddy
   ```

2. **Install dependencies** 📦

   ```bash
   npm install
   # or
   yarn install
   ```

3. **Set up environment variables** 🔐
   Create a `.env.local` file in the root directory with the following variables:

   ```env
   # Firebase Configuration
   NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_firebase_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_firebase_app_id

   # API Keys
   NEXT_PUBLIC_VAPI_WORKFLOW_ID=your_vapi_workflow_id
   GOOGLE_API_KEY=your_google_api_key
   ```

4. **Run the development server** 🚀

   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. **Open your browser** 🌐
   Navigate to [http://localhost:3000](http://localhost:3000)

## 💻 How to Use

<div align="center">
  <img src="https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExODRqcnB3ZDFtZmZnMjZwbWZsNGpvZnJpYnJwcjBxdmJkNXpkMHZmZCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/3oKIPnAiaMCws8nOsE/giphy.gif" width="450px" />
</div>

1. 👤 **Sign Up/Login**: Create an account or log in to access the platform
2. 🎞️ **Start an Interview**: Choose from predefined interview types or create a custom one
3. 🎙️ **Grant Permissions**: Allow microphone (required) and camera (optional) access
4. 🗣️ **Complete the Interview**: Answer questions asked by the AI interviewer
5. 📋 **Review Feedback**: Get detailed feedback on your performance
6. 📈 **Track Progress**: View your interview history and improvement over time

## 📚 Project Structure

```bash
📂 intervubuddy/
├── 📂 app/                  # Next.js app directory
├── 📂 components/           # Reusable UI components
├── 📂 constants/            # Application constants
├── 📂 firebase/             # Firebase configuration
├── 📂 lib/                  # Utility functions and API calls
├── 📂 public/               # Static assets
├── 📂 types/                # TypeScript type definitions
└── 📜 ...                   # Configuration files
```

## 👮‍♀️ Contributing

<div align="center">
  <img src="https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExdGlnYnJnMHpuNmFxbGFnbGFnYmQ5ZXdxcmRwbWpzYXVvZWZtYnlsYiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/iIqmM5tTjmpOB9mpbn/giphy.gif" width="450px" />
</div>

Contributions are welcome! Please feel free to submit a Pull Request. 🚀

1. 🔗 Fork the repository
2. 🛠️ Create your feature branch (`git checkout -b feature/amazing-feature`)
3. 📝 Commit your changes (`git commit -m 'Add some amazing feature'`)
4. 🔜 Push to the branch (`git push origin feature/amazing-feature`)
5. 📣 Open a Pull Request

## 🌟 Acknowledgments

<div align="center">
  <a href="https://vapi.ai"><img src="https://img.shields.io/badge/VAPI.ai-FF6B6B?style=for-the-badge&logo=voiceflow&logoColor=white" alt="VAPI.ai" /></a>
  <a href="https://ai.google.dev/"><img src="https://img.shields.io/badge/Google_Gemini-4285F4?style=for-the-badge&logo=google&logoColor=white" alt="Google Gemini" /></a>
  <a href="https://firebase.google.com/"><img src="https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black" alt="Firebase" /></a>
</div>

<div align="center">
  <a href="https://nextjs.org/"><img src="https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white" alt="Next.js" /></a>
  <a href="https://tailwindcss.com/"><img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" /></a>
  <a href="https://ui.shadcn.com/"><img src="https://img.shields.io/badge/Shadcn_UI-000000?style=for-the-badge&logo=shadcnui&logoColor=white" alt="Shadcn UI" /></a>
</div>

---

<div align="center">
  <p>Made with ❤️ by <a href="https://github.com/anandanmol1010">Anmol Anand</a></p>
  <p>💬 Got questions? Feel free to reach out!</p>
</div>
