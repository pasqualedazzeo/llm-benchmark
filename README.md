# LLM Benchmark App

A web application for running evaluations on Large Language Model (LLM) text production. Test and compare different LLMs using your own API keys with custom prompts and variable placeholders.

## Features

- **Custom Prompts**: Create and manage custom prompts for testing LLMs
- **Variable Placeholders**: Use placeholder variables for larger text contents and dynamic prompt customization
- **Model Comparison**: Run side-by-side comparisons between different LLM providers (OpenAI, Anthropic, Google)
- **Evaluation Storage**: Store and review your evaluation results
- **API Key Management**: Use your own API keys for different LLM providers

## TODO

Currently empty - contributions welcome! Feel free to open issues or submit pull requests to help improve the project.

## Quick Start

### Using Docker (Recommended)

1. Copy environment variables:
   ```bash
   cp .env.example .env
   ```

2. Add your API keys to `.env`:
   ```env
   OPENAI_API_KEY=your_openai_api_key_here
   ANTHROPIC_API_KEY=your_anthropic_api_key_here
   ```

3. Run with Docker Compose:
   ```bash
   docker-compose up --build
   ```

4. Open http://localhost:3000 in your browser

### Manual Development Setup

**Backend (Python with uv):**
```bash
cd python-benchmark-service
uv sync
uv run python main.py
```

**Frontend (Node.js with npm):**
```bash
npm install
npm run dev
```

## Contributing

We welcome contributions! Please feel free to submit issues, feature requests, or pull requests to help make this project better.
