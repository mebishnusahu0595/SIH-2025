# MindSupport: Mental Health Platform

## Overview
MindSupport is a full-stack mental health platform designed to provide anonymous support, professional counseling, evidence-based screening, journaling, and resource access for users seeking mental wellness. Built with Next.js (frontend) and FastAPI (backend), it offers a modern, secure, and scalable solution for individuals, counselors, and administrators.

---

## Features

### 🌐 **Frontend (Next.js + TypeScript)**
- **Anonymous Support Chat**: AI-powered chat with crisis detection and supportive conversation
- **Mental Health Screening**: PHQ-9 and GAD-7 assessments with instant feedback
- **Journaling & Mood Tracking**: Secure, local journal with mood analytics
- **Counselor Directory**: Browse, filter, and contact verified mental health professionals
- **Resource Library**: Curated articles, videos, podcasts, and apps for self-care
- **Authentication**: Patient, doctor, and admin login/register flows
- **Dashboards**:
  - Patient dashboard: Personalized features and quick access
  - Doctor dashboard: Appointment and patient management
  - Admin dashboard: User, doctor, and analytics management
- **Responsive Design**: Mobile-first, accessible, and visually consistent (white theme)
- **Security**: Protected routes, session management, and privacy controls

### ⚡ **Backend (FastAPI + MongoDB)**
- **Authentication**: JWT-based login/register for patients, doctors, and admins
- **Admin Panel**: Approve doctors, manage users, view analytics
- **Counselor Management**: CRUD operations for counselors and applications
- **Chat API**: AI integration, crisis detection, and session management
- **Screening API**: PHQ-9, GAD-7, and custom assessments
- **Journal API**: Secure entry storage, export, and analytics
- **Resource API**: Serve curated mental health resources
- **Middleware**: Logging, rate limiting, and error handling
- **OpenAI Integration**: AI-powered chat and crisis detection
- **Database**: MongoDB Atlas setup, migration scripts, and sample data

### 📚 **Documentation & Utilities**
- **Database Structure**: Complete schema and relationship documentation
- **Privacy & Compliance**: Privacy framework and data protection guidelines
- **Research**: Clinical validation, methodology, and references
- **Metrics**: Outcome tracking and analytics
- **Admin Scripts**: Admin creation, user verification, and migration tools
- **Utilities**: Authentication clearing tool, color palette reference

---

## Getting Started

### 1. **Clone the Repository**
```bash
git clone https://github.com/mebishnusahu0595/SIH-2025.git
cd SIH-2025
```

### 2. **Backend Setup (FastAPI)**
- Install Python 3.12+
- Create and activate a virtual environment
- Install dependencies:
  ```bash
  cd backend
  pip install -r requirements.txt
  ```
- Configure `.env` for MongoDB Atlas and OpenAI keys
- Start the server:
  ```bash
  uvicorn main:app --reload --host 0.0.0.0 --port 8000
  ```

### 3. **Frontend Setup (Next.js)**
- Install Node.js 18+
- Install dependencies:
  ```bash
  cd frontend
  npm install
  ```
- Configure `.env.local` for API endpoints
- Start the development server:
  ```bash
  npm run dev
  ```

---

## Folder Structure

- `backend/` - FastAPI backend, models, routes, services, scripts
- `frontend/` - Next.js frontend, pages, components, stores, contexts
- `docs/` - Documentation, compliance, research, metrics
- `clear-auth.html` - Utility to clear browser authentication data
- `color-pallet.py` - Color palette reference for design

---

## Contributing

1. Fork the repository
2. Create a new branch (`git checkout -b feature/your-feature`)
3. Make your changes
4. Commit and push (`git commit -m "feat: ..." && git push origin ...`)
5. Open a pull request

---

## License
This project is licensed under the MIT License.

---

## Authors & Credits
- **Project Lead:** Bishnu Prasad Sahu ([mebishnusahu0595](https://github.com/mebishnusahu0595))
- **Contributors:** See GitHub contributors
- **Special Thanks:** SIH-2025 organizers, mental health professionals, and open-source community

---

## Contact & Support
- For issues, use [GitHub Issues](https://github.com/mebishnusahu0595/SIH-2025/issues)
- For feature requests, open a discussion or pull request
- For professional inquiries, contact via project repository

---

## Demo & Screenshots
> Add screenshots and demo links here as needed

---

## Acknowledgements
- FastAPI, Next.js, MongoDB Atlas, OpenAI, Tailwind CSS, Lucide Icons
- All open-source libraries and contributors

---

**MindSupport: Empowering mental wellness, one conversation at a time.**
