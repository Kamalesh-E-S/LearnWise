# LearnWise

LEARNWISE is a web application that allows users to create, manage, and track their personalized learning roadmaps. It provides a visual interface for learning paths, progress tracking, and resource management.

---

## Features

- **Custom Roadmaps**: Create personalized learning paths tailored to your goals and current knowledge level.
- **Progress Tracking**: Monitor your learning journey with visual progress indicators and milestone tracking.
- **Flexible Timeline**: Learn at your own pace with customizable timeframes for each skill path.
- **Node Management**: Mark nodes as completed, view descriptions, and access resources like YouTube videos and websites.
- **Completed Roadmaps**: View and celebrate your completed roadmaps.
- **Authentication**: Secure login and signup functionality.

---

## Tech Stack

### Frontend
- **React**: For building the user interface.
- **React Router**: For routing and navigation.
- **ReactFlow**: For visualizing roadmaps as flowcharts.
- **Zustand**: For state management.
- **Tailwind CSS**: For styling.
- **Axios**: For API requests.

### Backend
- **FastAPI**: For building the REST API.
- **SQLite**: For database storage.
- **SQLAlchemy**: For ORM and database interactions.
- **JWT**: For authentication and authorization.

---

## Installation

### Prerequisites
- Node.js and npm installed.
- Python 3.9+ installed.
## Usage
- Open the frontend in your browser at http://localhost:5173.
- Sign up or log in to your account.
- Create a new roadmap by providing the skill, timeframe, and target level.
- Visualize your roadmap, mark nodes as completed, and track your progress.
- View completed roadmaps in the "Completed" section.

## API Endpoints
### Authentication
- POST /api/auth/signup: Sign up a new user.
- POST /api/auth/login: Log in an existing user.
- GET /api/auth/me: Get the current user's profile.
### Roadmaps
- POST /api/roadmap/create: Create a new roadmap.
- GET /api/roadmap/ongoing: Get all ongoing roadmaps.
- GET /api/roadmap/completed: Get all completed roadmaps.
- GET /api/roadmap/{roadmap_id}: Get details of a specific roadmap.
- PUT /api/roadmap/{roadmap_id}/progress: Update progress for a roadmap.

## Acknowledgments
- ReactFlow for the flowchart visualization.
- FastAPI for the backend framework.
- Tailwind CSS for styling.
- Lucide React for icons.
