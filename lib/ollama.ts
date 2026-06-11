export async function askOllama(prompt: string): Promise<string> {
  const response = await fetch("http://localhost:11434/api/generate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "gemma3:4b",
      prompt,
      stream: false
    })
  });

  if (!response.ok) {
    throw new Error(`Ollama API returned error status: ${response.status}`);
  }

  const data = await response.json();
  return data.response;
}
