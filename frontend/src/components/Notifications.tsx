import axios from 'axios';
import type { SwapRequest } from '../types';

interface NotificationsProps {
    incomingRequests: SwapRequest[];
    outgoingRequests: SwapRequest[];
    loading: boolean;
    onRefresh: () => void;
}

export default function Notifications({ incomingRequests, outgoingRequests, loading, onRefresh }: NotificationsProps) {
    const formatDateTime = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
        });
    };

    const handleSwapResponse = async (requestId: number, accept: boolean) => {
        try {
            const token = localStorage.getItem('token');
            const responseStr = accept ? 'ACCEPT' : 'REJECT';
            await axios.post(
                `${import.meta.env.VITE_SERVER_URI}/api/v1/swap/swap-response`,
                { swapRequestId: requestId, response: responseStr },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            onRefresh();
        } catch (error) {
            console.error('Error responding to swap:', error);
            alert('Failed to respond to swap request. Please try again.');
        }
    };

    return (
        <>
            {/* Header */}
            <div className="mb-6">
                <h2 className="text-2xl font-normal text-gray-800">Notifications</h2>
            </div>

            {loading ? (
                <div className="flex items-center justify-center h-64">
                    <svg className="animate-spin h-8 w-8 text-[#1a73e8]" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                </div>
            ) : (
                <div className="space-y-8">
                    {/* Incoming Requests */}
                    <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Incoming Requests</h3>
                        <div className="space-y-4">
                            {incomingRequests.length === 0 ? (
                                <div className="text-center py-8 bg-white border border-gray-200 rounded-lg">
                                    <p className="text-gray-500">No incoming swap requests.</p>
                                </div>
                            ) : (
                                incomingRequests.map((request) => {
                                    const requesterName = request.requester?.name ?? 'Unknown user';
                                    const requesterSlotTitle = request.requesterSlot?.title ?? 'Untitled slot';
                                    const responderSlotTitle = request.responderSlot?.title ?? 'Untitled slot';
                                    const requesterSlotStart = request.requesterSlot?.startTime ?? '';
                                    const responderSlotStart = request.responderSlot?.startTime ?? '';

                                    return (
                                        <div key={request.id} className="bg-white border border-gray-200 rounded-lg p-6">
                                            <div className="flex items-start justify-between mb-4">
                                                <div>
                                                    <p className="text-sm text-gray-600 mb-1">
                                                        <span className="font-medium text-gray-900">{requesterName}</span> wants to swap slots
                                                    </p>
                                                    <p className="text-xs text-gray-500">{new Date(request.createdAt).toLocaleString()}</p>
                                                </div>
                                                <span className="px-2 py-1 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                                                    {request.status}
                                                </span>
                                            </div>
                                            <div className="grid md:grid-cols-2 gap-4 mb-4">
                                                <div className="border border-gray-200 rounded p-3">
                                                    <p className="text-xs text-gray-500 mb-1">They offer:</p>
                                                    <p className="font-medium text-gray-900">{requesterSlotTitle}</p>
                                                    <p className="text-sm text-gray-600">{requesterSlotStart ? formatDateTime(requesterSlotStart) : '—'}</p>
                                                </div>
                                                <div className="border border-gray-200 rounded p-3">
                                                    <p className="text-xs text-gray-500 mb-1">For your:</p>
                                                    <p className="font-medium text-gray-900">{responderSlotTitle}</p>
                                                    <p className="text-sm text-gray-600">{responderSlotStart ? formatDateTime(responderSlotStart) : '—'}</p>
                                                </div>
                                            </div>
                                            {request.status === 'PENDING' && (
                                                <div className="flex space-x-3">
                                                    <button
                                                        onClick={() => handleSwapResponse(request.id, true)}
                                                        className="flex-1 px-4 py-2 bg-[#1a73e8] text-white rounded-lg hover:bg-[#1557b0] transition-colors text-sm font-medium"
                                                    >
                                                        Accept
                                                    </button>
                                                    <button
                                                        onClick={() => handleSwapResponse(request.id, false)}
                                                        className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                                                    >
                                                        Reject
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>

                    {/* Outgoing Requests */}
                    <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Outgoing Requests</h3>
                        <div className="space-y-4">
                            {outgoingRequests.length === 0 ? (
                                <div className="text-center py-8 bg-white border border-gray-200 rounded-lg">
                                    <p className="text-gray-500">No outgoing swap requests.</p>
                                </div>
                            ) : (
                                outgoingRequests.map((request) => {
                                    const responderName = request.responder?.name ?? 'Unknown user';
                                    const requesterSlotTitle = request.requesterSlot?.title ?? 'Untitled slot';
                                    const responderSlotTitle = request.responderSlot?.title ?? 'Untitled slot';
                                    const requesterSlotStart = request.requesterSlot?.startTime ?? '';
                                    const responderSlotStart = request.responderSlot?.startTime ?? '';

                                    return (
                                        <div key={request.id} className="bg-white border border-gray-200 rounded-lg p-6">
                                            <div className="flex items-start justify-between mb-4">
                                                <div>
                                                    <p className="text-sm text-gray-600 mb-1">
                                                        Swap request to <span className="font-medium text-gray-900">{responderName}</span>
                                                    </p>
                                                    <p className="text-xs text-gray-500">{new Date(request.createdAt).toLocaleString()}</p>
                                                </div>
                                                <span className={`px-2 py-1 rounded text-xs font-medium ${request.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                                                    request.status === 'ACCEPTED' ? 'bg-green-100 text-green-800' :
                                                        'bg-red-100 text-red-800'
                                                    }`}>
                                                    {request.status}
                                                </span>
                                            </div>
                                            <div className="grid md:grid-cols-2 gap-4">
                                                <div className="border border-gray-200 rounded p-3">
                                                    <p className="text-xs text-gray-500 mb-1">You offered:</p>
                                                    <p className="font-medium text-gray-900">{requesterSlotTitle}</p>
                                                    <p className="text-sm text-gray-600">{requesterSlotStart ? formatDateTime(requesterSlotStart) : '—'}</p>
                                                </div>
                                                <div className="border border-gray-200 rounded p-3">
                                                    <p className="text-xs text-gray-500 mb-1">For their:</p>
                                                    <p className="font-medium text-gray-900">{responderSlotTitle}</p>
                                                    <p className="text-sm text-gray-600">{responderSlotStart ? formatDateTime(responderSlotStart) : '—'}</p>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
