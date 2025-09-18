# Zipo - AI Generative Learning

<p align="center">
  <img src="frontend/assets/zipo_black.png" alt="Zipo Logo" width="200"/>
</p>

<h3 align="center">Bridiging Educational Gaps in Southeast Asia with Personalized and Accessible Learning Platform.</h3>

[![TypeScript](https://img.shields.io/badge/TS-TypeScript-3178C6?logo=typescript&logoColor=white)](#)
[![Node >= 18](https://img.shields.io/badge/Node-%E2%89%A5%2018-43853d?logo=nodedotjs&logoColor=white)](#)
[![PWA](https://img.shields.io/badge/App-PWA-5A0FC8?logo=pwa&logoColor=white)](#)
[![Docker Compose](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker&logoColor=white)](#)
[![MongoDB](https://img.shields.io/badge/DB-MongoDB-47A248?logo=mongodb&logoColor=white)](#)
[![Made with Love](https://img.shields.io/badge/Made%20with-❤️-ff6b6b)](#)
---

## 🌏 Background: The Challenge of Educational Equity

Southeast Asia is a region of immense potential, home to over 693 million people. However, this potential is constrained by a significant educational divide. For millions, access to quality learning is limited by:

*   **Language Barriers:** With over 1,000 languages spoken, educational materials are often not available in a student's native tongue.
*   **Infrastructure Gaps:** A significant portion of the population lives in rural areas with limited or unreliable internet access, making online learning a challenge.
*   **Outdated Methods:** Traditional, one-size-fits-all learning models fail to engage students or cater to individual learning paces.

Zipo was born from a single question: **How can we deliver a world-class, personalized education to every learner, regardless of their location, language, or internet access?** Our answer lies in rethinking not just the tools, but the very methodology of digital learning.

## 🚀 About The Project

<p align="center">
    <img src="frontend/assets/readmeasset/hero.png" alt="Zipo Hero Section">
</p>

Zipo is a **Personalized AI Learning Platform (PWA)** that turns any document into an active, visual conversation. Instead of passively reading, learners interact with an AI tutor that draws on a generative whiteboard and speaks explanations — even fully offline via portable .zipo modules.

**Why Zipo?** Across Southeast Asia, access to quality education is limited by language, bandwidth, and outdated learning modes. Zipo rethinks learning around *accessibility, personalization, and portability*.

## ✨ Key Features

Our technology is built on four core pillars to make our mission possible:

*   **🤖 The Generative Canvas:** The AI produces structured tool calls (e.g., `drawRectangle`, `createTable`) that the frontend (React‑Konva) renders into real‑time visual explanations with synchronized TTS.

*   **🧠 Agentic RAG (Retrieval-Augmented Generation):** Multi‑turn tool calling performs targeted retrieval from the user’s documents only when needed, making RAG smarter and more scalable.

*   **🌐 Portable `.zipo` Modules:** Export interactive lessons, including all visual commands and pre-synthesized audio, into a single portable file for easy sharing and distribution.

*   **🔌 Zipo Offline Playback:** Play downloaded `.zipo` modules on any device with the Zipo PWA, with zero internet connection required. This is how we ensure learning continuity, everywhere.


## 🖼️ Visual Showcase

Here's a glimpse of Zipo in action.

**The Dashboard: Your Learning Hub**
<img src="frontend/assets/readmeasset/dashboard.jpg" alt="Zipo Dashboard">

**An Active Learning Session: Chat & Canvas**
<img src="frontend/assets/readmeasset/session.jpg" alt="Zipo Session">

**Bringing Concepts to Life**
<img src="frontend/assets/readmeasset/visual learning.png" alt="Visual Learning">

**Offline Playback**
<img src="frontend/assets/readmeasset/offline_playback.jpg" alt="Offline playback">



## 👥 Meet The Team

**AI-Native Agentic RAG Vertical B2B SaaS**

| Photo | Name | Role |
| :---: | :---: | :---: |
| <img src="frontend/assets/team/sakil.jpg" alt="Khalfani Shaquille" width="150"> | **Khalfani Shaquille** | Project Lead |
| <img src="frontend/assets/team/varel.jpg" alt="Varel Tiara" width="150"> | **Varel Tiara** | Collaborator |
| <img src="frontend/assets/team/ibay.jpg" alt="M Ikhbar A" width="150"> | **M Ikhbar A** | Product Manager |

## 🛠️ Getting Started & Deployment Guide

This guide will walk you through setting up and running the Zipo project.

### Prerequisites

Make sure you have the following software installed on your machine:
*   [Git](https://git-scm.com/)
*   [Node.js](https://nodejs.org/) (v18 or higher recommended)
*   [Docker](https://www.docker.com/products/docker-desktop/)

### Configuration

The backend service requires environment variables and Google Cloud credentials.

1.  **Create an Environment File:**
    In the root directory of the project, create a file named `.env`.

2.  **Populate `.env`:**
    Add the following environment variables to the `.env` file. These are essential for the database connection, authentication, and AI services.

    ```
    # MongoDB Connection
    MONGO_URI=mongodb://mongo:27017/zipo

    # JWT Secret for authentication
    JWT_SECRET=your_super_secret_jwt_key

    # Google AI API Key
    GEMINI_API_KEY=your_google_ai_api_key
    ```

3.  **Google Credentials:**
    The application uses Google Cloud services (Speech-to-Text, Text-to-Speech). You need a Google Cloud service account key.
    *   Obtain your `google-credentials.json` key file from the Google Cloud Console.
    *   Place this file inside the `backend/` directory.

### 🚀 Deployment with Docker (Recommended)

This is the simplest way to get the entire application stack (Frontend, Backend, Database) running.

1.  **Clone the repository:**
    ```sh
    git clone <your-repository-url>
    cd zipo-ai
    ```

2.  **Run Docker Compose:**
    From the root directory, run the following command. This will build the frontend and backend images and start all the necessary services.

    ```sh
    docker-compose -f docker-compose.http.yml up --build
    ```

3.  **Access the application:**
    Once the build is complete and the containers are running, you can access the Zipo application at `http://localhost` in your web browser.

### 💻 Local Development (Without Docker)

If you prefer to run the services manually for development, follow these steps.

**1. Run the Backend:**

*   **Navigate to the backend directory:**
    ```sh
    cd backend
    ```
*   **Install dependencies:**
    ```sh
    npm install
    ```
*   **Run the development server:**
    This will start the backend server using `nodemon`, which automatically restarts on file changes.
    ```sh
    npm run dev
    ```
*   The backend will be running on the port configured in your setup (typically specified via environment variables or a default in `server.ts`).

**2. Run the Frontend:**

*   **Open a new terminal window.**
*   **Navigate to the frontend directory:**
    ```sh
    cd frontend
    ```
*   **Install dependencies:**
    ```sh
    npm install
    ```
*   **Run the development server:**
    This will start the Vite development server.
    ```sh
    npm run dev
    ```
*   Vite will provide a local URL (usually `http://localhost:5173`) where you can access the frontend.
