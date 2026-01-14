/**
 * Driver.js: Gemini 2.0 Flash UI Tour Guide
 * This version connects to your /api/generate endpoint instead of Google directly.
 */

class GeminiTourGuide {
    constructor() {
        this.tourButton = document.querySelector('.neon-btn');
        this.setupEventListeners();
    }

    setupEventListeners() {
        if (!this.tourButton) return;
        
        this.tourButton.addEventListener('click', (e) => {
            e.preventDefault();
            const userRequest = prompt("What would you like to know about the 36-Hour Watch?") || "Give me a quick tour";
            if (userRequest) {
                this.startGeminiTour(userRequest);
            }
        });
    }

    getUIContext() {
        return {
            time: document.getElementById('display-deg')?.innerText || "Unknown",
            seconds: document.getElementById('display-sec')?.innerText || "0",
            timezone: document.querySelector('.timezone-label')?.innerText || "Unknown",
            systemType: "36-Hour Metric Worldwide Watch",
            logic: "The day is divided into 360 degrees. 10 degrees equals 1 'hour'."
        };
    }

    async startGeminiTour(query) {
        this.updateUIFeedback("Gemini 2.0 is analyzing the interface...");

        const context = this.getUIContext();
        const systemPrompt = `You are the Gemini UI Guide. 
        Context: ${JSON.stringify(context)}
        User Query: "${query}"
        Explain the UI elements (rotating map, 36-unit ring) in a futuristic way. Use short sentences.`;

        try {
            const responseText = await this.callGeminiAPI(systemPrompt);
            this.displayResponse(responseText);
        } catch (error) {
            console.error("Tour Error:", error);
            this.updateUIFeedback(`System Offline: ${error.message}`);
        }
    }

    /**
     * SECURE API CALL
     * Hits your own Vercel endpoint. No API keys here!
     */
    async callGeminiAPI(text) {
        const url = "/api/generate"; // Relative path to your serverless function

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ prompt: text })
        });

        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.error || "Communication failed");
        }

        const data = await response.json();
        
        // Extract the text from the Gemini response structure
        return data.candidates[0].content.parts[0].text;
    }

    displayResponse(text) {
        const output = document.getElementById('gemini-text');
        if (output) {
            output.style.color = "#03e9f4";
            output.style.textShadow = "0 0 10px #03e9f4";
            output.innerText = text;
        }
        this.tourButton.innerText = "ASK GEMINI AGAIN";
    }

    updateUIFeedback(msg) {
        const output = document.getElementById('gemini-text');
        if (output) output.innerText = msg;
    }
}

const tourGuide = new GeminiTourGuide();