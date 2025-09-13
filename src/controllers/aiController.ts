import { Request, Response } from "express";

// Service de fallback avec réponses intelligentes
const getFallbackResponse = (userMessage: string, modelData: any): string => {
    const message = userMessage.toLowerCase();

    // Réponses contextuelles basées sur le message
    if (message.includes("bonjour") || message.includes("salut") || message.includes("coucou")) {
        return modelData
            ? `Enchanté ! Je suis ${modelData.prenom}, comment vas-tu aujourd'hui ?`
            : "Enchanté ! Comment vas-tu aujourd'hui ?";
    }

    if (message.includes("ça va") || message.includes("comment vas-tu")) {
        return "Je vais très bien, merci de demander ! Et toi, comment se passe ta journée ?";
    }

    if (message.includes("prénom") || message.includes("appelles") || message.includes("nom")) {
        return modelData
            ? `Je m'appelle ${modelData.prenom}, ravi de faire ta connaissance !`
            : "Je suis ton compagnon virtuel, ravi de faire ta connaissance !";
    }

    if (message.includes("âge") || message.includes("vie")) {
        return modelData
            ? `J'ai ${modelData.age} ans, et toi ?`
            : "Je suis un être virtuel éternellement jeune, et toi ?";
    }

    if (message.includes("hobby") || message.includes("passe-temps") || message.includes("loisir")) {
        return modelData
            ? `J'adore ${modelData.passe_temps.toLowerCase()}. Qu'est-ce qui te passionne toi ?`
            : "J'adore discuter avec des personnes intéressantes comme toi. Et toi, qu'est-ce qui te passionne ?";
    }

    if (message.includes("habites") || message.includes("ville") || message.includes("où")) {
        return modelData
            ? `Je vis à ${modelData.domicile}, une ville magnifique ! Et toi, tu es d'où ?`
            : "Je vis dans le monde virtuel, mais j'adore découvrir de nouveaux endroits. Et toi, tu es d'où ?";
    }

    if (message.includes("citation") || message.includes("phrase") || message.includes("préférée")) {
        return modelData
            ? `Ma citation préférée est : "${modelData.citation}". Qu'en penses-tu ?`
            : "J'aime beaucoup cette citation : 'La vie est un mystère qu'il faut vivre, et non un problème à résoudre'. Qu'en penses-tu ?";
    }

    // Réponses génériques
    const genericResponses = [
        "Intéressant ! Dis-m'en plus 💫",
        "Je vois ce que tu veux dire... Continue ✨",
        "C'est fascinant ! Raconte-moi plus sur ça",
        "J'adore apprendre de nouvelles choses. Peux-tu développer ?",
        "Très bien dit 👍 J'aimerais en savoir plus",
        "C'est une perspective intéressante. Comment en es-tu arrivé là ?",
        "Je comprends tout à fait. Que penses-tu de cela ?",
        "C'est vraiment intéressant ! Comment te sens-tu par rapport à ça ?",
        "Je vois. Et si on parlait de tes passions ?",
        "C'est captivant ! Y a-t-il autre chose que tu aimerais partager ?"
    ];

    return genericResponses[Math.floor(Math.random() * genericResponses.length)];
};

// API gratuite - DeepSeek Chat (gratuit)
const tryDeepSeekAPI = async (message: string, history: any[]): Promise<string | null> => {
    try {
        const response = await fetch("https://api.deepseek.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                model: "deepseek-chat",
                messages: [
                    {
                        role: "system",
                        content: "Tu es un assistant conversationnel sympathique et utile. Réponds de manière naturelle et engageante."
                    },
                    ...history,
                    { role: "user", content: message }
                ],
                max_tokens: 150,
                temperature: 0.7,
            }),
            timeout: 10000 // Timeout de 10 secondes
        });

        if (response.ok) {
            const data = await response.json();
            return data.choices[0]?.message?.content || null;
        }
        return null;
    } catch (error) {
        console.log("DeepSeek API non disponible, utilisation du fallback");
        return null;
    }
};

// API gratuite - Hugging Face Inference API (gratuit)
const tryHuggingFaceAPI = async (message: string): Promise<string | null> => {
    try {
        const response = await fetch(
            "https://api-inference.huggingface.co/models/microsoft/DialoGPT-medium",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    inputs: message,
                    parameters: {
                        max_length: 100,
                        temperature: 0.7
                    }
                }),
                timeout: 10000
            }
        );

        if (response.ok) {
            const data = await response.json();
            return data.generated_text || null;
        }
        return null;
    } catch (error) {
        console.log("Hugging Face API non disponible");
        return null;
    }
};

export const chatWithAI = async (req: Request, res: Response) => {
    try {
        const { message, history, modelData } = req.body;

        // Vérifier que le message est présent
        if (!message) {
            return res.status(400).json({
                success: false,
                error: "Le message est requis"
            });
        }

        let reply: string;
        let usedAPI = "fallback";

        // Essayer d'abord DeepSeek (gratuit)
        const deepSeekReply = await tryDeepSeekAPI(message, history || []);
        if (deepSeekReply) {
            reply = deepSeekReply;
            usedAPI = "deepseek";
        } else {
            // Essayer Hugging Face en backup
            const huggingFaceReply = await tryHuggingFaceAPI(message);
            if (huggingFaceReply) {
                reply = huggingFaceReply;
                usedAPI = "huggingface";
            } else {
                // Fallback vers nos réponses intelligentes
                reply = getFallbackResponse(message, modelData);
                usedAPI = "fallback";
            }
        }

        // Simulation du temps de réponse réaliste
        const delay = Math.random() * 800 + 400;

        setTimeout(() => {
            res.status(200).json({
                success: true,
                reply,
                timestamp: new Date().toISOString(),
                source: usedAPI
            });
        }, delay);

    } catch (error) {
        console.error("Erreur dans le contrôleur AI:", error);

        // Fallback garanti en cas d'erreur
        const fallbackReply = getFallbackResponse(
            req.body.message || "Bonjour",
            req.body.modelData
        );

        res.status(200).json({
            success: true,
            reply: fallbackReply,
            source: "fallback-error",
            timestamp: new Date().toISOString()
        });
    }
};