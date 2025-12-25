
import { GoogleGenAI, GenerateContentResponse, Type } from "@google/genai";
import { Message, KeyAnalysis, DecoderResult } from "../types";

const MODEL_NAME = 'gemini-3-pro-preview';

export const analyzeKey = async (pgpBlock: string): Promise<KeyAnalysis> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `
    Perform a forensic analysis on the following PGP Public Key block. 
    Extract the Key ID (Long or Short format in Hex, e.g., 0x58C948A1).
    Identify the owner identity (UIDs).
    Determine technical properties: Algorithm (RSA, DSA, etc.), Bit length, and Creation date.
    Provide historical context if it is a well-known key.
    
    PGP BLOCK:
    ${pgpBlock}
  `;

  const response = await ai.models.generateContent({
    model: MODEL_NAME,
    contents: prompt,
    config: {
      temperature: 0.1,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          keyId: { 
            type: Type.STRING, 
            description: "The hexadecimal Key ID extracted from the block, prefixed with 0x." 
          },
          owner: { 
            type: Type.STRING, 
            description: "The primary User ID associated with the key." 
          },
          summary: { 
            type: Type.STRING, 
            description: "A high-level summary of what this key is." 
          },
          technicalProperties: { 
            type: Type.STRING, 
            description: "A detailed list of cryptographic properties." 
          },
          historicalContext: { 
            type: Type.STRING, 
            description: "Historical significance if applicable (e.g. Satoshi Nakamoto, Hal Finney)." 
          }
        },
        required: ["keyId", "summary", "technicalProperties"],
      },
      thinkingConfig: { thinkingBudget: 2048 }
    }
  });

  try {
    return JSON.parse(response.text || "{}") as KeyAnalysis;
  } catch (e) {
    throw new Error("Failed to parse cryptographic analysis.");
  }
};

export const decodePgpBlock = async (pgpBlock: string): Promise<DecoderResult> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `
    Inspect this PGP block (Message, Signature, or Key). 
    Perform a packet-level breakdown. Identify packet tags (e.g., Tag 1: Public-Key Encrypted Session Key, Tag 18: Sym. Encrypted and Integrity Protected Data).
    Explain what each part does. If it's a clear-signed message, extract the text.
    
    PGP BLOCK:
    ${pgpBlock}
  `;

  const response = await ai.models.generateContent({
    model: MODEL_NAME,
    contents: prompt,
    config: {
      temperature: 0.1,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          type: { type: Type.STRING, description: "Type of PGP block (e.g., 'Encrypted Message', 'Signature')" },
          packets: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                tag: { type: Type.STRING },
                description: { type: Type.STRING },
                length: { type: Type.STRING }
              },
              required: ["tag", "description"]
            }
          },
          securityNote: { type: Type.STRING, description: "Technical note on encryption strength or signature validity if detectable." },
          extractedContent: { type: Type.STRING, description: "Human-readable text if it's a clear-text signature or identifiable part." }
        },
        required: ["type", "packets", "securityNote"]
      },
      thinkingConfig: { thinkingBudget: 2048 }
    }
  });

  try {
    return JSON.parse(response.text || "{}") as DecoderResult;
  } catch (e) {
    throw new Error("Failed to decode PGP sequence.");
  }
};

export const chatWithAssistant = async (history: Message[], userInput: string): Promise<{ text: string; sources?: any[] }> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const contents = history.map(h => ({
    role: h.role,
    parts: [{ text: h.text }]
  }));
  
  contents.push({
    role: 'user',
    parts: [{ text: userInput }]
  });

  const response = await ai.models.generateContent({
    model: MODEL_NAME,
    contents: contents as any,
    config: {
      systemInstruction: "You are a world-class cryptography expert. You specialize in PGP, asymmetric encryption, and the history of cypherpunks. You are helpful, precise, and maintain a high-tech, professional persona.",
      tools: [{ googleSearch: {} }]
    }
  });

  return {
    text: response.text || "I'm sorry, I couldn't process that.",
    sources: response.candidates?.[0]?.groundingMetadata?.groundingChunks
  };
};
