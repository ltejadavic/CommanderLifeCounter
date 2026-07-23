# Commander Counter 🐉

Commander Counter is a shared-device companion application for physical Magic: The Gathering Commander games. It is designed to help players seamlessly track life totals, special counters, and commander damage from a single shared device such as a phone, tablet, or laptop placed at the table.

## ✨ Features

- **Multiplayer Support**: Dynamically handles anywhere from 2 to 8 players.
- **Archenemy Mode**: Supports asymmetric 1-vs-Many gameplay layouts where the Archenemy starts with 40 life and occupies a prominent position on the screen.
- **Customizable Players**: Track names and choose custom color accents.
- **Special Counters**: Track Poison, Energy, Experience, and Fallout-themed Radiation counters.
- **Commander Damage**: Track 21-point commander damage from every specific opponent.
- **The Monarch**: Elegant UI overlay to track who currently holds the crown.
- **Scryfall Integration**: Search and set your Commander card art dynamically.
- **Advanced Visual Feedback**: Dynamic screen borders (vignettes) pulse to warn players of critically low life, high poison, or fatal incoming commander damage.
- **Dice Roller**: Integrated digital dice roller (d4, d6, d8, d10, d20).
- **End-Game States**: Automatically announces the Winner when one player remains, or a Draw if all players are defeated simultaneously.

## 🛠 Tech Stack

- **Frontend**: React, TypeScript, Vite, Tailwind CSS, Zustand, Framer Motion
- **Backend**: ASP.NET Core Web API (.NET 10), Entity Framework Core
- **Database**: PostgreSQL
- **Infrastructure**: Docker, Docker Compose

## 🚀 Getting Started

You can run this project easily using Docker (recommended) or by running the services locally.

### Option A: Run with Docker (Recommended)

**Prerequisites:** 
- [Docker](https://www.docker.com/get-started) and Docker Compose installed.

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/commander-counter.git
   cd commander-counter
   ```

2. Build and start the containers:
   ```bash
   docker-compose up -d --build
   ```

3. Open your browser and navigate to:
   - **Frontend App:** http://localhost:5173
   - **Backend API (Swagger):** http://localhost:5000/swagger

### Option B: Run Locally (Without Docker)

**Prerequisites:** 
- [Node.js (v18+)](https://nodejs.org/)
- [.NET 10 SDK](https://dotnet.microsoft.com/download)
- [PostgreSQL](https://www.postgresql.org/download/) running on port 5432.

1. **Setup the Database:**
   - Ensure your local PostgreSQL instance is running.
   - The backend expects a connection string in `backend/appsettings.json`. By default, it looks for `Host=localhost;Port=5432;Database=commanderdb;Username=postgres;Password=postgres`.

2. **Start the Backend (.NET):**
   ```bash
   cd backend
   dotnet restore
   dotnet run
   ```
   *The backend will automatically apply Entity Framework migrations on startup.*

3. **Start the Frontend (React):**
   Open a new terminal window:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

4. The application will be accessible at `http://localhost:5173`.

## 📜 Development Philosophy

- **Shared-Device First**: This is *not* an online multiplayer platform. It is built to replace physical dice and life counters at a physical table.
- **Simplicity & Speed**: Gameplay speed has higher priority than visual complexity. The app features large touch targets and minimal navigation.
- **Visual Clarity**: Provides clear contrast and warning animations to inform players of critical game states instantly.

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the [issues page](https://github.com/yourusername/commander-counter/issues).

## 📝 License

This project is open-source and available under the [MIT License](LICENSE).
