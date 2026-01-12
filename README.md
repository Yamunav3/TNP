Here is the complete, professional `README.md` file for your project. You can copy the code block below directly into your project's root `README.md` file.

```markdown
# 🎓 TNP Automation System (Training & Placement Cell)

![MERN Stack](https://img.shields.io/badge/MERN-Stack-blueviolet?style=for-the-badge&logo=react)
![Socket.io](https://img.shields.io/badge/RealTime-Socket.io-black?style=for-the-badge&logo=socket.io)
![Tailwind CSS](https://img.shields.io/badge/Styling-Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css)
![Status](https://img.shields.io/badge/Status-Active-success?style=for-the-badge)

> "Streamlining the recruitment journey from application to offer letter."

---

## 📖 Overview

The **TNP Automation System** is a full-stack web application designed to digitize and automate the campus recruitment process. It serves as a centralized platform connecting **Students**, **Placement Officers (Admins)**, and **Recruiters**. 

Gone are the days of manual spreadsheets and missed emails. This system provides real-time tracking of placement drives, automated eligibility checks, and instant notifications, ensuring a seamless experience for all stakeholders.

---

## 🚀 Key Features

### 👨‍🎓 For Students
- **Interactive Dashboard:** View upcoming drives, application status, and placement stats at a glance.
- **Smart Eligibility Check:** The system automatically validates if you meet the criteria (CGPA, Backlogs, Branch) before applying.
- **One-Click Apply:** Hassle-free application process for eligible companies.
- **Application Tracking:** Monitor your progress from *Applied* → *Screening* → *Interview* → *Selected*.
- **Real-Time Alerts:** Get instant notifications via Socket.io when a new drive is posted or your status changes.

### 👮‍♂️ For Admins (TNP Cell)
- **Drive Management:** Create, edit, and manage recruitment drives with custom eligibility filters.
- **Applicant Management:** View all applicants, shortlist candidates, and update interview results in bulk.
- **Analytics & Reports:** Visual insights into placement trends, average packages, and department-wise selection rates.
- **Role-Based Access:** Secure admin routes protected by JWT authentication.

---

## 🛠️ Tech Stack

| Domain | Technologies Used |
| :--- | :--- |
| **Frontend** | React.js (Vite), TypeScript, Redux Toolkit, Tailwind CSS, Framer Motion, Lucide React |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB (Mongoose ODM) |
| **Real-Time** | Socket.io (WebSockets) |
| **Auth** | JWT (JSON Web Tokens), Bcrypt.js |

---

## 📂 Project Structure

```bash
tnp-automation/
├── client/                 # React Frontend Application
│   ├── src/
│   │   ├── assets/         # Images and static files
│   │   ├── components/     # Reusable UI components (Cards, Modals)
│   │   ├── contexts/       # Auth & Theme Contexts
│   │   ├── pages/          # Student & Admin Views
│   │   ├── store/          # Redux Slices (Applications, Drives)
│   │   └── utils/          # Helper functions
│
└── server/                 # Node.js Backend API
    ├── config/             # DB Connection logic
    ├── controllers/        # Request logic (Auth, Drive, Application)
    ├── middleware/         # Auth & Role verification
    ├── models/             # Mongoose Schemas
    ├── routes/             # API Endpoints
    └── server.js           # Server Entry Point

```

---

## ⚙️ Installation & Setup

Follow these steps to run the project locally.

### 1. Prerequisites

Ensure you have the following installed:

* [Node.js](https://nodejs.org/) (v16 or higher)
* [MongoDB](https://www.mongodb.com/try/download/community) (Local or Atlas)
* [Git](https://git-scm.com/)

### 2. Clone the Repository

```bash
git clone [https://github.com/your-username/tnp-automation.git](https://github.com/your-username/tnp-automation.git)
cd tnp-automation

```

### 3. Backend Setup

Navigate to the server folder and install dependencies:

```bash
cd server
npm install

```

Create a `.env` file in the `server` directory:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_super_secret_random_key
CLIENT_URL=http://localhost:5173

```

Start the backend server:

```bash
node server.js
# Or for development with auto-restart:
npm run dev

```

*Output should say: `🚀 Server running on port 5000*`

### 4. Frontend Setup

Open a **new terminal**, navigate to the client folder, and install dependencies:

```bash
cd client
npm install

```

Start the React development server:

```bash
npm run dev

```

*Access the app at `http://localhost:5173` (or the port shown in terminal)*

---

## 🔌 API Reference

| Method | Endpoint | Description |
| --- | --- | --- |
| **Auth** |  |  |
| `POST` | `/api/auth/login` | Login user (Student/Admin) |
| `POST` | `/api/auth/register` | Register a new student |
| **Drives** |  |  |
| `GET` | `/api/drives` | Fetch all active drives |
| `POST` | `/api/drives` | Create a new drive (Admin) |
| `GET` | `/api/drives/:id` | Get detailed drive info |
| **Apps** |  |  |
| `POST` | `/api/applications/apply` | Apply for a specific drive |
| `GET` | `/api/applications/my-apps` | Get logged-in user's history |

---

## 📸 Screenshots

*(Add your screenshots here. You can upload them to your repo's `assets` folder)*

| Student Dashboard | Admin Panel |
| --- | --- |
|  |  |

---

## 🤝 Contributing

Contributions make the open-source community an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📜 License

Distributed under the MIT License. See `LICENSE` for more information.

---

### 🌟 Show your support

Give a ⭐️ if this project helped you!

```

```