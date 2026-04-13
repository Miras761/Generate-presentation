import { GoogleGenAI } from '@google/genai';

function getAIClient(customKey?: string): GoogleGenAI {
  const apiKey = customKey || process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is missing. Please provide it in the form.");
  }
  return new GoogleGenAI({ apiKey });
}

export async function generatePresentationStructure(topic: string, language: string, customKey?: string) {
  const ai = getAIClient(customKey);
  const prompt = `You are an expert presentation creator. Create a presentation about "${topic}" in the following language: ${language}.
You MUST return ONLY a clean JSON object without any markdown formatting around it (no \`\`\`json).
Structure:
{
  "title": "Presentation Title",
  "slides": [
    {
      "title": "Slide 1 Title",
      "content": "Markdown text bullet points",
      "image_prompt_english": "A highly detailed visual description IN ENGLISH ONLY for the image generator"
    }
  ]
}
Provide exactly 5 slides.`;

  const response = await ai.models.generateContent({
    model: 'gemini-1.5-flash',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
    }
  });

  const text = response.text;
  if (!text) throw new Error("No response from Gemini");
  
  try {
    return JSON.parse(text);
  } catch (e) {
    console.error("Failed to parse JSON from Gemini:", text);
    throw new Error("Invalid JSON format returned from AI.");
  }
}

export async function generateImage(prompt: string, theme: string, customKey?: string): Promise<string> {
  const hfKey = customKey || import.meta.env.VITE_HUGGINGFACE_API_KEY;
  if (!hfKey) throw new Error("Hugging Face API key is missing. Please provide it in the form.");

  const fullPrompt = `${prompt}, ${theme} style, masterpiece, 8k, highly detailed, beautiful lighting`;
  
  const response = await fetch(
    "https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-xl-base-1.0",
    {
      headers: {
        Authorization: `Bearer ${hfKey}`,
        "Content-Type": "application/json",
      },
      method: "POST",
      body: JSON.stringify({ inputs: fullPrompt }),
    }
  );

  if (!response.ok) {
    throw new Error(`Hugging Face API error: ${response.statusText}`);
  }

  const blob = await response.blob();
  
  // Convert blob to base64 so it can be saved to Firestore
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}
