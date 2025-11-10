interface KeyStatus {
    key: string;
    exhaustedUntil: number; // Timestamp until which the key is considered exhausted
}

class ApiKeyManager {
    private geminiKeyPool: KeyStatus[];
    private openRouterKeyPool: KeyStatus[];
    private geminiIndex: number;
    private openRouterIndex: number;

    constructor() {
        // Hardcoded keys provided by the user to fix the "Invalid API Key" error
        const geminiKeys = [
            "AIzaSyDMcr7ruFGmUNGYRCf_aQo8f1oiUXYJ5AE",
            "AIzaSyD6SlisIpmQr_xRj8jXF-DzQY4Agb9XDHo",
            "AIzaSyDYEbNg8wUquCUwTeHVgu6JAjx4dlkRDnE",
        ].filter((key): key is string => typeof key === 'string' && key.trim() !== '');
        
        const openRouterKeys = [
            "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",
            "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",
            "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",
            "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",
            "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",
            "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",
        ].filter((key): key is string => typeof key === 'string' && key.trim() !== '');

        this.geminiKeyPool = geminiKeys.map(key => ({ key, exhaustedUntil: 0 }));
        this.openRouterKeyPool = openRouterKeys.map(key => ({ key, exhaustedUntil: 0 }));

        if (this.geminiKeyPool.length === 0) {
            console.warn("Nenhuma chave de API da Gemini foi configurada. As funcionalidades que dependem do Gemini podem falhar.");
        }
        if (this.openRouterKeyPool.length === 0) {
            console.warn("Nenhuma chave de API da OpenRouter foi configurada. As funcionalidades que dependem do OpenRouter podem falhar.");
        }
        
        this.geminiIndex = 0;
        this.openRouterIndex = 0;
    }

    public getNextKey(provider: 'gemini' | 'openrouter'): string | null {
        const keyPool = provider === 'gemini' ? this.geminiKeyPool : this.openRouterKeyPool;
        let currentIndex = provider === 'gemini' ? this.geminiIndex : this.openRouterIndex;

        if (keyPool.length === 0) return null;

        let attempts = 0;

        while (attempts < keyPool.length) {
            const keyStatus = keyPool[currentIndex];

            if (Date.now() >= keyStatus.exhaustedUntil) {
                // This key is available. Update the starting point for the next search.
                if (provider === 'gemini') {
                    this.geminiIndex = (currentIndex + 1) % keyPool.length;
                } else {
                    this.openRouterIndex = (currentIndex + 1) % keyPool.length;
                }
                return keyStatus.key;
            }
            
            currentIndex = (currentIndex + 1) % keyPool.length;
            attempts++;
        }
        
        // All keys are currently exhausted.
        return null;
    }

    public reportExhaustedKey(provider: 'gemini' | 'openrouter', exhaustedKey: string) {
        const keyPool = provider === 'gemini' ? this.geminiKeyPool : this.openRouterKeyPool;
        const keyStatus = keyPool.find(k => k.key === exhaustedKey);
        if (keyStatus) {
            // Mark as exhausted for 65 seconds to be safe with per-minute quotas.
            const exhaustedForMs = 65 * 1000;
            keyStatus.exhaustedUntil = Date.now() + exhaustedForMs;
            console.log(`API key ...${exhaustedKey.slice(-4)} for ${provider} marked as exhausted for ${exhaustedForMs / 1000}s.`);
        }
    }
}

export const apiKeyManager = new ApiKeyManager();