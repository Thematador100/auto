# Multi-API Provider Integration System

## 🚀 Advanced AI Integration for AI Auto Pro

This documentation covers the advanced multi-API provider integration system that allows you to seamlessly use multiple AI services (Google Gemini, OpenAI, DeepSeek, Anthropic Claude, and more) with automatic fallback, load balancing, cost optimization, and comprehensive analytics.

---

## 📋 Table of Contents

1. [Features](#features)
2. [Supported Providers](#supported-providers)
3. [Quick Start](#quick-start)
4. [Configuration](#configuration)
5. [Advanced Features](#advanced-features)
6. [API Reference](#api-reference)
7. [Best Practices](#best-practices)
8. [Troubleshooting](#troubleshooting)

---

## ✨ Features

### Core Features
- **Multi-Provider Support**: Seamlessly integrate with 4+ major AI providers
- **Automatic Fallback**: If one provider fails, automatically use another
- **Load Balancing**: Distribute requests across providers
- **Cost Optimization**: Automatically route to the cheapest provider
- **Response Caching**: Cache responses to reduce costs and improve speed
- **Rate Limiting**: Built-in rate limiting per provider
- **Analytics & Monitoring**: Track costs, latency, and performance
- **Health Checks**: Automatic provider health monitoring
- **Vision Support**: Multi-modal AI with image analysis
- **Streaming**: Support for streaming responses

### Advanced Features
- **5 Selection Strategies**: Priority, Cost-Optimized, Load-Balanced, Fastest, Best-Quality
- **Flexible Configuration**: UI-based or programmatic configuration
- **Provider Analytics**: Real-time cost and performance tracking
- **Custom Rate Limits**: Set limits per provider
- **Timeout Management**: Configure timeouts for each provider
- **Cache Management**: Configurable TTL and cache invalidation
- **Error Handling**: Comprehensive error handling and logging

---

## 🤖 Supported Providers

### Currently Implemented

| Provider | Models | Vision | Streaming | Grounding | Status |
|----------|--------|--------|-----------|-----------|--------|
| **Google Gemini** | 2.5 Pro, 2.5 Flash, 1.5 Pro, 1.5 Flash | ✅ | ✅ | ✅ | ✅ Active |
| **OpenAI** | GPT-4 Turbo, GPT-4, GPT-3.5 | ✅ | ✅ | ❌ | ✅ Active |
| **DeepSeek** | DeepSeek Chat, DeepSeek Coder | ❌ | ✅ | ❌ | ✅ Active |
| **Anthropic** | Claude 3.5 Sonnet, Claude 3 Opus/Sonnet/Haiku | ✅ | ✅ | ❌ | ✅ Active |

### Ready to Add

- Azure OpenAI
- Cohere
- Mistral AI
- Perplexity
- Hugging Face

---

## 🚀 Quick Start

### Step 1: Get API Keys

1. **Google Gemini**: [https://ai.google.dev/](https://ai.google.dev/)
2. **OpenAI**: [https://platform.openai.com/](https://platform.openai.com/)
3. **DeepSeek**: [https://platform.deepseek.com/](https://platform.deepseek.com/)
4. **Anthropic**: [https://console.anthropic.com/](https://console.anthropic.com/)

### Step 2: Configure Environment Variables

Edit `.env.local`:

```env
# Required (at least one)
GEMINI_API_KEY=your-gemini-api-key-here
OPENAI_API_KEY=your-openai-api-key-here
DEEPSEEK_API_KEY=your-deepseek-api-key-here
ANTHROPIC_API_KEY=your-anthropic-api-key-here
```

### Step 3: Start Using

The system automatically detects which API keys you've configured and enables those providers!

```typescript
import { analyzeDTCCodes, generateReportSummary } from './services/aiService';

// Use any AI function - it will automatically use the best available provider
const analysis = await analyzeDTCCodes(codes);
```

---

## ⚙️ Configuration

### Option 1: UI-Based Configuration (Recommended)

1. Open the application
2. Navigate to Settings → AI Provider Settings
3. Configure providers:
   - Add/remove providers
   - Enable/disable providers
   - Set API keys
   - Configure rate limits
   - Set priorities
   - Choose selection strategy

### Option 2: Programmatic Configuration

```typescript
import { AIProviderManager } from './services/AIProviderManager';
import { AIProviderManagerConfig } from './types/apiProvider';

const config: AIProviderManagerConfig = {
  providers: [
    {
      provider: 'gemini',
      apiKey: 'your-api-key',
      enabled: true,
      priority: 1,
      rateLimit: {
        requestsPerMinute: 60,
        tokensPerMinute: 1000000,
      },
      timeout: 30000,
    },
    {
      provider: 'openai',
      apiKey: 'your-api-key',
      enabled: true,
      priority: 2,
      rateLimit: {
        requestsPerMinute: 60,
        tokensPerMinute: 150000,
      },
      timeout: 30000,
    },
  ],
  defaultProvider: 'gemini',
  fallbackEnabled: true,
  strategy: {
    type: 'cost-optimized', // or 'priority', 'load-balanced', 'fastest', 'best-quality'
  },
  caching: {
    enabled: true,
    ttl: 3600, // seconds
  },
  analytics: {
    enabled: true,
    trackCosts: true,
    trackPerformance: true,
  },
};

const manager = new AIProviderManager(config);
```

---

## 🎯 Advanced Features

### 1. Selection Strategies

#### Priority Strategy (Default)
Uses providers in order of priority (1 = highest).

```typescript
strategy: { type: 'priority' }
```

#### Cost-Optimized Strategy
Automatically selects the cheapest provider for each request.

```typescript
strategy: { type: 'cost-optimized' }
```

#### Load-Balanced Strategy
Distributes requests evenly across all providers.

```typescript
strategy: { type: 'load-balanced' }
```

#### Fastest Strategy
Uses the provider with the lowest average latency.

```typescript
strategy: { type: 'fastest' }
```

#### Best-Quality Strategy
Uses the most capable models (Anthropic → OpenAI → Gemini → DeepSeek).

```typescript
strategy: { type: 'best-quality' }
```

### 2. Automatic Fallback

If enabled, when a provider fails, the system automatically tries the next provider:

```typescript
fallbackEnabled: true
```

Example flow:
1. Try Gemini (priority 1) → Fails
2. Try OpenAI (priority 2) → Fails
3. Try DeepSeek (priority 3) → Success ✅

### 3. Response Caching

Cache responses to reduce costs and improve performance:

```typescript
caching: {
  enabled: true,
  ttl: 3600, // Cache for 1 hour
}
```

### 4. Rate Limiting

Set custom rate limits per provider:

```typescript
rateLimit: {
  requestsPerMinute: 60,
  tokensPerMinute: 1000000,
}
```

### 5. Analytics & Monitoring

Track provider performance and costs:

```typescript
import { getProviderAnalytics } from './services/aiService';

const analytics = getProviderAnalytics();
// Returns:
// {
//   provider: 'gemini',
//   totalRequests: 150,
//   successfulRequests: 148,
//   failedRequests: 2,
//   totalCost: 0.0523,
//   averageLatency: 1250,
//   averageTokensUsed: 850,
//   uptime: 98.67,
//   lastUsed: Date
// }
```

### 6. Health Monitoring

Check provider health status:

```typescript
import { getProvidersHealth } from './services/aiService';

const health = await getProvidersHealth();
// Returns Map<Provider, boolean>
```

---

## 📚 API Reference

### High-Level API (Recommended)

```typescript
import {
  analyzeDTCCodes,
  generateReportSummary,
  sendChatMessage,
  analyzeImage,
  detectVehicleFeatures,
  getProviderAnalytics,
  getProvidersHealth,
} from './services/aiService';

// Analyze diagnostic codes
const analysis = await analyzeDTCCodes(dtcCodes);

// Generate inspection report
const report = await generateReportSummary(inspectionState);

// Send chat message
const response = await sendChatMessage('How do I change brake pads?');

// Analyze image
const imageAnalysis = await analyzeImage(base64Image, 'What is the condition of this engine?');

// Detect vehicle features
const features = await detectVehicleFeatures(base64Image);

// Get analytics
const analytics = getProviderAnalytics();

// Check health
const health = await getProvidersHealth();
```

### Low-Level API (Advanced)

```typescript
import { AIProviderManager } from './services/AIProviderManager';
import { AIRequest } from './types/apiProvider';

const manager = new AIProviderManager(config);

// Generate text
const request: AIRequest = {
  prompt: 'Explain how a turbocharger works',
  systemPrompt: 'You are an automotive expert',
  temperature: 0.7,
  maxTokens: 1000,
};

const response = await manager.generateText(request);

// Generate with streaming
const stream = manager.generateStream(request);
for await (const chunk of stream) {
  if (typeof chunk === 'string') {
    console.log(chunk); // Partial response
  } else {
    console.log(chunk); // Final response with metadata
  }
}

// Vision request
const visionRequest: AIRequest = {
  prompt: 'Describe this vehicle',
  images: [base64Image],
  temperature: 0.7,
};

const visionResponse = await manager.generateText(visionRequest);
```

---

## 🎓 Best Practices

### 1. API Key Security
- **Never** commit API keys to version control
- Store keys in `.env.local` (gitignored)
- Use environment variables in production
- Rotate keys regularly

### 2. Cost Optimization
- Enable caching for repeated queries
- Use `cost-optimized` strategy for non-critical requests
- Set appropriate rate limits
- Monitor analytics regularly

### 3. Reliability
- Enable fallback for production use
- Configure at least 2 providers
- Set appropriate timeouts
- Monitor provider health

### 4. Performance
- Use `fastest` strategy for latency-sensitive operations
- Enable caching with appropriate TTL
- Use streaming for long responses
- Monitor average latency in analytics

### 5. Provider Selection
- **Gemini**: Best for vision + grounding, great value
- **OpenAI**: Best for general-purpose tasks, widely compatible
- **DeepSeek**: Best for cost-sensitive applications, code generation
- **Anthropic**: Best for long context, reliable responses

---

## 🔧 Troubleshooting

### Issue: "No providers are enabled"

**Solution**: Add at least one API key in `.env.local` and restart the app.

### Issue: "All providers failed"

**Possible causes**:
1. Invalid API keys
2. Network issues
3. Rate limits exceeded
4. All providers down (rare)

**Solution**:
1. Verify API keys are correct
2. Check provider status pages
3. Review rate limits in settings
4. Check network connectivity

### Issue: High costs

**Solution**:
1. Enable response caching
2. Use `cost-optimized` strategy
3. Set rate limits
4. Review analytics to identify expensive operations
5. Consider using cheaper models (DeepSeek, GPT-3.5)

### Issue: Slow responses

**Solution**:
1. Use `fastest` strategy
2. Check analytics for slow providers
3. Disable slow providers
4. Increase timeout values
5. Enable caching

### Issue: "Rate limit exceeded"

**Solution**:
1. Increase rate limits in provider config
2. Enable load balancing
3. Add more providers
4. Implement request queuing

---

## 📊 Cost Comparison

Approximate costs per 1M tokens (input/output):

| Provider | Input | Output | Vision |
|----------|-------|--------|--------|
| DeepSeek Chat | $0.14 | $0.28 | ❌ |
| Gemini 2.5 Flash | $0.25 | $1.00 | ✅ |
| Gemini 1.5 Flash | $0.075 | $0.30 | ✅ |
| Claude 3 Haiku | $0.25 | $1.25 | ✅ |
| GPT-3.5 Turbo | $0.50 | $1.50 | ❌ |
| Gemini 2.5 Pro | $1.25 | $5.00 | ✅ |
| Claude 3.5 Sonnet | $3.00 | $15.00 | ✅ |
| GPT-4 Turbo | $10.00 | $30.00 | ✅ |

*Prices as of 2024. Check provider websites for current pricing.*

---

## 🎉 Conclusion

You now have one of the most advanced multi-API integration systems available! Features include:

✅ **4+ AI Providers** with easy expansion
✅ **5 Selection Strategies** for every use case
✅ **Automatic Fallback** for reliability
✅ **Cost Optimization** to minimize expenses
✅ **Response Caching** for speed and savings
✅ **Real-time Analytics** for monitoring
✅ **Vision Support** across providers
✅ **Streaming Responses** for better UX
✅ **Rate Limiting** to stay within quotas
✅ **Health Monitoring** for uptime

This system is more advanced than commercial tools because it combines:
- Multiple providers in one unified interface
- Intelligent selection strategies
- Comprehensive analytics
- Built-in cost optimization
- Automatic failover
- Professional UI for configuration

Enjoy building with AI! 🚀
