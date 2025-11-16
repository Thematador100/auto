import React, { useState, useEffect } from 'react';
import { CompletedReport, CustomerFeedback } from '../types';
import { offlineService } from '../services/offlineService';
import { feedbackService } from '../services/feedbackService';

export const AdminPanel: React.FC = () => {
    const [reports, setReports] = useState<CompletedReport[]>([]);
    const [feedback, setFeedback] = useState<CustomerFeedback[]>([]);
    const [filter, setFilter] = useState<'all' | 'completed' | 'submitted'>('all');
    const [selectedReport, setSelectedReport] = useState<CompletedReport | null>(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = () => {
        const allReports = offlineService.getReports();
        const allFeedback = feedbackService.getAllFeedback();
        setReports(allReports);
        setFeedback(allFeedback);
    };

    const filteredReports = reports.filter(report => {
        if (filter === 'all') return true;
        return report.status === filter;
    });

    const completedReports = reports.filter(r => r.status === 'completed' || r.status === 'submitted');
    const stats = feedbackService.getStatistics();

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed': return 'text-green-400 bg-green-900/30';
            case 'submitted': return 'text-blue-400 bg-blue-900/30';
            case 'reviewed': return 'text-purple-400 bg-purple-900/30';
            default: return 'text-gray-400 bg-gray-900/30';
        }
    };

    const getFeedbackForReport = (reportId: string) => {
        return feedback.find(f => f.reportId === reportId);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-white mb-2">Admin Dashboard</h1>
                <p className="text-gray-400">Monitor completed inspections and customer satisfaction</p>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-400 text-sm">Total Reports</p>
                            <p className="text-3xl font-bold text-white mt-1">{reports.length}</p>
                        </div>
                        <svg className="w-12 h-12 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                    </div>
                </div>

                <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-400 text-sm">Completed</p>
                            <p className="text-3xl font-bold text-green-400 mt-1">{completedReports.length}</p>
                        </div>
                        <svg className="w-12 h-12 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                </div>

                <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-400 text-sm">Avg. Rating</p>
                            <p className="text-3xl font-bold text-yellow-400 mt-1">
                                {stats.averageRating > 0 ? stats.averageRating.toFixed(1) : 'N/A'}
                            </p>
                        </div>
                        <svg className="w-12 h-12 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                    </div>
                </div>

                <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-400 text-sm">Would Recommend</p>
                            <p className="text-3xl font-bold text-purple-400 mt-1">
                                {stats.recommendationRate > 0 ? `${stats.recommendationRate.toFixed(0)}%` : 'N/A'}
                            </p>
                        </div>
                        <svg className="w-12 h-12 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                        </svg>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="flex gap-2">
                <button
                    onClick={() => setFilter('all')}
                    className={`px-4 py-2 rounded-lg transition ${
                        filter === 'all'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                >
                    All Reports ({reports.length})
                </button>
                <button
                    onClick={() => setFilter('completed')}
                    className={`px-4 py-2 rounded-lg transition ${
                        filter === 'completed'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                >
                    Completed ({reports.filter(r => r.status === 'completed').length})
                </button>
                <button
                    onClick={() => setFilter('submitted')}
                    className={`px-4 py-2 rounded-lg transition ${
                        filter === 'submitted'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                >
                    Submitted ({reports.filter(r => r.status === 'submitted').length})
                </button>
            </div>

            {/* Reports Table */}
            <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-700">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                    Vehicle
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                    VIN
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                    Date
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                    Rating
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-700">
                            {filteredReports.length > 0 ? (
                                filteredReports.map(report => {
                                    const reportFeedback = getFeedbackForReport(report.id);
                                    return (
                                        <tr key={report.id} className="hover:bg-gray-750 transition">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                                                {report.vehicle.year} {report.vehicle.make} {report.vehicle.model}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400 font-mono">
                                                {report.vehicle.vin}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                                                {new Date(report.date).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 py-1 text-xs font-semibold rounded ${getStatusColor(report.status)}`}>
                                                    {report.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                {reportFeedback ? (
                                                    <div className="flex items-center">
                                                        <span className="text-yellow-400">★</span>
                                                        <span className="ml-1 text-white">{reportFeedback.rating}/5</span>
                                                    </div>
                                                ) : (
                                                    <span className="text-gray-500">No rating</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                <button
                                                    onClick={() => setSelectedReport(report)}
                                                    className="text-blue-400 hover:text-blue-300"
                                                >
                                                    View Details
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                                        No reports found
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Report Detail Modal */}
            {selectedReport && (
                <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4 overflow-y-auto">
                    <div className="bg-gray-800 rounded-lg p-6 max-w-3xl w-full my-8">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-white">Report Details</h2>
                            <button onClick={() => setSelectedReport(null)} className="text-gray-400 hover:text-white">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div className="bg-gray-700 rounded-lg p-4">
                                <h3 className="font-semibold text-white mb-2">Vehicle Information</h3>
                                <p className="text-gray-300">
                                    {selectedReport.vehicle.year} {selectedReport.vehicle.make} {selectedReport.vehicle.model}
                                </p>
                                <p className="text-gray-400 text-sm">VIN: {selectedReport.vehicle.vin}</p>
                                <p className="text-gray-400 text-sm">
                                    Completed: {selectedReport.completedAt ? new Date(selectedReport.completedAt).toLocaleString() : 'N/A'}
                                </p>
                            </div>

                            {getFeedbackForReport(selectedReport.id) && (
                                <div className="bg-gray-700 rounded-lg p-4">
                                    <h3 className="font-semibold text-white mb-3">Customer Feedback</h3>
                                    {(() => {
                                        const fb = getFeedbackForReport(selectedReport.id)!;
                                        return (
                                            <div className="space-y-3">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-yellow-400 text-2xl">★</span>
                                                    <span className="text-white text-xl font-semibold">{fb.rating}/5</span>
                                                </div>
                                                <div className="grid grid-cols-2 gap-3">
                                                    <div>
                                                        <p className="text-gray-400 text-sm">Thoroughness</p>
                                                        <p className="text-white">{fb.aspects.thoroughness}/5</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-gray-400 text-sm">Clarity</p>
                                                        <p className="text-white">{fb.aspects.clarity}/5</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-gray-400 text-sm">Timeliness</p>
                                                        <p className="text-white">{fb.aspects.timeliness}/5</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-gray-400 text-sm">Professionalism</p>
                                                        <p className="text-white">{fb.aspects.professionalism}/5</p>
                                                    </div>
                                                </div>
                                                <div>
                                                    <p className="text-gray-400 text-sm">Would Recommend</p>
                                                    <p className={fb.wouldRecommend ? 'text-green-400' : 'text-red-400'}>
                                                        {fb.wouldRecommend ? 'Yes' : 'No'}
                                                    </p>
                                                </div>
                                                {fb.comment && (
                                                    <div>
                                                        <p className="text-gray-400 text-sm mb-1">Comment</p>
                                                        <p className="text-gray-300 italic">"{fb.comment}"</p>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })()}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
