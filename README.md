# 🎓 Campus Placement Portal

A full-stack web application designed to simplify and manage the **campus placement process** for students and recruiters.

The platform provides separate dashboards for students and recruiters, allowing students to explore job opportunities and apply for them, while recruiters can create job postings and manage applications.

---

## 🚀 Features

### 👨‍🎓 Student Features

* Student registration and login
* JWT-based authentication
* Student profile management
* Resume management
* Browse available job opportunities
* Search jobs by title, skills, or company
* View detailed job information
* Apply for jobs
* Track application status
* View recently posted jobs

### 🏢 Recruiter Features

* Recruiter registration and login
* JWT-based authentication
* Recruiter profile management
* Create job postings
* Set job deadlines
* View applicants
* Shortlist candidates
* Reject applications
* Manage posted jobs
* View recruitment statistics

---

## 🛠️ Tech Stack

### Frontend

* React.js
* JavaScript
* HTML5
* CSS3
* React Router
* Axios
* Framer Motion

### Backend

* Java
* Spring Boot
* Spring Security
* JWT Authentication
* Spring Data JPA
* Hibernate
* Maven

### Database

* MySQL

### Tools

* Git
* GitHub
* Postman
* VS Code
* IntelliJ IDEA

---

## 🏗️ System Architecture

```text
                 Campus Placement Portal
                           │
             ┌─────────────┴─────────────┐
             │                           │
        React Frontend              Spring Boot
             │                           │
             │        REST APIs           │
             └─────────────┬─────────────┘
                           │
                    Spring Security
                           │
                   JWT Authentication
                           │
                         MySQL
```

---

## 👥 User Roles

### Student

```text
Student Registration/Login
          ↓
   Student Dashboard
          ↓
    Manage Profile
          ↓
      Browse Jobs
          ↓
    View Job Details
          ↓
        Apply
          ↓
 Track Application Status
```

### Recruiter

```text
Recruiter Registration/Login
            ↓
    Recruiter Dashboard
            ↓
       Create Job
            ↓
     View Applicants
            ↓
   Shortlist / Reject
            ↓
 Manage Recruitment
```

---

## 🔐 Authentication & Security

The application uses **JWT-based stateless authentication** with Spring Security.

### Authentication Flow

```text
User Login
    ↓
Backend validates credentials
    ↓
JWT token generated
    ↓
Token stored by frontend
    ↓
Token sent with API requests
    ↓
Spring Security validates token
    ↓
Authorized API access
```

Passwords are securely stored using **BCrypt hashing**.

The application also implements **role-based authorization** for students and recruiters.

---

## 🔗 API Endpoints

### Authentication

```text
POST /api/auth/signup
POST /api/auth/login
```

### Student

```text
GET /api/student/profile
```

### Jobs

```text
POST /api/jobs/addJob
GET  /api/jobs/recent
GET  /api/jobs/allJobs
GET  /api/jobs/{id}
```

### Applications

```text
POST /api/applications/applied
GET  /api/applications/student/{studentId}
GET  /api/applications/recruiter/applicants
```

> API endpoints may change as the project evolves.

---

## 📂 Project Structure

```text
Campus-Placement-Portal/
│
├── Frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── context/
│   │   └── App.jsx
│   │
│   ├── package.json
│   └── ...
│
├── Backend/
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/
│   │   │   └── resources/
│   │   └── test/
│   │
│   ├── pom.xml
│   └── ...
│
├── screenshots/
│
└── README.md
```

> Update the structure if your actual folder names are different.

---

## 🖥️ Screenshots

Add screenshots of the main application pages here.

### Student Login

*Add screenshot here*

### Student Dashboard

*Add screenshot here*

### Jobs Page

*Add screenshot here*

### Job Details

*Add screenshot here*

### Recruiter Dashboard

*Add screenshot here*

### Applicant Management

*Add screenshot here*

---

## ⚙️ How to Run Locally

### Prerequisites

Make sure you have installed:

* Java 17+
* Node.js
* npm
* MySQL
* Git

---

### 1. Clone the Repository

```bash
git clone https://github.com/Rishith9546/Campus-Placement-Portal.git
cd Campus-Placement-Portal
```

---

### 2. Configure MySQL

Create the database:

```sql
CREATE DATABASE portal;
```

Configure your MySQL username and password in the Spring Boot configuration.

---

### 3. Run the Backend

Open a terminal and navigate to the backend:

```powershell
cd Backend
```

Run the Spring Boot application:

```powershell
.\mvnw.cmd spring-boot:run
```

Backend:

```text
http://localhost:8080
```

---

### 4. Run the Frontend

Open another terminal:

```powershell
cd Frontend
```

Install dependencies:

```powershell
npm install
```

Start the development server:

```powershell
npm run dev
```

Frontend:

```text
http://localhost:5173
```

---

## 🔄 Application Flow

```text
                         User
                           │
              ┌────────────┴────────────┐
              │                         │
           Student                  Recruiter
              │                         │
              ↓                         ↓
       Student Dashboard       Recruiter Dashboard
              │                         │
              ↓                         ↓
          Browse Jobs              Create Jobs
              │                         │
              ↓                         ↓
          Apply for Jobs          View Applicants
              │                         │
              ↓                         ↓
       Track Application        Shortlist / Reject
              │                         │
              └────────────┬────────────┘
                           ↓
                         MySQL
```

---

## 📚 Key Concepts Implemented

This project demonstrates practical experience with:

* Full-stack web development
* React.js
* REST API development
* Spring Boot
* Spring Security
* JWT authentication
* Role-based authorization
* BCrypt password hashing
* Spring Data JPA
* Hibernate
* MySQL database integration
* Frontend-backend integration
* Git & GitHub
* API testing with Postman

---

## 🔮 Future Improvements

The following features are planned for future versions of the project:

### 🤖 AI Features

* AI-powered mock interviews
* AI resume analysis
* AI-based job recommendations
* Improved candidate-job matching

### ☁️ Cloud & Deployment

* AWS deployment
* Cloud database integration
* Production-ready deployment

### 🐳 Containerization

* Dockerize frontend and backend
* Docker Compose for local development

### ⚡ Event-Driven Architecture

* Apache Kafka integration
* Event-based application processing
* Real-time notifications

### 🏗️ Architecture Improvements

* Microservices architecture
* API Gateway
* Service-to-service communication

### 📧 Other Improvements

* Email notifications
* Real-time recruiter notifications
* Advanced search and filtering
* Improved analytics dashboard

---

## 🎯 Learning Outcomes

Through this project, I gained hands-on experience in:

* Building a full-stack application
* Designing and consuming REST APIs
* Implementing authentication and authorization
* Connecting React with Spring Boot
* Working with relational databases
* Using JPA and Hibernate
* Managing application state
* Testing APIs using Postman
* Using Git and GitHub for version control

---

## 📌 Project Status

🚧 **Actively under development**

The project is being continuously improved with additional features, security enhancements, and deployment capabilities.

---

## 👨‍💻 Author

**Veera Rishith**

Computer Science & Engineering
IIIT Kalyani

GitHub: **Rishith9546**

