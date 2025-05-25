# LLM Benchmark App

## Overview

The LLM Benchmark App provides an easy way for users to compare responses from different Language Learning Models (LLMs) side-by-side. This tool is useful for developers, researchers, or anyone curious about LLM capabilities and performance for specific prompts. It allows for quick evaluation of model outputs, helping users make informed decisions about which LLM best suits their needs.

## Table of Contents

-   [Overview](#overview)
-   [Features](#features)
-   [Project Structure](#project-structure)
    -   [Architecture Overview](#architecture-overview)
-   [Prerequisites](#prerequisites)
-   [Running the Application (Docker - Recommended)](#running-the-application-docker---recommended)
-   [How to Use](#how-to-use)
-   [API Keys and Model Support](#api-keys-and-model-support)
-   [Troubleshooting](#troubleshooting)
-   [Manual Local Development of Services](#manual-local-development-of-services)

LLM Benchmark App is a web application built with Next.js (App Router), TypeScript, and Tailwind CSS for the frontend. It interacts with a Python Flask backend service that utilizes the LiteLLM library to benchmark various Language Learning Models (LLMs).

**This application is designed to be run using Docker.**

## Features

-   Select prompts from a predefined list (loaded from the `/prompts` directory).
-   Choose models from different providers (OpenAI, Anthropic, Google) via dropdown.
-   Set and manage API keys for different LLM providers via the Settings dialog.
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
-   `/python_benchmark_service/`: Python Flask backend service for LLM interaction. For manual local development and testing of this service, see the `python_benchmark_service/README.md`.
    -   `main.py`: Flask application exposing the `/benchmark_py` endpoint.
    -   `pyproject.toml`: Python project configuration and dependencies managed by `uv`.
    -   `.venv/`: Python virtual environment managed by `uv` (for local manual development).
-   `/Dockerfile`: Dockerfile for the Next.js frontend.
-   `/python_benchmark_service/Dockerfile`: Dockerfile for the Python backend.
-   `/docker-compose.yml`: Docker Compose file to orchestrate both services.
-   `/.env`: Stores API keys (e.g., `OPENAI_API_KEY`). **This file is not committed to Git.** Create it from `.env.example` or manually.

### Architecture Overview

The application follows a client-server architecture with a proxy layer:

1.  **User Interaction:** The user interacts with the Next.js frontend in their browser.
2.  **Frontend to Next.js Backend:** When the user initiates a benchmark, the Next.js frontend (running on `http://localhost:3000`) sends a request to its own backend API route (`/api/benchmark`).
3.  **Next.js Backend to Python Backend (Proxy):** This Next.js API route acts as a proxy. It forwards the benchmark request to the Python Flask backend service, which is typically running on `http://127.0.0.1:5371` (or `http://python-service:5371` within the Docker network).
4.  **Python Backend to LLMs:** The Python Flask service receives the request, uses the LiteLLM library to interface with the specified Language Learning Models (e.g., OpenAI, Anthropic, local models via Ollama), and fetches their responses.
5.  **Response Flow:** The responses from the LLMs are returned to the Python service, then back to the Next.js backend API, which in turn sends them to the Next.js frontend to be displayed to the user.

This can be visualized as:

`User -> Next.js Frontend (Browser) -> Next.js Backend API (/api/benchmark) -> Python Flask Backend (/benchmark_py) -> LiteLLM -> LLMs`

This setup decouples the frontend from direct interaction with the LLM APIs and centralizes the core benchmarking logic in the Python service.

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
2.  Select models for "LLM 1" and "LLM 2" from the dropdown list. The models are listed with their fully qualified names (e.g., `openai/o4-mini`, `anthropic/claude-4-sonnet`).
3.  Ensure you've added the corresponding API keys for all selected models in the Settings panel or in your environment variables.
4.  The interface will indicate whether required API keys are configured.
5.  Click "Run Benchmark" (button is disabled if required API keys are missing).
6.  View the summarized responses.
7.  Click "View Full Response" to see the complete markdown output from each LLM in a dialog.

## API Keys and Model Support

The application supports multiple LLM providers:

1. **OpenAI Models:** 
   - Can be set in the `.env` file (environment variable: `OPENAI_API_KEY`)
   - Examples: `openai/o4-mini`, `openai/gpt-4.1-nano`

2. **Anthropic Models:** 
   - Can be set in the `.env` file (environment variable: `ANTHROPIC_API_KEY`)
   - Can be set in the UI via Settings
   - Examples: `anthropic/claude-4-sonnet`

3. **Google (Gemini) Models:** 
   - Can be set in the `.env` file (environment variable: `GEMINI_API_KEY`)
   - Can be set in the UI via Settings
   - Examples: `gemini/gemini-2.5-flash`

The application automatically:
- Uses fully qualified model names with provider prefixes (e.g., `openai/`, `anthropic/`, `gemini/`)
- Validates if the necessary API keys are available for ALL models before allowing benchmark execution
- Shows visual indicators of API key status in the model selector

## Troubleshooting

-   **API Key Errors:** Ensure your API keys in `.env` are correct and have access to the models you are trying to use. Check the terminal output of the Python Flask service for error messages from LiteLLM.
-   **Missing API Keys:** Ensure you've added the corresponding API keys in the Settings panel or environment variables for all models you wish to use. The UI will indicate which keys are missing.
-   **Python Service Not Running:** Make sure the Flask service (`python_benchmark_service/main.py`) is running and accessible at the configured URL (default `http://127.0.0.1:5371`).
-   **`uv` environment issues:** Ensure `uv` is installed and the virtual environment in `python_benchmark_service/.venv` is correctly set up and activated when running `main.py`.
-   **"params should be awaited" warning in Next.js console:** This was addressed by updating how dynamic route parameters are handled in `src/app/api/prompt/[filename]/route.ts`. If it reappears, Next.js documentation for dynamic routes should be consulted.
-   **Docker port conflicts:** If you see an error like `Error response from daemon: Ports are not available`, ensure that port 3000 (for frontend) or 5371 (for backend) are not already in use by other applications on your system.

## Manual Local Development of Services

For instructions on running the Next.js frontend and Python backend services manually for development, please refer to their respective README files:

-   **Next.js Frontend:** Detailed instructions for manual setup and execution are typically found in standard Next.js project documentation. Generally, navigate to the project root, install dependencies (`npm install`), and run the development server (`npm run dev`). Ensure any necessary environment variables (e.g., `NEXT_PUBLIC_PYTHON_API_BASE_URL`) are set, usually via a `.env.local` file in the project root.
-   **Python Backend Service:** See `python_benchmark_service/README.md` for detailed instructions on setting up and running the Python Flask service independently.
