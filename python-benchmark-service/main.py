import os
from flask import Flask, request, jsonify
from litellm import completion
from dotenv import load_dotenv

# Load environment variables from .env.local in the parent directory
# Adjust the path if your .env.local is elsewhere or named differently.
dotenv_path = os.path.join(os.path.dirname(__file__), '..', '.env.local')
load_dotenv(dotenv_path=dotenv_path)

# Ensure OPENAI_API_KEY is loaded (or other relevant keys for other models)
# LiteLLM will use this environment variable by default for OpenAI calls.
if not os.getenv("OPENAI_API_KEY"):
    print("Warning: OPENAI_API_KEY not found in environment. LiteLLM calls to OpenAI will likely fail.")

app = Flask(__name__)


@app.route('/benchmark_py', methods=['POST'])
def benchmark_py():
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "Invalid JSON"}), 400

        prompt_content = data.get('promptContent')
        llm1 = data.get('llm1')
        llm2 = data.get('llm2')
        api_key_llm1 = data.get('apiKeyLlm1')
        api_key_llm2 = data.get('apiKeyLlm2')

        if not all([prompt_content, llm1, llm2]):
            return jsonify({"error": "Missing promptContent, llm1, or llm2"}), 400

        

        messages = [{"role": "user", "content": str(prompt_content)}]
        
        response1_content, response2_content = None, None
        error1_message, error2_message = None, None

        # --- Call LLM 1 ---
        try:
            print(f"Calling LLM 1 ({llm1}) via Python LiteLLM...")
            # Use API key if provided
            api_key_param = {}
            if api_key_llm1:
                api_key_param = {"api_key": api_key_llm1}
            
            response_llm1 = completion(model=llm1, messages=messages, **api_key_param)
            if response_llm1.choices and response_llm1.choices[0].message and response_llm1.choices[0].message.content:
                response1_content = response_llm1.choices[0].message.content
            else:
                # Log unexpected structure but still try to stringify
                print(f"Warning: Unexpected response structure from {llm1}: {response_llm1}")
                response1_content = str(response_llm1) # Or however litellm structures non-content responses
        except Exception as e:
            print(f"Error with {llm1}: {e}")
            error1_message = str(e)

        # --- Call LLM 2 ---
        try:
            print(f"Calling LLM 2 ({llm2}) via Python LiteLLM...")
            # Use API key if provided
            api_key_param = {}
            if api_key_llm2:
                api_key_param = {"api_key": api_key_llm2}
                
            response_llm2 = completion(model=llm2, messages=messages, **api_key_param)
            if response_llm2.choices and response_llm2.choices[0].message and response_llm2.choices[0].message.content:
                response2_content = response_llm2.choices[0].message.content
            else:
                print(f"Warning: Unexpected response structure from {llm2}: {response_llm2}")
                response2_content = str(response_llm2)
        except Exception as e:
            print(f"Error with {llm2}: {e}")
            error2_message = str(e)

        return jsonify({
            "llm1": {"model": llm1, "response": response1_content, "error": error1_message},
            "llm2": {"model": llm2, "response": response2_content, "error": error2_message},
        })

    except Exception as e:
        print(f"Error in /benchmark_py endpoint: {e}")
        return jsonify({"error": "Failed to process benchmark request in Python service", "details": str(e)}), 500

if __name__ == '__main__':
    # Runs on port 5000 by default.
    # You can change the port if needed, e.g., app.run(port=5001, debug=True)
    # Ensure this port doesn't clash with your Next.js dev server (usually 3000)
    app.run(debug=True, port=5371) # Using a distinct port