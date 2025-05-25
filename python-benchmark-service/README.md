# Python Benchmark Service

## Table of Contents

- [Overview](#overview)
- [Manual Local Development Setup](#manual-local-development-setup)
  - [Prerequisites (Manual)](#prerequisites-manual)
  - [Setup (Manual)](#setup-manual)
  - [Environment Variables (Manual)](#environment-variables-manual)
  - [Running the Service (Manual)](#running-the-service-manual)
- [Testing](#testing)
  - [Manual Testing](#manual-testing)
  - [Automated Tests](#automated-tests)

## Overview

This service acts as a backend to the LLM Benchmark App. It receives requests to benchmark language models, interacts with various LLM providers via the LiteLLM library, and returns the results.
It is built with Python, Flask, and LiteLLM.

## Manual Local Development Setup

These instructions guide you through setting up and running the Python benchmark service manually on your local machine.

### Prerequisites (Manual)

-   Python (e.g., 3.12 or later, as per the main project's `pyproject.toml`)
-   `uv` (Python package manager): If not already installed, install it globally or in a user-specific environment:
    ```bash
    pip install uv
    ```
-   Access to API keys for the LLM providers you intend to benchmark.

### Setup (Manual)

1.  **Navigate to the Service Directory:**
    Open your terminal and change to the service's directory:
    ```bash
    cd python_benchmark_service
    ```

2.  **Initialize `uv` Environment and Install Dependencies:**
    Create or update the virtual environment and install dependencies specified in `pyproject.toml`:
    ```bash
    uv sync
    ```
    This will create a `.venv` directory within `python_benchmark_service` if it doesn't exist and install all necessary packages.

### Environment Variables (Manual)

To run the service, you need to provide API keys for the LLMs you want to use.

1.  **Create a `.env` file:**
    Inside the `python_benchmark_service` directory, create a file named `.env`.
    ```bash
    touch .env
    ```

2.  **Add API Keys:**
    Open the `.env` file and add your API keys. For example:
    ```env
    OPENAI_API_KEY=your_openai_api_key_here
    ANTHROPIC_API_KEY=your_anthropic_api_key_here
    # Add other keys as needed by LiteLLM
    ```
    The `main.py` script is configured to load these variables from a `.env` file in its current working directory.

    *Note:* If you are running the Python service from the root of the `llm-benchmark-app` project, it might pick up the main `.env` file there. For clarity and isolation, creating a dedicated `.env` inside `python_benchmark_service` is recommended when running it standalone.

### Running the Service (Manual)

1.  **Activate the Virtual Environment:**
    Before running the script, activate the `uv` managed environment. From within the `python_benchmark_service` directory:
    -   On macOS/Linux:
        ```bash
        source .venv/bin/activate
        ```
    -   On Windows (PowerShell):
        ```bash
        .venv\Scripts\Activate.ps1
        ```
    -   On Windows (CMD):
        ```bash
        .venv\Scripts\activate.bat
        ```

2.  **Run the Flask Application:**
    Once the environment is activated and environment variables are set, run the Python script:
    ```bash
    python main.py
    ```
    The service will typically start on `http://127.0.0.1:5371`. You should see output in the console indicating that the Flask development server is running.

## Testing

### Manual Testing

You can test the `/benchmark_py` endpoint using a tool like `curl` or Postman. Make sure the Flask service is running.

**Example using `curl`:**
Open a new terminal and run:
```bash
curl -X POST http://127.0.0.1:5371/benchmark_py \
     -H "Content-Type: application/json" \
     -d '{
           "model1": "gpt-3.5-turbo",
           "model2": "o3-mini",
           "prompt": "Translate \'hello world\' to French."
         }'
```
Replace `"gpt-3.5-turbo"` and `"o3-mini"` with models you have API keys for (and are supported by LiteLLM). The prompt can also be changed. You should receive a JSON response containing the outputs from both models.

*Note:* For `o3-mini` or other OpenAI models, you might need to ensure your `OPENAI_API_KEY` is correctly set in the `.env` file. LiteLLM will prepend `openai/` if not specified for known OpenAI models. For other providers, use their full model identifiers (e.g., `anthropic/claude-3-haiku-20240307`).

### Automated Tests

Currently, there are no formal automated tests (e.g., using pytest) implemented for this service. Testing is primarily done through manual API calls as described above or via the main application's UI.
