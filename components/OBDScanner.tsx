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
    
    // A simple markdown-to-html renderer
    const renderMarkdown = (text: string) => {
        const html = text
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/### (.*)/g, '<h3 class="text-lg font-semibold mt-4 mb-2">$1</h3>')
            .replace(/## (.*)/g, '<h2 class="text-xl font-bold mt-6 mb-3">$1</h2>')
            .replace(/# (.*)/g, '<h1 class="text-2xl font-extrabold mt-8 mb-4">$1</h1>')
            .replace(/^- (.*)/gm, '<li>$1</li>')
            .replace(/(\d)\. /g, '<br/>$1. ')
            .replace(/\n/g, '<br />');

        return { __html: html.replace(/<br \/><li>/g, '<li>') };
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
            <div className="bg-dark-card p-6 rounded-lg border border-dark-border">
                <h3 className="text-lg font-semibold text-light-text mb-2">AI Analysis & Repair Plan</h3>
                {isLoading && (
                    <div className="flex justify-center items-center h-48">
                        <LoadingSpinner />
                    </div>
                )}
                {error && <p className="text-red-500">{error}</p>}
                {analysis ? (
                     <div className="prose prose-invert max-w-none text-light-text" dangerouslySetInnerHTML={renderMarkdown(analysis)} />
                ) : (
                    !isLoading && <p className="text-medium-text">Analysis results will appear here.</p>
                )}
            </div>
        </div>
    );
};