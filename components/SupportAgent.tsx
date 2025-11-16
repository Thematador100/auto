import React, { useState, useEffect, useRef } from 'react';
import { Chat, GenerateContentResponse } from '@google/genai';
import { createSupportChatSession, extractGroundingSources } from '../services/geminiService';
import { GroundingSource } from '../types';
import { LoadingSpinner } from './LoadingSpinner';

interface Message {
  id: number;
  sender: 'user' | 'agent';
  text: string;
  sources?: GroundingSource[];
  isTyping?: boolean;
}

interface SupportAgentProps {
  onClose: () => void;
  initialContext?: string;
}

export const SupportAgent: React.FC<SupportAgentProps> = ({ onClose, initialContext }) => {
  const [chatSession, setChatSession] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isMinimized, setIsMinimized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const initializeChat = async () => {
      try {
        const session = createSupportChatSession();
        setChatSession(session);

        // Friendly welcome message with personality
        const welcomeMessages = [
          "Hey there! 👋 I'm Alex, your AutoPro support specialist. I'm here to help you get the most out of the app! What's going on today?",
          "Hi! I'm Alex from AutoPro support. Whether you're stuck on something or just exploring, I'm here to help. What can I do for you?",
          "Hello! Alex here - think of me as your AutoPro guide. I've helped tons of mechanics and customers navigate the app. What brings you to support today?"
        ];

        const welcomeMessage = welcomeMessages[Math.floor(Math.random() * welcomeMessages.length)];

        setMessages([{
          id: Date.now(),
          sender: 'agent',
          text: welcomeMessage
        }]);

        // If there's initial context, ask about it
        if (initialContext) {
          setTimeout(() => {
            setMessages(prev => [...prev, {
              id: Date.now() + 1,
              sender: 'agent',
              text: `I noticed you were looking at ${initialContext}. Need help with that, or is there something else I can assist with?`
            }]);
          }, 800);
        }

      } catch (err) {
        setError("Hmm, I'm having trouble connecting right now. Mind refreshing and trying again?");
        console.error(err);
      }
    };

    initializeChat();
  }, [initialContext]);

  useEffect(() => {
    if (chatSession && !isMinimized) {
      inputRef.current?.focus();
    }
  }, [chatSession, isMinimized]);

  useEffect(() => {
    if (!isMinimized) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isMinimized]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim() || !chatSession || isLoading) return;

    const userMessage: Message = {
      id: Date.now(),
      sender: 'user',
      text: userInput.trim(),
    };
    setMessages(prev => [...prev, userMessage]);
    setUserInput('');
    setIsLoading(true);
    setError(null);
    inputRef.current?.focus();

    try {
      const stream = await chatSession.sendMessageStream({ message: userMessage.text });

      let agentResponseText = '';
      const agentResponseSources: GroundingSource[] = [];
      const agentMessageId = Date.now() + 1;

      // Add a placeholder for the agent response with typing indicator
      setMessages(prev => [...prev, {
        id: agentMessageId,
        sender: 'agent',
        text: '',
        sources: [],
        isTyping: true
      }]);

      for await (const chunk of stream) {
        const chunkText = chunk.text;
        const chunkSources = extractGroundingSources(chunk as GenerateContentResponse);

        agentResponseText += chunkText;

        // Deduplicate sources based on URI
        if (chunkSources.length > 0) {
          chunkSources.forEach(source => {
            if (!agentResponseSources.some(s => s.uri === source.uri)) {
              agentResponseSources.push(source);
            }
          });
        }

        // Update the streaming agent message in place
        setMessages(prev => prev.map(msg =>
          msg.id === agentMessageId
            ? { ...msg, text: agentResponseText, sources: [...agentResponseSources], isTyping: false }
            : msg
        ));
      }

    } catch (err) {
      const errorMessage = "Oops! Something went wrong on my end. Could you try asking that again? If this keeps happening, there might be a connectivity issue.";
      setError(errorMessage);
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        sender: 'agent',
        text: errorMessage,
      }]);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickAction = (action: string) => {
    setUserInput(action);
    inputRef.current?.focus();
  };

  const quickActions = [
    "How do I deploy this app?",
    "I'm having trouble with inspections",
    "How do I set up a custom domain?",
    "The app isn't loading properly",
    "How do I use the VIN scanner?",
    "I need help with payments"
  ];

  const formattedText = (text: string) => {
    // Enhanced markdown-to-html converter
    return {
      __html: text
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/`(.*?)`/g, '<code class="bg-dark-bg px-1 rounded">$1</code>')
        .replace(/\n/g, '<br />')
    };
  };

  if (isMinimized) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={() => setIsMinimized(false)}
          className="bg-primary hover:bg-primary-light text-white rounded-full p-4 shadow-lg transition-all hover:scale-110 relative group"
          aria-label="Open support chat"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          {messages.length > 1 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {messages.filter(m => m.sender === 'agent').length}
            </span>
          )}
          <span className="absolute bottom-full right-0 mb-2 px-3 py-1 bg-gray-900 text-white text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
            Need help? Chat with Alex
          </span>
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 w-96 h-[600px] bg-dark-card border-2 border-primary rounded-lg shadow-2xl z-50 flex flex-col">
      {/* Header */}
      <div className="bg-primary text-white p-4 rounded-t-lg flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <span className="text-xl">👤</span>
            </div>
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-primary"></div>
          </div>
          <div>
            <h3 className="font-bold">Alex - Support Specialist</h3>
            <p className="text-xs text-white/80">Usually replies instantly</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setIsMinimized(true)}
            className="hover:bg-white/20 rounded p-1 transition"
            aria-label="Minimize chat"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          <button
            onClick={onClose}
            className="hover:bg-white/20 rounded p-1 transition"
            aria-label="Close chat"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 p-4 space-y-3 overflow-y-auto bg-dark-bg">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex items-start gap-2 ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {message.sender === 'agent' && (
              <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-sm">👤</span>
              </div>
            )}
            <div className={`flex flex-col max-w-[75%] ${message.sender === 'user' ? 'items-end' : 'items-start'}`}>
              <div className={`p-3 rounded-lg ${
                message.sender === 'user'
                  ? 'bg-primary text-white rounded-br-none'
                  : 'bg-dark-card text-light-text rounded-bl-none border border-dark-border'
              }`}>
                {message.isTyping ? (
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                  </div>
                ) : (
                  <div className="whitespace-pre-wrap text-sm" dangerouslySetInnerHTML={formattedText(message.text)}></div>
                )}
                {message.sources && message.sources.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-dark-border/30">
                    <h4 className="text-xs font-semibold mb-1">📚 Helpful Resources:</h4>
                    <ul className="text-xs space-y-1">
                      {message.sources.map((source, index) => (
                        <li key={`${source.uri}-${index}`}>
                          <a
                            href={source.uri}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-400 hover:text-blue-300 underline flex items-center gap-1"
                          >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                            {source.title || 'Learn more'}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              <span className="text-xs text-gray-500 mt-1 px-1">
                {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
            {message.sender === 'user' && (
              <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-sm">👨‍🔧</span>
              </div>
            )}
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start gap-2">
            <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-sm">👤</span>
            </div>
            <div className="max-w-[75%] p-3 rounded-lg bg-dark-card border border-dark-border">
              <LoadingSpinner />
            </div>
          </div>
        )}
        {error && (
          <div className="text-red-400 text-sm text-center bg-red-500/10 p-2 rounded">
            {error}
          </div>
        )}
        {messages.length === 1 && (
          <div className="mt-4">
            <p className="text-xs text-gray-400 mb-2 text-center">Quick actions:</p>
            <div className="grid grid-cols-2 gap-2">
              {quickActions.map((action, index) => (
                <button
                  key={index}
                  onClick={() => handleQuickAction(action)}
                  className="text-xs bg-dark-card border border-dark-border hover:border-primary text-light-text p-2 rounded transition text-left"
                >
                  {action}
                </button>
              ))}
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-3 border-t border-dark-border bg-dark-card rounded-b-lg">
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder="Type your question here..."
            className="flex-1 bg-dark-bg border border-dark-border rounded-md p-2 text-sm focus:ring-2 focus:ring-primary focus:border-primary transition text-light-text placeholder-gray-500"
            disabled={!chatSession || isLoading}
          />
          <button
            type="submit"
            disabled={!chatSession || isLoading || !userInput.trim()}
            className="bg-primary hover:bg-primary-light text-white font-bold p-2 rounded-lg transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed"
            aria-label="Send message"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </form>
        <p className="text-xs text-gray-500 mt-2 text-center">
          Press Enter to send • Alex is here to help 24/7
        </p>
      </div>
    </div>
  );
};
