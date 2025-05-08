# LLM Benchmark App

LLM Benchmark App is a web application built with Next.js (App Router), TypeScript, and Tailwind CSS for the frontend. It interacts with a Python Flask backend service that utilizes the LiteLLM library to benchmark various Language Learning Models (LLMs).

## Features

-   Select prompts from a predefined list (loaded from the `/prompts` directory).
-   Input two LLM model names for benchmarking.
-   View responses from both LLMs side-by-side.
-   View full, formatted markdown responses in a dialog.
-   Dark theme UI using shadcn/ui components.
-   Backend powered by a Python Flask service using LiteLLM for robust model routing.

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
    -   `.venv/`: Python virtual environment managed by `uv`.
-   `/.env.local`: Stores API keys (e.g., `OPENAI_API_KEY`). **This file is not committed to Git.**

## Prerequisites

-   Node.js (version recommended by Next.js, e.g., 18.x or later)
-   npm or yarn
-   Python (e.g., 3.9 or later)
-   `uv` (Python package manager): Install via `pip install uv` if not already installed.

## Setup

1.  **Clone the repository (if applicable).**

2.  **Frontend (Next.js App):**
    Navigate to the `llm-benchmark-app` directory (this directory):
    ```bash
    cd path/to/llm-benchmark-app
    ```
    Install Node.js dependencies:
    ```bash
    npm install
    # or
    # yarn install
    ```

3.  **Backend (Python Flask Service):**
    Navigate to the Python service directory:
    ```bash
    cd python_benchmark_service
    ```
    Initialize the `uv` environment and install dependencies (if `pyproject.toml` and `.venv` are not already set up):
    ```bash
    uv init --no-workspace 
    # (if pyproject.toml doesn't exist or is minimal)
    # The --no-workspace flag might be needed if there's a pyproject.toml in a parent directory causing issues.
    
    uv add Flask litellm python-dotenv Werkzeug 
    # (or simply `uv sync` if pyproject.toml already lists these)
    ```
    Alternatively, if `pyproject.toml` is complete, just sync the environment:
    ```bash
    uv sync
    ```

4.  **Environment Variables:**
    Create a `.env.local` file in the root of the `llm-benchmark-app` directory (`c:\dev\personal\CascadeProjects\windsurf-project\llm-benchmark-app\.env.local`).
    Add your LLM API keys. For example, for OpenAI:
    ```env
    OPENAI_API_KEY=your_openai_api_key_here
    # Add other keys like ANTHROPIC_API_KEY if you plan to use those models
    ```
    The Python service (`python_benchmark_service/main.py`) is configured to load this `.env.local` file from its parent directory.

## Running the Application

You need to run both the Python backend service and the Next.js frontend development server.

1.  **Start the Python Backend Service:**
    Open a terminal in the `python_benchmark_service` directory.
    Activate the `uv` virtual environment:
    ```bash
    # On Windows (PowerShell/CMD):
    .\.venv\Scripts\activate
    # On macOS/Linux:
    # source .venv/bin/activate
    ```
    Run the Flask application:
    ```bash
    python main.py
    ```
    The service will start, typically on `http://127.0.0.1:5371`.

2.  **Start the Next.js Frontend:**
    Open another terminal in the root `llm-benchmark-app` directory.
    Run the Next.js development server:
    ```bash
    npm run dev
    # or
    # yarn dev
    ```
    The frontend will be available, typically at `http://localhost:3000`.

3.  **Open in Browser:**
    Navigate to `http://localhost:3000` in your web browser.

## How to Use

1.  Select a prompt from the dropdown menu.
2.  Enter the model names for "LLM 1" and "LLM 2" (e.g., `o3-mini`, `gpt-4o-mini`, `claude-3-haiku-20240307`).
    -   For OpenAI models like `o3-mini` or `gpt-4o-mini`, the backend will automatically prefix them with `openai/` if needed.
    -   For models from other providers supported by LiteLLM, use their full identifiers (e.g., `ollama/llama2`, `anthropic/claude-2`).
3.  Click "Run Benchmark".
4.  View the summarized responses.
5.  Click "View Full Response" to see the complete markdown output from each LLM in a dialog.

## Troubleshooting

-   **API Key Errors:** Ensure your API keys in `.env.local` are correct and have access to the models you are trying to use. Check the terminal output of the Python Flask service for error messages from LiteLLM.
-   **Python Service Not Running:** Make sure the Flask service (`python_benchmark_service/main.py`) is running and accessible at the configured URL (default `http://127.0.0.1:5371`).
-   **`uv` environment issues:** Ensure `uv` is installed and the virtual environment in `python_benchmark_service/.venv` is correctly set up and activated when running `main.py`.
-   **"params should be awaited" warning in Next.js console:** This was addressed by updating how dynamic route parameters are handled in `src/app/api/prompt/[filename]/route.ts`. If it reappears, Next.js documentation for dynamic routes should be consulted.
