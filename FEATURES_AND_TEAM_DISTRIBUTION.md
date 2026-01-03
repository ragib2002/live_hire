# Live Hire - Features & Team Distribution

## Overview
Total Features: 20
Team Size: 5 people
Features Per Person: 4

---

## Feature List & Team Assignment

### **Person 1: Problem Management & Dashboard**
1. **Problem Search & Filtering** - Search coding problems by title, difficulty, or category
2. **Difficulty Level Badges** - Display and filter problems by Easy, Medium, Hard
3. **Recent Sessions Display** - Show user's recently completed sessions on dashboard
4. **Session Statistics** - Display stats cards with session count, problems solved, total time

### **Person 2: Session Management & Core Features**
5. **Session Creation** - Create new coding interview sessions with problem & participant selection
6. **Session Listing** - Display active sessions and filter based on user role (host/participant)
7. **Session Details Display** - Show session information including problem, difficulty, and participants
8. **Session Completion** - End session and update status to completed

### **Person 3: Video & Real-time Communication**
9. **Stream.io Video Integration** - Initialize video client and handle call creation
10. **Video Call Management** - Join/leave calls with proper token generation
11. **Real-time Chat** - Stream chat channel setup and messaging during sessions
12. **Video Token Generation** - Create secure tokens for video call authentication

### **Person 4: Code Editor & Execution**
13. **Code Editor Component** - Monaco editor with syntax highlighting for multiple languages
14. **Language Selection** - Support for JavaScript, Python, Java, C++, and other languages
15. **Code Execution** - Piston API integration to execute user code and return output
16. **Output Display** - Show execution results, errors, and runtime information

### **Person 5: UI/UX & Frontend Components**
17. **Dashboard Layout** - Main dashboard with navigation and session overview
18. **Create Session Modal** - User interface for session creation with problem selection
19. **Problem Library Display** - Show coding problems with descriptions, examples, and difficulty badges
20. **Responsive UI Design** - DaisyUI components with Tailwind CSS for cross-device compatibility

---

## Technology Stack by Feature
- **Authentication**: Clerk
- **Backend**: Express.js, Node.js, MongoDB
- **Frontend**: React, Vite
- **Video/Chat**: Stream.io SDK
- **Code Execution**: Piston API
- **Styling**: Tailwind CSS, DaisyUI
- **State Management**: React Query (TanStack Query)
- **Editor**: Monaco Editor

---

## Key Responsibilities Summary

| Person | Role | Primary Area | Features |
|--------|------|--------------|----------|
| **Person 1** | Dashboard & Problems Lead | Frontend Problem Management | Search, Difficulty, Recent Sessions, Stats |
| **Person 2** | Session Lead | Backend Session Logic | Session CRUD, Listing, Details, Completion |
| **Person 3** | Real-time Engineer | Stream.io Integration | Video, Calls, Chat, Tokens |
| **Person 4** | Code Execution Specialist | Code Editor Backend | Editor, Languages, Execution, Output |
| **Person 5** | Frontend/UI Designer | React Components | Dashboard, Modal, Problems, Design |

---

## Development Notes
- Clerk authentication is a foundational infrastructure component (not counted as a feature)
- All features are interdependent; coordinate on API contracts
- Database schema must support sessions, problems, and user relationships
- Stream.io and Piston API credentials must be configured in environment variables
- Frontend and backend should test integration regularly
- Error handling and logging critical for debugging Stream and Piston integrations
