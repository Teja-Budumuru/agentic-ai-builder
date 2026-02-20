# Agentic AI Builder

A multi-agent system designed to build complete, playable browser games from text prompts using structured reasoning and autonomous code generation.

---
### 📖 Documentation
- [**Detailed Architecture & DB Schema**](./ARCHITECTURE.md)
---

## 🚀 How to Run

### Prerequisites
- Node.js (v22+)
- PostgreSQL (or Neon DB)
- OpenRouter API Key

### Installation
1.  **Clone the repository**:
    ```bash
    git clone <repository-url>
    cd agentic-ai-builder
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    ```

3.  **Environment Setup**:
    Create a `.env` file in the root directory and add:
    ```env
    DATABASE_URL="your-postgresql-url"
    OPENROUTER_API_KEY="your-api-key"
    ```

4.  **Database Setup**:
    ```bash
    npm run db:push
    npm run db:generate
    ```

5.  **Start the Agent**:
    ```bash
    npm start
    ```

---

## 🏗 Agent Architecture

The system uses a **Controller-Agent** architecture to manage the lifecycle of a game's creation.

### 1. Controller (`packages/controller`)
- Acts as the orchestrator.
- Manages the session state in the database.
- Routes user input to the appropriate agent based on the current step.

### 2. Clarifier Agent (`packages/agents/clarifer.ts`)
- **Objective**: Ensure the game idea is well-defined.
- **Function**: Analyzes the initial prompt and asks 2-5 targeted questions about mechanics, controls, and win/lose conditions.
- **Threshold**: Moves to the planning phase once a "confidence" score of 0.8+ is achieved.

### 3. Planner Agent (`packages/agents/planner.ts`)
- **Objective**: Design the technical blueprint.
- **Function**: Decides the framework (`vanilla` or `phaser`), defines systems (collision, scoring), and outlines the game loop.

### 4. Coder Agent (`packages/agents/coder.ts`)
- **Objective**: Generate the source code.
- **Function**: Produces exactly 3 files: `index.html`, `style.css`, and `game.js`.
- **Output**: Pure, playable 2D games using geometric shapes (no external assets required).

---

## 🛠 Trade-offs Made

### 3-File Output Constraint
- **Why**: Reduced complexity for the LLM. By forcing everything into three standard files, we ensure the game remains portable and avoids build-step failures.
- **Impact**: Limits very large-scale games, but significantly increases reliability for "one-shot" generation.

### Geometric Assets Only
- **Why**: Avoids broken image links or the need for an external asset management system.
- **Impact**: Visuals are retro-style (rectangles, circles), but the game is guaranteed to work immediately.

### Sequential Agent Flow
- **Why**: Ensures logical progression. A coder shouldn't start before the planner, and the planner shouldn't start without clarity.
- **Impact**: Slightly slower initial process (due to clarifying questions), but results in much higher quality output.

---

## 🔮 Improvements with More Time

1.  **Iterative Refinement (QA Agent)**: Implement a "Reviewer" agent that runs the generated code and provides feedback to the Coder Agent to fix bugs automatically.
2.  **Asset Generation**: Integrate with Dall-E or Midjourney APIs to generate actual sprite sheets instead of just using shapes.
3.  **Advanced Frameworks**: Add support for Three.js for 3D games or React for UI-heavy games.
4.  **Web UI Integration**: Fully bridge the CLI backend with the `apps/web` frontend for a more interactive dashboard experience.

---

## 🐳 Docker Build and Run

### Build the Image
```bash
docker build -t agentic-ai-builder .
```

### Run the Container
Since the agent is interactive (CLI), use the following command to run it:
```bash
docker run -it --env-file .env agentic-ai-builder
```
> [!NOTE]
> Ensure your `.env` file contains a valid `DATABASE_URL` that is accessible from within the container (e.g., a cloud-hosted Neon DB).
