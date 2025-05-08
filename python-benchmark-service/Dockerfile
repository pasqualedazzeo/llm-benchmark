# Use an official Python runtime as a parent image
FROM python:3.12-slim

# Set the working directory in the container
WORKDIR /app

# Install uv
RUN pip install uv

# Copy only the pyproject.toml to leverage Docker cache
COPY pyproject.toml ./

# Generate requirements.txt from pyproject.toml
# --no-cache ensures fresh resolution if pyproject.toml changes
# --no-annotate keeps requirements.txt clean, just packages and versions
RUN uv pip compile pyproject.toml -o requirements.txt --no-cache --no-annotate

# Install dependencies from the generated requirements.txt
# --no-cache here ensures fresh downloads if needed
# --system allows installation into the container's system Python
RUN uv pip install -r requirements.txt --no-cache --system

# Copy the rest of the application code
COPY . .

# Make port 5371 available
EXPOSE 5371

# Define environment variables
ENV FLASK_APP main.py
ENV FLASK_RUN_HOST 0.0.0.0
ENV FLASK_RUN_PORT 5371
ENV PYTHONUNBUFFERED 1

# Command to run the application
CMD ["python", "main.py"]
