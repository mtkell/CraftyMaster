import { GoogleGenAI } from "@google/genai";
import { Product } from "../types";

// Initialize client inside functions to avoid top-level environment access issues
const getAiClient = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateProductDescription = async (name: string, category: string, price: number): Promise<string> => {
  try {
    const ai = getAiClient();
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Write a compelling, SEO-friendly e-commerce product description for a product named "${name}" in the category "${category}" priced at $${price}. Keep it under 50 words.`,
    });
    return response.text || "Could not generate description.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Error generating description. Please try again.";
  }
};

export const analyzeInventoryInsights = async (products: Product[]): Promise<string> => {
  // Simplify data to save tokens
  const inventorySummary = products.map(p => 
    `${p.name} (Stock: ${p.stockLevel}, Price: $${p.price})`
  ).join('\n');

  try {
    const ai = getAiClient();
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Analyze the following inventory list and provide 3 strategic insights or actions regarding restocking, potential sales, or inventory balance. Keep it brief and professional.\n\n${inventorySummary}`,
      config: {
        systemInstruction: "You are an expert inventory analyst for a retail business.",
      }
    });
    return response.text || "No insights available.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Unable to analyze inventory at this time.";
  }
};