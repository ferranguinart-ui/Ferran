
import { GoogleGenAI, Type } from "@google/genai";
import { ShoppingItem, Status } from "./types";

// Always use the API key directly from process.env.API_KEY as per guidelines
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const parseShoppingInput = async (input: string): Promise<Partial<ShoppingItem>[]> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Procesa esta lista de la compra: "${input}". 
                 SOPORTA ENTRADAS EN ESPAÑOL Y CATALÁN.
                 Extrae los productos, la tienda (si se menciona, si no usa "Cualquiera"), 
                 la categoría lógica, el estado (si es urgente o para ahora usa "ACTIVE", si menciona 'luego' o 'próxima vez' usa "DRAFT")
                 y un EMOJI representativo para el producto.
                 
                 Tiendas comunes a reconocer: Mercadona, Lidl, Carrefour, Alcampo, Eroski.
                 Si no se especifica tienda o se dice "en cualquier sitio", usa "Cualquiera".
                 Mantén los nombres de los productos en el idioma original del usuario.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING, description: 'Nombre del producto' },
              store: { type: Type.STRING, description: 'Supermercado específico o "Cualquiera"' },
              category: { type: Type.STRING, description: 'Categoría (Frutería, Limpieza, etc.)' },
              status: { type: Type.STRING, description: 'ACTIVE o DRAFT' },
              emoji: { type: Type.STRING, description: 'Emoji representativo' }
            },
            required: ["name", "store", "category", "status", "emoji"]
          }
        }
      }
    });

    const text = response.text.trim();
    return JSON.parse(text);
  } catch (error) {
    console.error("Error parsing input with Gemini:", error);
    return [];
  }
};
