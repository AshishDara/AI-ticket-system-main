# 🧠 AI-Powered Ticket Management System

A smart ticket management system that uses AI to automatically categorize, prioritize, and assign support tickets to the most appropriate moderators.

This is a comprehensive, full-stack application built to demonstrate modern web development and AI integration skills. The entire project is functionally deployed and available for review.

---

## 🚀 Features

* **AI-Powered Ticket Triage**: The system leverages the **Google Gemini API** to analyze ticket content, providing actionable insights for human moderators.
    * **Automatic Categorization**: Assigns a list of relevant skills (e.g., `React`, `MongoDB`) to each ticket.
    * **Smart Priority Assignment**: Estimates and sets a priority level (`low`, `medium`, `high`) based on the ticket's description.
    * **Helpful Notes**: Generates concise, technical notes to assist moderators in solving the issue.
* **Smart Moderator Assignment**:
    * Automatically matches and assigns tickets to a moderator based on a skill-matching algorithm.
    * Includes a fallback mechanism to assign tickets to an admin if no matching moderator is found.
* **Asynchronous & Reliable Workflows**:
    * An event-driven architecture powered by **Inngest** ensures that time-consuming tasks (AI analysis, email notifications) run reliably in the background without blocking the user interface.
* **Secure User Management**:
    * **Role-Based Access Control (RBAC)** for `User`, `Moderator`, and `Admin` roles.
    * User authentication is handled securely using **JSON Web Tokens (JWT)** and password hashing with `bcrypt`.
* **Responsive User Interface**:
    * A clean, modern, and fully responsive frontend built with **React**, styled with **Tailwind CSS** and **DaisyUI**.

---

## 💻 Tech Stack

The application is built using a modern full-stack JavaScript ecosystem.

* **Backend**: Node.js with Express
* **Frontend**: React with Vite, Tailwind CSS, and DaisyUI
* **Database**: MongoDB (hosted on MongoDB Atlas)
* **Background Jobs**: Inngest (Cloud Service for production, CLI for local dev)
* **AI Integration**: Google Gemini API
* **Authentication**: JWT & bcrypt
* **Email**: Nodemailer (with Mailtrap for testing)

---

## 🚀 Live Demo

You can explore the live, deployed application and its features using the pre-configured demo credentials.

* **Frontend URL**: [https://ai-ticket-frontend-ashishdara.vercel.app](ai-ticket-system-frontend.vercel.app)
* **Demo Credentials**:
    * **Admin**: `admin@demo.com` / `demopassword`
    * **Moderator**: `moderator@demo.com` / `demopassword`
    * **Viewer**: `viewer@demo.com` / `demopassword`

---

## 📋 Prerequisites

* Node.js (v18 or higher)
* A MongoDB Atlas account
* A Google Gemini API key
* A Mailtrap account (for local email testing)
* A Render account (for backend deployment)
* A Vercel account (for frontend deployment)
* An Inngest account (for background jobs)

---

## ⚙️ Installation & Local Development

1.  **Clone the Repository**:
    ```bash
    git clone [https://github.com/AshishDara/AI-ticket-system-main.git](https://github.com/AshishDara/AI-ticket-system-main)
    cd AI-ticket-system-main
    ```

2.  **Install Dependencies**:
    ```bash
    # Install backend dependencies
    cd ai-ticket-assistant
    npm install
    
    # Install frontend dependencies
    cd ../ai-ticket-frontend
    npm install
    ```

3.  **Environment Setup**:
    * Create a `.env` file in the `ai-ticket-assistant` directory with your backend service credentials.
    * Create a `.env` file in the `ai-ticket-frontend` directory with your local backend URL.
    ```env
    # ai-ticket-assistant/.env
    MONGO_URI=your_mongodb_atlas_uri
    JWT_SECRET=your_jwt_secret
    MAILTRAP_SMTP_HOST=sandbox.smtp.mailtrap.io
    MAILTRAP_SMTP_PORT=2525
    MAILTRAP_SMTP_USER=your_mailtrap_username
    MAILTRAP_SMTP_PASS=your_mailtrap_password
    GEMINI_API_KEY=your_google_gemini_api_key
    
    # ai-ticket-frontend/.env
    VITE_SERVER_URL=http://localhost:3000/api
    ```

4.  **Run the Application**:
    * Open three separate terminal windows/tabs and run the following commands:
    ```bash
    # Terminal 1: Start the backend API server
    cd ai-ticket-assistant
    npm run dev
    
    # Terminal 2: Start the Inngest local dev server
    cd ai-ticket-assistant
    npm run inngest-dev
    
    # Terminal 3: Start the frontend dev server
    cd ai-ticket-frontend
    npm run dev
    ```
    The application will be running on `http://localhost:5173`.

---

## 📝 API Endpoints

### Authentication
| Method | Endpoint | Description |
|:---:|:---|:---|
| `POST` | `/api/auth/signup` | Registers a new user with default `user` role. |
| `POST` | `/api/auth/login` | Authenticates a user and returns a JWT token. |
| `POST` | `/api/auth/logout` | Logs out the current user (removes token from client). |
| `GET` | `/api/auth/users` | Fetches all users (Admin only). |
| `POST` | `/api/auth/update-user`| Updates a user's role and skills (Admin only). |

### Tickets
| Method | Endpoint | Description |
|:---:|:---|:---|
| `POST` | `/api/tickets` | Creates a new ticket and triggers an Inngest background job. |
| `GET` | `/api/tickets` | Fetches a list of tickets based on user role (Admin: all, Moderator: assigned, User: created by them). |
| `GET` | `/api/tickets/:id`| Fetches detailed information for a single ticket. |

---

## 🔄 Ticket Processing Flow

The system's core automation is an event-driven workflow orchestrated by Inngest.

1.  **User Signup**: A user registers for a new account. The backend creates a user record in MongoDB and dispatches a `user/signup` event. The `on-user-signup` Inngest function then triggers an email notification to the user.

2.  **Ticket Creation**: A user submits a new ticket via the frontend. The backend creates the initial record in MongoDB and dispatches a `ticket/created` event to Inngest.

3.  **AI Processing**: The `on-ticket-created` Inngest function is triggered. It calls the **Google Gemini API** to analyze the ticket's title and description.

4.  **Database Update**: The AI-generated insights (`priority`, `helpfulNotes`, `relatedSkills`) are used to update the ticket document in MongoDB.

5.  **Moderator Assignment**: The system queries the `users` collection to find a moderator with matching skills. The ticket's `assignedTo` field is updated with the most suitable moderator's ID.

6.  **Notification**: An automated email is sent to the assigned moderator, containing the ticket details and the AI-generated notes.

---

## 📝 Project Learnings

This project provides a strong foundation for learning and demonstrating:
* Building a complete full-stack application from scratch.
* Integrating external APIs (AI, email) into a backend service.
* Implementing a robust, event-driven architecture for background tasks.
* Setting up secure authentication and role-based access control.
* Deploying a monorepo structure to multiple cloud providers.
* Creating a modern, responsive, and maintainable user interface with React and Tailwind.
