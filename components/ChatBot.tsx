import React, { useState, useEffect, useRef } from 'react';
import { sendChatMessage } from '../services/geminiService';
import { LoadingSpinner } from './LoadingSpinner';

interface Message {
  id: number;
  role: 'user' | 'assistant';
  content: string;
  fallback?: boolean;
}

/**
 * AI Chat Assistant with self-healing capabilities
 * - Uses multi-provider backend (Gemini → DeepSeek → OpenAI)
 * - Gracefully handles failures with helpful fallback messages
 * - Never leaves customer stranded
 */
export const ChatBot: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([{
    id: Date.now(),
    role: 'assistant',
    content: "Hello! I'm your AI automotive assistant. I can help with:\n\n• Vehicle maintenance questions\n• Diagnostic code explanations\n• Repair recommendations\n• Finding local services\n\nHow can I help you today?"
  }]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now(),
      role: 'user',
      content: userInput.trim(),
    };

    setMessages(prev => [...prev, userMessage]);
    setUserInput('');
    setIsLoading(true);
    inputRef.current?.focus();

    try {
      // Build conversation history for context
      const history = messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      // Send message with self-healing capabilities
      const { response, fallback } = await sendChatMessage(userMessage.content, history);

      const aiMessage: Message = {
        id: Date.now() + 1,
        role: 'assistant',
        content: response,
        fallback
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Chat error:', error);

      // Ultimate fallback - should never reach here due to self-healing in sendChatMessage
      const errorMessage: Message = {
        id: Date.now() + 1,
        role: 'assistant',
        content: "I encountered an unexpected error. Please try:\n\n1. Refreshing the page\n2. Checking your internet connection\n3. Using the other tools in the app\n\nYour inspection data is safe and auto-saved.",
        fallback: true
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-dark-bg text-light-text">
      {/* Header */}
      <div className="bg-dark-card border-b border-dark-border p-4">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <span>🤖</span>
          <span>AI Assistant</span>
          <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded">Multi-AI</span>
        </h2>
        <p className="text-sm text-medium-text mt-1">
          Powered by Gemini, DeepSeek & OpenAI
        </p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-3 ${
                message.role === 'user'
                  ? 'bg-primary text-white'
                  : message.fallback
                  ? 'bg-yellow-900/30 border border-yellow-500/50 text-yellow-100'
                  : 'bg-dark-card text-light-text'
              }`}
            >
              {message.fallback && (
                <div className="text-xs text-yellow-300 mb-2 flex items-center gap-1">
                  <span>⚠️</span>
                  <span>Fallback Mode</span>
                </div>
              )}
              <p className="whitespace-pre-wrap">{message.content}</p>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-dark-card rounded-lg p-3 flex items-center gap-2">
              <LoadingSpinner />
              <span className="text-medium-text">Thinking...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSendMessage} className="p-4 bg-dark-card border-t border-dark-border">
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder="Ask about your vehicle..."
            disabled={isLoading}
            className="flex-1 px-4 py-2 bg-dark-bg border border-dark-border rounded-lg text-light-text placeholder-medium-text focus:outline-none focus:border-primary disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={isLoading || !userInput.trim()}
            className="px-6 py-2 bg-primary text-white rounded-lg font-semibold hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Send
          </button>
        </div>
        <p className="text-xs text-medium-text mt-2">
          💡 Auto-fallback enabled • Your data is safe • Multi-provider AI
        </p>
      </form>
    </div>
  );
};
