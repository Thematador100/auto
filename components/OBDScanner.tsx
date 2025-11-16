import React, { useState } from 'react';
import { analyzeDTCCodes } from '../services/geminiService';
import { DTCCode } from '../types';
import { LoadingSpinner } from './LoadingSpinner';

export const OBDScanner: React.FC = () => {
    const [codes, setCodes] = useState<DTCCode[]>([{ code: '', description: '' }]);
    const [analysis, setAnalysis] = useState<string>('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleCodeChange = (index: number, value: string) => {
        const newCodes = [...codes];
        newCodes[index].code = value.toUpperCase();
        setCodes(newCodes);
    };

    const addCodeField = () => {
        setCodes([...codes, { code: '', description: '' }]);
    };

    const removeCodeField = (index: number) => {
        const newCodes = codes.filter((_, i) => i !== index);
        setCodes(newCodes);
    };

    const handleAnalyze = async () => {
        const validCodes = codes.filter(c => c.code.trim() !== '');
        if (validCodes.length === 0) {
            setError("Please enter at least one DTC code.");
            return;
        }
        setIsLoading(true);
        setError(null);
        setAnalysis('');
        try {
            const result = await analyzeDTCCodes(validCodes);
            setAnalysis(result);
        } catch (err) {
            setError(err instanceof Error ? err.message : "An unknown error occurred.");
        } finally {
            setIsLoading(false);
        }
    };
    
    // Enhanced markdown-to-html renderer for repair information
    const renderMarkdown = (text: string) => {
        const html = text
            // Headers
            .replace(/### (.*)/g, '<h3 class="text-lg font-semibold mt-6 mb-3 text-primary border-b border-dark-border pb-2">$1</h3>')
            .replace(/## (.*)/g, '<h2 class="text-xl font-bold mt-8 mb-4 text-light-text">$1</h2>')
            .replace(/# (.*)/g, '<h1 class="text-2xl font-extrabold mt-10 mb-6 text-light-text">$1</h1>')
            // Bold text
            .replace(/\*\*(.*?)\*\*/g, '<strong class="text-primary font-semibold">$1</strong>')
            // Warning emoji with styling
            .replace(/⚠️/g, '<span class="inline-flex items-center justify-center w-6 h-6 text-yellow-500">⚠️</span>')
            // Lists
            .replace(/^- (.*)/gm, '<li class="ml-4 mb-2">$1</li>')
            // Numbered lists
            .replace(/^(\d+)\. (.*)/gm, '<div class="flex gap-2 mb-2"><span class="font-semibold text-primary">$1.</span><span>$2</span></div>')
            // Line breaks
            .replace(/\n/g, '<br />');

        return { __html: html.replace(/<br \/><li>/g, '<li>').replace(/<br \/><div>/g, '<div>') };
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-dark-card p-6 rounded-lg border border-dark-border space-y-4 flex flex-col">
                <h3 className="text-lg font-semibold text-light-text">Enter DTC Codes</h3>
                <div className="flex-grow space-y-2">
                    {codes.map((code, index) => (
                        <div key={index} className="flex items-center gap-2">
                            <input
                                type="text"
                                placeholder="e.g., P0300"
                                value={code.code}
                                onChange={(e) => handleCodeChange(index, e.target.value)}
                                className="flex-grow bg-dark-bg border border-dark-border rounded-md p-2 focus:ring-2 focus:ring-primary focus:border-primary transition text-light-text font-mono"
                            />
                            {codes.length > 1 && (
                                <button onClick={() => removeCodeField(index)} className="text-red-500 hover:text-red-400 p-1 rounded-full">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 000 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                                    </svg>
                                </button>
                            )}
                        </div>
                    ))}
                </div>
                <div className="flex justify-between items-center">
                    <button onClick={addCodeField} className="text-sm text-primary hover:text-primary-light">
                        + Add another code
                    </button>
                    <button 
                        onClick={handleAnalyze} 
                        disabled={isLoading}
                        className="bg-primary hover:bg-primary-light text-white font-bold py-2 px-6 rounded-lg transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {isLoading ? <LoadingSpinner/> : "Analyze Codes"}
                    </button>
                </div>
            </div>
            <div className="bg-dark-card p-6 rounded-lg border border-dark-border flex flex-col max-h-[600px]">
                <h3 className="text-lg font-semibold text-light-text mb-4 flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                    </svg>
                    AI Analysis & Repair Guide
                </h3>
                <div className="flex-1 overflow-y-auto">
                    {isLoading && (
                        <div className="flex justify-center items-center h-48">
                            <LoadingSpinner />
                        </div>
                    )}
                    {error && <p className="text-red-500">{error}</p>}
                    {analysis ? (
                         <div className="prose prose-invert max-w-none text-light-text" dangerouslySetInnerHTML={renderMarkdown(analysis)} />
                    ) : (
                        !isLoading && (
                            <div className="text-center py-12">
                                <p className="text-medium-text mb-4">Enter diagnostic trouble codes above to receive:</p>
                                <ul className="text-left max-w-md mx-auto space-y-2 text-medium-text">
                                    <li className="flex items-start gap-2">
                                        <span className="text-primary mt-1">✓</span>
                                        <span>Detailed problem diagnosis</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-primary mt-1">✓</span>
                                        <span>Step-by-step DIY repair instructions</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-primary mt-1">✓</span>
                                        <span>Parts list with cost estimates</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-primary mt-1">✓</span>
                                        <span>Required tools and difficulty rating</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-primary mt-1">✓</span>
                                        <span>Professional repair cost comparison</span>
                                    </li>
                                </ul>
                            </div>
                        )
                    )}
                </div>
            </div>
        </div>
    );
};