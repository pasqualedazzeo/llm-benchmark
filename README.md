# LLM Benchmark App

LLM Benchmark App is a web application built with Next.js (App Router), TypeScript, and Tailwind CSS for the frontend. It interacts with a Python Flask backend service that utilizes the LiteLLM library to benchmark various Language Learning Models (LLMs).

**This application is designed to be run using Docker.**

## Features

-   Select prompts from a predefined list (loaded from the `/prompts` directory).
-   Input two LLM model names for benchmarking.
-   View responses from both LLMs side-by-side.
-   View full, formatted markdown responses in a dialog.
-   Dark theme UI using shadcn/ui components.
-   Backend powered by a Python Flask service using LiteLLM for robust model routing.
-   Dockerized for easy setup and deployment.

## Project Structure

-   `/src/app/`: Next.js frontend (App Router)
    -   `/src/app/page.tsx`: Main application page and UI logic.
    -   `/src/app/api/`: Next.js API routes.
        -   `/src/app/api/prompts/route.ts`: Lists available prompts.
        -   `/src/app/api/prompt/[filename]/route.ts`: Fetches content of a specific prompt.
        -   `/src/app/api/benchmark/route.ts`: Acts as a proxy to the Python benchmark service.
-   `/prompts/`: Contains `.txt` files used as prompts for the LLMs.
-   `/python_benchmark_service/`: Python Flask backend service for LLM interaction.
    -   `main.py`: Flask application exposing the `/benchmark_py` endpoint.
    -   `pyproject.toml`: Python project configuration and dependencies managed by `uv`.
    -   `.venv/`: Python virtual environment managed by `uv` (for local manual development).
-   `/Dockerfile`: Dockerfile for the Next.js frontend.
-   `/python_benchmark_service/Dockerfile`: Dockerfile for the Python backend.
-   `/docker-compose.yml`: Docker Compose file to orchestrate both services.
-   `/.env`: Stores API keys (e.g., `OPENAI_API_KEY`). **This file is not committed to Git.** Create it from `.env.example` or manually.

## Prerequisites

-   Docker Desktop (or equivalent Docker environment).
-   API keys for the LLM providers you intend to use.

## Running the Application (Docker - Recommended)

1.  **Environment Variables:**
    Ensure you have a `.env` file in the root of the `llm-benchmark-app` directory. You can copy `.env.example` to `.env` and fill in your API keys:
    ```bash
    cp .env.example .env
    ```
    Then, edit `.env` to add your keys:
    ```env
    OPENAI_API_KEY=your_openai_api_key_here
    # ANTHROPIC_API_KEY=your_anthropic_api_key_here
    # Add other keys as needed
    ```

2.  **Build and Run with Docker Compose:**
    Open a terminal in the root `llm-benchmark-app` directory and run:
    ```bash
    docker-compose up --build
    ```
    This command will build the Docker images for both the frontend and backend services and then start them. The `--build` flag ensures images are rebuilt if there are changes (e.g., to Dockerfiles or source code).

3.  **Open in Browser:**
    Once the services are running, navigate to `http://localhost:3000` in your web browser.

To stop the application, press `Ctrl+C` in the terminal where `docker-compose` is running, and then you can run `docker-compose down` to remove the containers.

## How to Use

1.  Select a prompt from the dropdown menu.
2.  Enter the model names for "LLM 1" and "LLM 2" (e.g., `o3-mini`, `gpt-4o-mini`, `claude-3-haiku-20240307`).
    -   For OpenAI models like `o3-mini` or `gpt-4o-mini`, the backend will automatically prefix them with `openai/` if needed.
    -   For models from other providers supported by LiteLLM, use their full identifiers (e.g., `ollama/llama2`, `anthropic/claude-2`).
3.  Click "Run Benchmark".
4.  View the summarized responses.
5.  Click "View Full Response" to see the complete markdown output from each LLM in a dialog.

## Troubleshooting

-   **API Key Errors:** Ensure your API keys in `.env` are correct and have access to the models you are trying to use. Check the terminal output of the Python Flask service for error messages from LiteLLM.
-   **Python Service Not Running:** Make sure the Flask service (`python_benchmark_service/main.py`) is running and accessible at the configured URL (default `http://127.0.0.1:5371`).
-   **`uv` environment issues:** Ensure `uv` is installed and the virtual environment in `python_benchmark_service/.venv` is correctly set up and activated when running `main.py`.
-   **"params should be awaited" warning in Next.js console:** This was addressed by updating how dynamic route parameters are handled in `src/app/api/prompt/[filename]/route.ts`. If it reappears, Next.js documentation for dynamic routes should be consulted.
-   **Docker port conflicts:** If you see an error like `Error response from daemon: Ports are not available`, ensure that port 3000 (for frontend) or 5371 (for backend) are not already in use by other applications on your system.

## Manual Local Development (Alternative)

If you prefer to run the services manually without Docker:

### Prerequisites (Manual)

-   Node.js (version recommended by Next.js, e.g., 18.x or later)
-   npm or yarn
-   Python (e.g., 3.12 or later, as per `pyproject.toml`)
-   `uv` (Python package manager): Install via `pip install uv` if not already installed.

### Setup (Manual)

1.  **Clone the repository (if applicable).**

2.  **Frontend (Next.js App):**
    Navigate to the `llm-benchmark-app` directory.
    Install Node.js dependencies:
    ```bash
    npm install
    ```

3.  **Backend (Python Flask Service):**
    Navigate to `python_benchmark_service`.
    Initialize `uv` environment and install dependencies:
    ```bash
    uv sync
    ```

4.  **Environment Variables (Manual):**
    Create a `.env.local` file in the root of the `llm-benchmark-app` directory. (Note: the Docker setup uses `.env`). Add your API keys as described in the Docker setup.

### Running the Application (Manual)

1.  **Start Python Backend:**
    In `python_benchmark_service` directory, activate `uv` environment (`.\.venv\Scripts\activate` or `source .venv/bin/activate`) and run `python main.py`.
    Service typically runs on `http://127.0.0.1:5371`.

2.  **Start Next.js Frontend:**
    In `llm-benchmark-app` root, run `npm run dev`.
    Frontend typically at `http://localhost:3000`.
