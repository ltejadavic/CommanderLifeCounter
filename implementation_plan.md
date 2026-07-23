# Commander Counter - Implementation Plan

## 1. Product Summary
Commander Counter is a shared-device companion application designed to assist players in managing the state of a physical Magic: The Gathering Commander game. The application is meant to be used on a single shared screen (e.g., tablet, phone, or laptop) placed centrally at the gaming table. It replaces traditional pen-and-paper or physical counters for tracking life totals, poison counters, commander damage, and other game-specific metrics. It is not an online multiplayer platform, nor is it a complete rules engine; it serves as a streamlined, touch-friendly digital assistant for in-person gameplay.

## 2. Assumptions
*   **Shared Device:** The application will be run on a single device, and all players will interact with this single instance. No real-time synchronization between multiple client devices is required for a single game.
*   **Internet Connectivity:** While internet access is required to search for and retrieve commander data from the Scryfall API, core gameplay tracking (life totals, counters) can proceed offline once the game is set up.
*   **Data Persistence:** Game state needs to survive page refreshes and browser restarts. A hybrid approach of local storage (IndexedDB) and backend persistence (PostgreSQL) is desired.
*   **User Accounts:** There is no user authentication or login system. Games are tied to an anonymous device/browser identifier.
*   **Environment:** The app will be deployed using Docker and Docker Compose.

## 3. MVP Scope
The Minimum Viable Product (MVP) will focus on delivering a functional, robust, and intuitive local game tracker without the complexities of the backend synchronization initially, but with the architecture ready for it.
*   **Frontend-only Core:** Playable game state management entirely in the browser using Zustand and IndexedDB.
*   **Game Setup:** Support for 2-8 players, setting player names, and setting starting life (20, 30, 40, 60, custom).
*   **Scryfall Integration:** Ability to search and assign commanders to players.
*   **Core Counters:** Tracking life totals, poison counters, and commander damage (player-to-player and commander-specific).
*   **Basic UI/UX:** Responsive, touch-friendly layout for mobile, tablet, and desktop.
*   **Archenemy Mode:** Basic UI differentiation for the Archenemy player.

*Note: The backend API and database synchronization can be introduced in a subsequent phase once the core local experience is solid.*

## 4. Out-of-Scope Features
> [!WARNING]
> The following features are explicitly out-of-scope for this project to maintain focus on the core value proposition:
*   User accounts and authentication.
*   Separate player sessions or cross-device multiplayer synchronization (e.g., via WebSockets/SignalR).
*   Turn management, phase tracking, or priority tracking.
*   Complete Magic: The Gathering rules engine (e.g., stack resolution, card interactions).
*   Scheme deck automation for Archenemy mode.

## 5. User Experience Flow
1.  **Home Screen:** Users land on a clean interface offering "Start New Game", "Continue Current Game" (if a saved game exists), and "Discard Saved Game".
2.  **Game Setup (Step-by-Step):**
    *   *Step 1: Game Mode.* Select Standard Commander or Archenemy.
    *   *Step 2: Player Count.* Select 2 to 8 players. If Archenemy, designate the Archenemy player.
    *   *Step 3: Starting Life.* Select 20, 30, 40, 60, or Custom.
    *   *Step 4 & 5: Player Config & Commander Selection.* For each player, enter a name, choose an accent color, and optionally search/select a Commander via the Scryfall API.
3.  **Main Game Screen:**
    *   **Simplified View (Default):** Displays large, easily tappable areas for each player showing Name, Life Total, Commander art/background, and critical warnings (Poison >= 8, Cmdr Damage >= 18). Quick +/- buttons for life.
    *   **Expanded View:** Tapping a player expands their panel to reveal controls for Poison, Commander Damage (by source), Commander Tax/Casts, Energy, Experience, Rad, and Custom counters, plus manual defeat controls and full Commander card info.
4.  **Global Menu:** A slide-out drawer or overlay for accessing game history, undo/redo, game reset, and settings.

## 6. Responsive Layout Strategy
*   **Mobile (Portrait):** Vertical stacking of player panels. Simplified view focuses heavily on life totals.
*   **Mobile (Landscape):** 2-column or grid layout depending on player count.
*   **Tablet (Portrait/Landscape):** Grid layout (e.g., 2x2 for 4 players, 2x3 for 6 players). Player panels will be larger, making the Expanded View easier to navigate. *Future enhancement: ability to rotate panels 180 degrees for players sitting across the table.*
*   **Desktop:** Grid layout utilizing available width, suitable for projection or large screens.

## 7. Touch Interaction Strategy
*   **Large Touch Targets:** Minimum 48x48dp for all interactive elements (buttons, increment/decrement zones).
*   **No Hover Dependence:** All actions must be accessible via taps.
*   **Clear Visual Feedback:** Immediate visual response (color flash, ripple effect) on tap.
*   **Accidental Input Prevention:** 
    *   Confirmation dialogs for destructive actions (Reset Game, End Game).
    *   "Lock Panel" feature to prevent accidental taps.
    *   CSS `user-select: none` to prevent text highlighting during rapid tapping.
    *   CSS `touch-action: manipulation` to disable double-tap-to-zoom on mobile browsers.
*   **Long Press:** Can be used for secondary actions (e.g., long press on a counter to reset it to 0), but must be discoverable (e.g., via a tooltip or help overlay).

## 8. Frontend Architecture
*   **Framework:** React with TypeScript.
*   **Build Tool:** Vite.
*   **Styling:** Tailwind CSS for utility-first styling and responsiveness.
*   **Routing:** React Router for navigating between Home, Setup, and Game screens.
*   **State Management:** Zustand.
    *   `useGameStore`: Manages core game state (players, scores, turn/history, game mode).
    *   `useUIStore`: Manages transient UI state (modals, active expanded player, theme).
*   **Data Fetching:** Standard `fetch` or `axios` for API calls to the backend.
*   **Folder Structure:** Feature-sliced architecture (`/src/features/...`).

## 9. Backend Architecture
*   **Framework:** ASP.NET Core Web API (.NET 8/9).
*   **Language:** C#.
*   **Architecture:** Clean Architecture / N-Tier (API, Application, Domain, Infrastructure).
    *   **API:** Controllers, middleware, OpenAPI/Swagger configuration.
    *   **Application:** Use cases (Commands/Queries), DTOs, interfaces.
    *   **Domain:** Entities (Game, Player, Action), Enums, domain logic.
    *   **Infrastructure:** EF Core DbContext, PostgreSQL repository implementations, Scryfall HTTP Client.
*   **Scryfall Integration:** The backend acts as a proxy. It will query `api.scryfall.com/cards/search`, parse the response, normalize it to a `CommanderDto`, cache the result (using `IMemoryCache` or Redis later), and return it to the frontend.

## 10. Database Model
*   **Game:** `Id` (UUID), `LocalRecoveryId` (String), `GameMode` (Enum), `StartingLife` (Int), `PlayerCount` (Int), `Status` (Enum), `ArchenemyPlayerId` (UUID, nullable), `CreatedAt`, `UpdatedAt`.
*   **Player:** `Id` (UUID), `GameId` (FK), `Name` (String), `SeatPosition` (Int), `ColorAccent` (String), `Life` (Int), `Poison` (Int), `Energy` (Int), `Experience` (Int), `Rad` (Int), `IsDefeated` (Bool), `DefeatReason` (String), `IsPanelLocked` (Bool).
*   **PlayerCommander:** `Id` (UUID), `PlayerId` (FK), `ScryfallCardId` (String), `Name` (String), `ImageUrl` (String), `ArtCropUrl` (String), `ManaCost` (String), `ColorIdentity` (String), `TypeLine` (String), `OracleText` (String), `Power` (String), `Toughness` (String), `CommanderSlot` (Int), `CastCount` (Int).
*   **CommanderDamage:** `Id` (UUID), `GameId` (FK), `SourceCommanderId` (FK), `TargetPlayerId` (FK), `Damage` (Int).
*   **PlayerCounter:** `Id` (UUID), `PlayerId` (FK), `CounterKey` (String), `DisplayName` (String), `CounterKind` (Enum: Numeric/Boolean), `NumericValue` (Int), `BooleanValue` (Bool).
*   **GameAction (History):** `Id` (UUID), `GameId` (FK), `ActionType` (String), `PlayerId` (FK, nullable), `PreviousStateJson` (Text), `NewStateJson` (Text), `CreatedAt`.

## 11. Persistence and Recovery Strategy
> [!TIP]
> **Recommendation:** Hybrid Local and Backend Persistence.

*   **Phase 1 (MVP): IndexedDB Only.** Use a library like `localforage` or `idb` to sync Zustand state to IndexedDB. This ensures immediate recovery on refresh and offline capability without relying on a backend.
*   **Phase 2: Hybrid.** 
    *   The browser generates a unique `LocalRecoveryId` (UUID) stored in LocalStorage/Cookie.
    *   As the game progresses, state is saved to IndexedDB instantly.
    *   The frontend debounces/batches updates and sends them to the `.NET` backend via REST (`PUT /api/games/{id}`).
    *   On startup, the frontend checks IndexedDB. It also queries the backend using the `LocalRecoveryId`. If the backend has a newer `UpdatedAt` timestamp (e.g., user cleared browser data but kept the cookie), it restores from the backend.
    *   If offline, the app operates entirely on IndexedDB and syncs to the backend when connectivity is restored.

## 12. API Design
*   `POST /api/games` - Create a new game.
*   `GET /api/games/{gameId}` - Retrieve full game state.
*   `PUT /api/games/{gameId}` - Update full game state (used for periodic syncing).
*   `DELETE /api/games/{gameId}` - End/abandon a game.
*   `POST /api/games/{gameId}/actions` - Record a specific game action (for history).
*   `GET /api/commanders/search?q={query}` - Search Scryfall (proxied). returns `List<CommanderDto>`.
*   `GET /api/commanders/{scryfallId}` - Get specific commander details.

## 13. Commander and Scryfall Strategy
*   **Search:** The backend will query Scryfall using `q=type:legendary type:creature OR type:planeswalker is:commander name:"{query}"`.
*   **Normalization:** The backend maps Scryfall's complex JSON into a clean `CommanderDto`.
*   **Double-Faced Cards:** The backend will check for the `card_faces` array in the Scryfall response. If present, it will extract the image URIs from the front face (index 0) for display, but may concatenate oracle text from both faces.
*   **Caching:** The .NET backend will implement `IMemoryCache` to store Scryfall responses for 24 hours to reduce external API calls.

## 14. Counter Model
*   **Core:** Life, Poison, Commander Damage.
*   **Built-in:** Energy, Experience, Rad.
*   **Custom:** A dynamic array/list of `PlayerCounter` objects on the Player entity. This allows adding "Storm", "Treasure", or custom Boolean flags like "City's Blessing".

## 15. Defeat and Warning Rules
*   **Warnings:** Rendered visually (e.g., pulsing red border, warning icon).
    *   Poison == 8 (Warning), Poison == 9 (Critical)
    *   Commander Damage == 18 (Warning), Commander Damage >= 20 (Critical)
*   **Defeat:**
    *   Life <= 0 OR Poison >= 10 OR Commander Damage >= 21.
    *   When conditions are met, prompt user: "Player X has reached 0 life. Mark as defeated?" to prevent accidental game-overs from fat-fingering the life total.

## 16. History, Undo, and Redo
*   **Approach:** Redux-style action history combined with state snapshots.
*   Zustand's middleware (e.g., `zundo`) can be used on the frontend to easily implement local undo/redo functionality for the state object.
*   The backend `GameAction` table will serve as an audit log of the game, rather than being used to rebuild state (Event Sourcing is too complex for this MVP).

## 17. Archenemy Support
*   **MVP:** A boolean flag `isArchenemy` on the Player entity. UI renders this player's panel differently (e.g., larger, top of the screen, specific border).
*   **Future:** Add models for Schemes and a dedicated "Scheme Deck" view.

## 18. Accessibility
*   Semantic HTML buttons for all controls.
*   `aria-labels` for icon-only buttons (e.g., `aria-label="Increase life by 1"`).
*   Sufficient color contrast for text against dynamic commander art backgrounds (using CSS backdrop-filters or dark overlays).
*   Support for system-level "Prefers Reduced Motion" (disabling flashy animations on life change).

## 19. Testing Strategy
*   **Backend:** 
    *   Unit Tests (xUnit, Moq) for Application services and Domain logic.
    *   Integration Tests for API endpoints using `WebApplicationFactory` and an in-memory or Testcontainers database.
*   **Frontend:** 
    *   Unit/Component Tests (Vitest, React Testing Library) for complex UI components (e.g., Life Counter buttons).
    *   State Tests for Zustand stores to ensure game logic (e.g., defeat detection) works correctly.

## 20. Implementation Phases

*   **Phase 1: Foundation & Infrastructure**
    *   *Objectives:* Setup .NET API, React+Vite frontend, Docker Compose, Database migrations.
    *   *Deliverable:* Running boilerplate applications connected to the database.
*   **Phase 2: Core Frontend State & UI**
    *   *Objectives:* Implement Zustand store for Game and Players. Build basic Home Screen and Game Setup UI (without Scryfall). Build main Game Board with Life tracking.
    *   *Deliverable:* Playable offline life counter.
*   **Phase 3: Advanced Counters & Rules**
    *   *Objectives:* Add Poison, Commander Damage, Energy, and Custom counters. Implement warning/defeat logic.
    *   *Deliverable:* Fully functional local MTG tracker.
*   **Phase 4: Scryfall Integration**
    *   *Objectives:* Implement backend Scryfall proxy. Add Commander search to frontend Setup. Update Game Board to display commander art.
    *   *Deliverable:* Rich UI with MTG artwork.
*   **Phase 5: Backend Persistence & Sync**
    *   *Objectives:* Implement EF Core models, repositories, and API endpoints. Implement frontend syncing logic (saving/loading state).
    *   *Deliverable:* Cloud-backed game recovery.
*   **Phase 6: Polish & Optimizations**
    *   *Objectives:* Undo/Redo, Archenemy layout, touch optimizations, accessibility audit.
    *   *Deliverable:* Production-ready application.

## 21. Summary and Recommendations

**Recommended MVP:**
The MVP should consist of **Phases 1 through 4**. This delivers a complete, highly visual, and functional local life tracker that utilizes Scryfall data. Backend persistence (Phase 5) is valuable but not strictly necessary for an initial release of a same-device companion app, as IndexedDB can handle local retention.

**Recommended First Implementation Phase:**
**Phase 1 (Foundation & Infrastructure)** followed immediately by **Phase 2 (Core Frontend State & UI)**. Getting the basic life tracking working locally provides immediate tangible value and sets the stage for the rest of the app.

**Main Technical Risks:**
1.  **State Synchronization:** Ensuring the frontend IndexedDB state and backend PostgreSQL state don't conflict or overwrite each other improperly if the user loses and regains internet connection.
2.  **Scryfall Rate Limiting/Changes:** Depending heavily on a third-party API. The backend caching layer is critical to mitigate this.
3.  **UI Clutter:** Fitting 8 players with multiple counters on a single mobile screen without making touch targets too small.

**Decisions that can be postponed:**
*   Implementing the full event-sourcing/history log on the backend.
*   Implementing the Archenemy Scheme deck logic.
*   Panel rotation for tablets (can be added in a polish phase).

**Blocking Questions:**
*   *None at this time.* The requirements provide a clear enough picture to begin architecture setup and Phase 1.
