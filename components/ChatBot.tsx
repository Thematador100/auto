import React, { useState, useEffect, useRef } from 'react';
import { Chat, GenerateContentResponse } from '@google/genai';
import { createChatSession, extractGroundingSources } from '../services/geminiService';
import { GroundingSource } from '../types';
import { LoadingSpinner } from './LoadingSpinner';

interface Message {
  id: number;
  sender: 'user' | 'ai';
  text: string;
  sources?: GroundingSource[];
}

export const ChatBot: React.FC = () => {
  const [chatSession, setChatSession] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const initializeChat = async () => {
      try {
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            timeout: 5000,
          });
        }).catch(() => null);

        const location = position ? { latitude: position.coords.latitude, longitude: position.coords.longitude } : null;
        
        const session = createChatSession(location);
        setChatSession(session);
        setMessages([{
          id: Date.now(),
          sender: 'ai',
          text: "Hello! I'm your automotive repair assistant. I can help you:\n\n**Diagnose** problems from symptoms or error codes\n**Fix** issues with step-by-step DIY repair guides\n**Find** local parts stores and repair shops\n**Estimate** repair costs and recommend parts\n\nWhat can I help you with today?"
        }]);

      } catch (err) {
        setError("Could not initialize chat session. Please ensure you've granted location permissions if you want local results.");
        console.error(err);
      }
    };

    initializeChat();
  }, []);

  useEffect(() => {
    if (chatSession) {
      inputRef.current?.focus();
    }
  }, [chatSession]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

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
        
        let aiResponseText = '';
        const aiResponseSources: GroundingSource[] = [];
        const aiMessageId = Date.now() + 1;

        // Add a placeholder for the AI response
        setMessages(prev => [...prev, { id: aiMessageId, sender: 'ai', text: '', sources: [] }]);

        for await (const chunk of stream) {
            const chunkText = chunk.text;
            const chunkSources = extractGroundingSources(chunk as GenerateContentResponse);

            aiResponseText += chunkText;
            
            // Deduplicate sources based on URI
            if (chunkSources.length > 0) {
              chunkSources.forEach(source => {
                if (!aiResponseSources.some(s => s.uri === source.uri)) {
                  aiResponseSources.push(source);
                }
              });
            }
            
            // Update the streaming AI message in place
            setMessages(prev => prev.map(msg => 
                msg.id === aiMessageId 
                ? { ...msg, text: aiResponseText, sources: [...aiResponseSources] }
                : msg
            ));
        }

    } catch (err) {
      const errorMessage = "Sorry, I encountered an error. Please try again.";
      setError(errorMessage);
       setMessages(prev => [...prev, {
          id: Date.now() + 1,
          sender: 'ai',
          text: errorMessage,
        }]);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const formattedText = (text: string) => {
      // A simple markdown-to-html converter for bolding and new lines
      return { __html: text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br />') };
  }

  return (
    <div className="flex flex-col h-[calc(100vh-220px)] bg-dark-card border border-dark-border rounded-lg shadow-lg">
      <div className="flex-1 p-4 space-y-4 overflow-y-auto">
        {messages.map((message) => (
          <div key={message.id} className={`flex items-start gap-2.5 ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`flex flex-col max-w-lg p-3 rounded-lg ${message.sender === 'user' ? 'bg-primary text-white rounded-br-none' : 'bg-dark-bg text-light-text rounded-bl-none'}`}>
              <div className="whitespace-pre-wrap" dangerouslySetInnerHTML={formattedText(message.text)}></div>
              {message.sources && message.sources.length > 0 && (
                <div className="mt-2 pt-2 border-t border-dark-border/50">
                  <h4 className="text-xs font-semibold mb-1">Sources:</h4>
                  <ul className="text-xs space-y-1 list-disc list-inside">
                    {message.sources.map((source, index) => (
                      <li key={`${source.uri}-${index}`}>
                        <a href={source.uri} target="_blank" rel="noopener noreferrer" className="underline hover:opacity-80">
                         {source.title || source.uri}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        ))}
        {isLoading && (
            <div className="flex justify-start">
                 <div className="max-w-lg p-3 rounded-lg bg-dark-bg text-light-text">
                    <LoadingSpinner />
                </div>
            </div>
        )}
        {error && <p className="text-red-500 text-sm text-center">{error}</p>}
        <div ref={messagesEndRef} />
      </div>
      <div className="p-4 border-t border-dark-border">
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder="Ask me anything about your car..."
            className="flex-1 bg-dark-bg border border-dark-border rounded-md p-2 focus:ring-2 focus:ring-primary focus:border-primary transition text-light-text"
            disabled={!chatSession || isLoading}
          />
          <button
            type="submit"
            disabled={!chatSession || isLoading || !userInput.trim()}
            className="bg-primary hover:bg-primary-light text-white font-bold py-2 px-4 rounded-lg transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
};
