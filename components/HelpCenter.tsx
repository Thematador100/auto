import React, { useState } from 'react';
import { HelpArticle } from '../types';

const HELP_ARTICLES: HelpArticle[] = [
  {
    id: 'getting-started-1',
    title: 'How to Start a New Inspection',
    category: 'getting-started',
    searchKeywords: ['inspection', 'start', 'new', 'begin', 'create'],
    content: `
# How to Start a New Inspection

1. **Navigate to the Dashboard** - Click on the "Dashboard" tab in the navigation
2. **Click "New Inspection"** - Find and click the blue "New Inspection" button
3. **Enter VIN** - Enter the 17-digit Vehicle Identification Number
4. **Select Vehicle Type** - Choose the appropriate vehicle type (Standard, EV, Commercial, etc.)
5. **Begin Inspection** - Start filling out the inspection checklist

**Pro Tip:** Use the VIN scanner for faster data entry and automatic vehicle information lookup.
    `,
  },
  {
    id: 'getting-started-2',
    title: 'Understanding Vehicle Types',
    category: 'getting-started',
    searchKeywords: ['vehicle', 'type', 'category', 'ev', 'commercial', 'rv', 'motorcycle'],
    content: `
# Understanding Vehicle Types

Different vehicle types have specialized inspection checklists:

- **Standard:** Regular passenger cars and sedans
- **EV (Electric Vehicle):** Electric and hybrid vehicles with battery-specific checks
- **Commercial:** Trucks, vans, and commercial fleet vehicles
- **RV:** Recreational vehicles and motorhomes
- **Classic:** Vintage and collector vehicles
- **Motorcycle:** Two-wheeled motorcycles and scooters

Each type includes specific inspection points relevant to that vehicle category.
    `,
  },
  {
    id: 'inspections-1',
    title: 'Taking Photos During Inspection',
    category: 'inspections',
    searchKeywords: ['photo', 'image', 'camera', 'picture', 'upload'],
    content: `
# Taking Photos During Inspection

Photos are essential for documenting vehicle condition:

1. **Click the camera icon** next to any inspection item
2. **Choose a category** (e.g., "Front Exterior", "Engine Bay")
3. **Take or upload photo** - Use your device camera or select an existing image
4. **Add notes** (optional) - Describe what the photo shows
5. **Repeat as needed** - Add multiple photos per category

**Best Practices:**
- Take photos in good lighting
- Capture close-ups of any damage or wear
- Include photos of VIN plate, odometer, and tires
- Document both exterior and interior conditions
    `,
  },
  {
    id: 'inspections-2',
    title: 'Using Voice Notes',
    category: 'inspections',
    searchKeywords: ['audio', 'voice', 'recording', 'notes', 'microphone'],
    content: `
# Using Voice Notes

Voice notes allow you to quickly document findings:

1. **Click the microphone icon** for any inspection item
2. **Grant permission** if prompted for microphone access
3. **Click "Start Recording"**
4. **Speak clearly** - Describe the condition or findings
5. **Click "Stop"** when finished
6. **Review and save** - Listen back before saving

**Tips:**
- Keep recordings under 2 minutes for best results
- Speak in a quiet environment
- Mention specific details like measurements or part numbers
    `,
  },
  {
    id: 'inspections-3',
    title: 'OBD Diagnostic Scanner',
    category: 'inspections',
    searchKeywords: ['obd', 'diagnostic', 'code', 'dtc', 'check engine', 'error'],
    content: `
# OBD Diagnostic Scanner

The built-in OBD scanner analyzes diagnostic trouble codes:

1. **Navigate to "Diagnostics" tab**
2. **Enter DTC codes** - Input codes like "P0420" or "C1234"
3. **Analyze with AI** - Our AI provides detailed analysis including:
   - Code definition and meaning
   - Common symptoms
   - Possible causes
   - Recommended repair steps
4. **Add to report** - Include diagnostic findings in your inspection

**Common Code Prefixes:**
- **P:** Powertrain (engine, transmission)
- **C:** Chassis (brakes, steering, suspension)
- **B:** Body (airbags, climate control)
- **U:** Network/communication codes
    `,
  },
  {
    id: 'reports-1',
    title: 'Generating Inspection Reports',
    category: 'reports',
    searchKeywords: ['report', 'generate', 'finalize', 'complete', 'finish'],
    content: `
# Generating Inspection Reports

Once your inspection is complete:

1. **Review your checklist** - Ensure all items are checked
2. **Add overall notes** - Summarize key findings
3. **Click "Finalize Report"**
4. **AI generates summary** - Wait while AI analyzes your inspection data
5. **Review the report** - Check AI-generated findings and recommendations
6. **Save and share** - Report is automatically saved to your dashboard

**What's Included:**
- AI-generated overall condition assessment
- Key findings and concerns
- Repair recommendations
- Vehicle history (if available)
- Safety recalls
- Photos and documentation
    `,
  },
  {
    id: 'reports-2',
    title: 'Understanding Report Status',
    category: 'reports',
    searchKeywords: ['status', 'completed', 'submitted', 'progress', 'reviewed'],
    content: `
# Understanding Report Status

Reports go through several stages:

- **In Progress:** Inspection is still being conducted
- **Completed:** Inspector has finalized the report
- **Submitted:** Report has been sent to customer/admin
- **Reviewed:** Customer has reviewed and provided feedback

**For Inspectors:**
You'll receive notifications when customers review your reports.

**For Customers:**
You can provide feedback and ratings once you review a completed report.
    `,
  },
  {
    id: 'troubleshooting-1',
    title: 'VIN Lookup Not Working',
    category: 'troubleshooting',
    searchKeywords: ['vin', 'error', 'not working', 'lookup', 'invalid'],
    content: `
# VIN Lookup Not Working

If VIN lookup fails:

1. **Verify VIN format** - Must be exactly 17 characters
2. **Check for typos** - VINs don't contain I, O, or Q
3. **Try manual entry** - If lookup fails, manually enter vehicle details
4. **Check internet connection** - VIN lookup requires online access
5. **Contact support** - If issues persist

**Common Issues:**
- Invalid VIN format (too short/long)
- Special characters or spaces in VIN
- Network connectivity problems
- NHTSA API temporarily unavailable
    `,
  },
  {
    id: 'troubleshooting-2',
    title: 'Photos Not Uploading',
    category: 'troubleshooting',
    searchKeywords: ['photo', 'upload', 'error', 'not working', 'image'],
    content: `
# Photos Not Uploading

If you can't upload photos:

1. **Check file size** - Large photos are automatically compressed
2. **Verify format** - Use JPEG or PNG format
3. **Clear browser cache** - Sometimes helps with upload issues
4. **Try different browser** - Test in Chrome, Firefox, or Safari
5. **Check storage space** - Ensure device has adequate storage

**Supported Formats:**
- JPEG (.jpg, .jpeg)
- PNG (.png)
- Maximum size: 10MB (auto-compressed)
    `,
  },
  {
    id: 'faq-1',
    title: 'How do I access previous reports?',
    category: 'faq',
    searchKeywords: ['previous', 'history', 'old', 'past', 'reports'],
    content: `
# Accessing Previous Reports

All completed reports are saved in your dashboard:

1. **Go to Dashboard tab**
2. **View report history table** - Shows all your past inspections
3. **Click "View Report"** - Opens the full detailed report
4. **Search and filter** - Use the search box to find specific reports

Reports are stored locally in your browser and automatically synced (if backend is configured).
    `,
  },
  {
    id: 'faq-2',
    title: 'Can I edit a report after submitting?',
    category: 'faq',
    searchKeywords: ['edit', 'modify', 'change', 'update', 'submitted'],
    content: `
# Editing Reports After Submission

Currently, reports cannot be edited once finalized. However, you can:

- Create a new supplemental inspection
- Add notes in the customer feedback section
- Contact your administrator for special cases

**Best Practice:** Review all details carefully before finalizing.
    `,
  },
  {
    id: 'faq-3',
    title: 'How do I contact support?',
    category: 'faq',
    searchKeywords: ['support', 'help', 'contact', 'assistance', 'question'],
    content: `
# Contact Support

Need additional help?

**AI Assistant:**
- Click the "Assistant" tab for instant AI-powered help
- Ask questions about inspections, repairs, or vehicle issues
- Get local service recommendations

**Email Support:**
- Contact: support@aiautopro.com
- Include your user ID and description of the issue

**Phone Support:**
- Call: 1-800-AUTO-PRO (M-F, 9AM-5PM EST)

**Emergency Issues:**
- For critical system issues, contact your administrator
    `,
  },
];

const HelpCenter: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedArticle, setSelectedArticle] = useState<HelpArticle | null>(null);

  const categories = [
    { id: 'all', label: 'All Topics' },
    { id: 'getting-started', label: 'Getting Started' },
    { id: 'inspections', label: 'Inspections' },
    { id: 'reports', label: 'Reports' },
    { id: 'troubleshooting', label: 'Troubleshooting' },
    { id: 'faq', label: 'FAQ' },
  ];

  // Filter articles based on search and category
  const filteredArticles = HELP_ARTICLES.filter(article => {
    const matchesCategory = selectedCategory === 'all' || article.category === selectedCategory;
    const matchesSearch = searchQuery === '' ||
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.searchKeywords.some(keyword => keyword.toLowerCase().includes(searchQuery.toLowerCase())) ||
      article.content.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gray-900 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Help Center</h1>
          <p className="text-gray-400">Find answers and learn how to use AI Auto Pro</p>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search for help articles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar - Categories */}
          <div className="lg:col-span-1">
            <div className="bg-gray-800 rounded-lg p-4">
              <h2 className="text-lg font-semibold text-white mb-4">Categories</h2>
              <div className="space-y-2">
                {categories.map(category => (
                  <button
                    key={category.id}
                    onClick={() => {
                      setSelectedCategory(category.id);
                      setSelectedArticle(null);
                    }}
                    className={`w-full text-left px-4 py-2 rounded-lg transition ${
                      selectedCategory === category.id
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-300 hover:bg-gray-700'
                    }`}
                  >
                    {category.label}
                  </button>
                ))}
              </div>

              {/* Quick Contact */}
              <div className="mt-8 p-4 bg-gray-700 rounded-lg">
                <h3 className="text-white font-semibold mb-2">Need More Help?</h3>
                <p className="text-sm text-gray-300 mb-3">Contact our support team</p>
                <a
                  href="mailto:support@aiautopro.com"
                  className="block w-full text-center bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition"
                >
                  Email Support
                </a>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {selectedArticle ? (
              /* Article Detail View */
              <div className="bg-gray-800 rounded-lg p-6">
                <button
                  onClick={() => setSelectedArticle(null)}
                  className="mb-4 text-blue-400 hover:text-blue-300 flex items-center"
                >
                  <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Back to articles
                </button>
                <div className="prose prose-invert max-w-none">
                  <div
                    className="text-gray-300 whitespace-pre-wrap"
                    dangerouslySetInnerHTML={{ __html: selectedArticle.content.replace(/^# (.+)$/gm, '<h1 class="text-2xl font-bold text-white mb-4">$1</h1>').replace(/^## (.+)$/gm, '<h2 class="text-xl font-semibold text-white mb-3 mt-6">$1</h2>').replace(/^\*\*(.+):\*\*$/gm, '<strong class="text-blue-400">$1:</strong>').replace(/^- (.+)$/gm, '<li class="ml-4">$1</li>').replace(/^\d+\. (.+)$/gm, '<li class="ml-4 list-decimal">$1</li>') }}
                  />
                </div>
              </div>
            ) : (
              /* Article List View */
              <div className="space-y-4">
                {filteredArticles.length > 0 ? (
                  filteredArticles.map(article => (
                    <div
                      key={article.id}
                      onClick={() => setSelectedArticle(article)}
                      className="bg-gray-800 rounded-lg p-5 cursor-pointer hover:bg-gray-750 transition border border-gray-700 hover:border-blue-500"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-white mb-1">{article.title}</h3>
                          <span className="inline-block px-2 py-1 bg-blue-900 text-blue-300 text-xs rounded">
                            {categories.find(c => c.id === article.category)?.label}
                          </span>
                        </div>
                        <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="bg-gray-800 rounded-lg p-8 text-center">
                    <svg className="w-16 h-16 mx-auto text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h3 className="text-xl font-semibold text-gray-400 mb-2">No articles found</h3>
                    <p className="text-gray-500">Try adjusting your search or category filter</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpCenter;
