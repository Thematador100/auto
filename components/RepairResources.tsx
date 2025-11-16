import React, { useState } from 'react';
import { RepairResource } from '../types';

interface RepairResourcesProps {
  vehicleInfo?: string;
  issue?: string;
}

export const RepairResources: React.FC<RepairResourcesProps> = ({ vehicleInfo, issue }) => {
  const [searchQuery, setSearchQuery] = useState('');

  // Common auto parts retailers
  const partsStores: RepairResource[] = [
    {
      type: 'parts',
      title: 'AutoZone',
      url: 'https://www.autozone.com',
      description: 'Free in-store testing, same-day delivery'
    },
    {
      type: 'parts',
      title: "O'Reilly Auto Parts",
      url: 'https://www.oreillyauto.com',
      description: 'Professional parts, free testing services'
    },
    {
      type: 'parts',
      title: 'RockAuto',
      url: 'https://www.rockauto.com',
      description: 'Largest online selection, competitive prices'
    },
    {
      type: 'parts',
      title: 'NAPA Auto Parts',
      url: 'https://www.napaonline.com',
      description: 'Quality parts, professional grade available'
    },
    {
      type: 'parts',
      title: 'Advance Auto Parts',
      url: 'https://shop.advanceautoparts.com',
      description: 'Free battery testing, speed perks rewards'
    }
  ];

  // Popular repair tutorial platforms
  const learningResources: RepairResource[] = [
    {
      type: 'video',
      title: 'ChrisFix (YouTube)',
      url: 'https://www.youtube.com/@chrisfix',
      description: 'Clear, detailed DIY repair tutorials'
    },
    {
      type: 'video',
      title: 'Scotty Kilmer (YouTube)',
      url: 'https://www.youtube.com/@scottykilmer',
      description: '50+ years of mechanic experience'
    },
    {
      type: 'video',
      title: 'Engineering Explained (YouTube)',
      url: 'https://www.youtube.com/@EngineeringExplained',
      description: 'Technical explanations and diagnostics'
    },
    {
      type: 'article',
      title: 'RepairPal',
      url: 'https://repairpal.com',
      description: 'Fair price estimates, certified shops'
    },
    {
      type: 'forum',
      title: 'Reddit r/MechanicAdvice',
      url: 'https://www.reddit.com/r/MechanicAdvice',
      description: 'Active community of mechanics and enthusiasts'
    },
    {
      type: 'article',
      title: 'iFixit Auto',
      url: 'https://www.ifixit.com/Device/Car_and_Truck',
      description: 'Free repair guides with photos'
    }
  ];

  const handleSearch = (storeName: string) => {
    const query = searchQuery || issue || vehicleInfo || '';
    window.open(`${storeName}?search=${encodeURIComponent(query)}`, '_blank');
  };

  return (
    <div className="space-y-6">
      <div className="bg-dark-card p-6 rounded-lg border border-dark-border">
        <h2 className="text-xl font-semibold text-light-text mb-4">Repair Resources</h2>
        <p className="text-medium-text mb-4">
          Find the parts you need and learn how to fix it yourself.
        </p>

        <div className="mb-4">
          <input
            type="text"
            placeholder="Search for parts (e.g., 'oxygen sensor' or 'brake pads')"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-dark-bg border border-dark-border rounded-md p-3 focus:ring-2 focus:ring-primary focus:border-primary transition text-light-text"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Parts Suppliers */}
        <div className="bg-dark-card p-6 rounded-lg border border-dark-border">
          <h3 className="text-lg font-semibold text-light-text mb-4 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" viewBox="0 0 20 20" fill="currentColor">
              <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
            </svg>
            Where to Buy Parts
          </h3>
          <div className="space-y-3">
            {partsStores.map((store, index) => (
              <div key={index} className="border-l-2 border-primary pl-3 py-2">
                <button
                  onClick={() => handleSearch(store.url)}
                  className="text-left w-full group"
                >
                  <h4 className="font-semibold text-light-text group-hover:text-primary transition">
                    {store.title}
                  </h4>
                  <p className="text-sm text-medium-text">{store.description}</p>
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Learning Resources */}
        <div className="bg-dark-card p-6 rounded-lg border border-dark-border">
          <h3 className="text-lg font-semibold text-light-text mb-4 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
            </svg>
            Learn & Fix It Yourself
          </h3>
          <div className="space-y-3">
            {learningResources.map((resource, index) => (
              <div key={index} className="border-l-2 border-primary pl-3 py-2">
                <a
                  href={resource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block group"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-grow">
                      <h4 className="font-semibold text-light-text group-hover:text-primary transition flex items-center gap-2">
                        {resource.type === 'video' && (
                          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                          </svg>
                        )}
                        {resource.type === 'forum' && (
                          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z" />
                            <path d="M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.599.233.938.233h2l3 3v-3h2a2 2 0 002-2V9a2 2 0 00-2-2h-1z" />
                          </svg>
                        )}
                        {resource.type === 'article' && (
                          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                          </svg>
                        )}
                        {resource.title}
                      </h4>
                      <p className="text-sm text-medium-text">{resource.description}</p>
                    </div>
                    <svg className="h-4 w-4 text-medium-text group-hover:text-primary transition ml-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </div>
                </a>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-dark-card p-6 rounded-lg border border-dark-border">
        <h3 className="text-lg font-semibold text-light-text mb-2 flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-500" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          Safety First
        </h3>
        <p className="text-medium-text text-sm">
          Always prioritize safety when performing repairs. If you're unsure about a repair or don't have the proper tools, consult a professional mechanic. Working on fuel systems, electrical systems, and brakes requires special care and knowledge.
        </p>
      </div>
    </div>
  );
};
