import axios from 'axios';
import { useState } from 'react';
import type { Event } from '../types';
import { useToast } from './ui/toast';

interface SwapMarketplaceProps {
    slots: Event[];
    myEvents: Event[];
    loading: boolean;
    onRefresh: () => void;
}

export default function SwapMarketplace({ slots, myEvents, loading, onRefresh }: SwapMarketplaceProps) {
    const { toast } = useToast();
    const [showSwapModal, setShowSwapModal] = useState(false);
    const [selectedSlotForSwap, setSelectedSlotForSwap] = useState<Event | null>(null);
    const [selectedMySlot, setSelectedMySlot] = useState<Event | null>(null);

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

    const handleRequestSwap = async () => {
        if (!selectedSlotForSwap || !selectedMySlot) return;

        // Get responderId from the selected slot's owner
        const responderId = selectedSlotForSwap.ownerId;
        if (!responderId) {
            toast({
                title: "Error",
                description: "Unable to identify slot owner",
                variant: "destructive"
            });
            return;
        }

        try {
            const token = localStorage.getItem('token');
            await axios.post(
                `${import.meta.env.VITE_SERVER_URI}/api/v1/swap/swap-request`,
                {
                    responderId: responderId,
                    requesterSlotId: selectedMySlot.id,
                    responderSlotId: selectedSlotForSwap.id
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setShowSwapModal(false);
            setSelectedSlotForSwap(null);
            setSelectedMySlot(null);
            toast({
                title: "Success",
                description: "Swap request sent successfully!"
            });
            onRefresh();
        } catch (error) {
            console.error('Error requesting swap:', error);
            toast({
                title: "Error",
                description: "Failed to send swap request. Please try again.",
                variant: "destructive"
            });
        }
    };

    return (
        <>
            {/* Header */}
            <div className="mb-6">
                <h2 className="text-2xl font-normal text-gray-800">Swap Marketplace</h2>
            </div>

            {/* Slots Grid */}
            {loading ? (
                <div className="flex items-center justify-center h-64">
                    <svg className="animate-spin h-8 w-8 text-[#1a73e8]" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                </div>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {slots.length === 0 ? (
                        <div className="col-span-full text-center py-12">
                            <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                            </svg>
                            <p className="text-gray-500">No swappable slots available right now.</p>
                        </div>
                    ) : (
                        slots.map((slot) => (
                            <div key={slot.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                                <div className="flex items-start justify-between mb-3">
                                    <h3 className="text-lg font-medium text-gray-900">{slot.title}</h3>
                                    <span className="px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800">
                                        SWAPPABLE
                                    </span>
                                </div>
                                <div className="space-y-2 text-sm text-gray-600 mb-3">
                                    <div className="flex items-center space-x-2">
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                        <span>Owner: {slot.owner?.name || 'Unknown'}</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <span>{formatDateTime(slot.startTime)}</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <span>{formatDateTime(slot.endTime)}</span>
                                    </div>
                                </div>
                                <button
                                    onClick={() => {
                                        setSelectedSlotForSwap(slot);
                                        setShowSwapModal(true);
                                    }}
                                    className="w-full px-4 py-2 bg-[#1a73e8] text-white rounded-lg hover:bg-[#1557b0] transition-colors text-sm font-medium"
                                >
                                    Request Swap
                                </button>
                            </div>
                        ))
                    )}
                </div>
            )}

            {/* Swap Modal */}
            {showSwapModal && selectedSlotForSwap && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg max-w-2xl w-full p-6">
                        <h3 className="text-xl font-medium text-gray-900 mb-4">Select Your Slot to Swap</h3>
                        <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                            <p className="text-sm text-gray-700 mb-1">You want:</p>
                            <p className="font-medium text-gray-900">{selectedSlotForSwap.title}</p>
                            <p className="text-sm text-gray-600">{formatDateTime(selectedSlotForSwap.startTime)}</p>
                        </div>
                        <p className="text-sm text-gray-600 mb-4">Choose one of your swappable slots to offer:</p>
                        <div className="space-y-3 max-h-96 overflow-auto mb-4">
                            {myEvents.filter(e => e.status === 'SWAPPABLE').length === 0 ? (
                                <p className="text-center text-gray-500 py-8">You have no swappable slots. Mark a slot as swappable first.</p>
                            ) : (
                                myEvents.filter(e => e.status === 'SWAPPABLE').map((event) => (
                                    <button
                                        key={event.id}
                                        onClick={() => setSelectedMySlot(event)}
                                        className={`w-full text-left p-4 border-2 rounded-lg transition-all ${selectedMySlot?.id === event.id
                                            ? 'border-[#1a73e8] bg-blue-50 shadow-md'
                                            : 'border-gray-200 hover:border-[#1a73e8] hover:bg-blue-50'
                                            }`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="font-medium text-gray-900">{event.title}</p>
                                                <p className="text-sm text-gray-600">{formatDateTime(event.startTime)}</p>
                                            </div>
                                            {selectedMySlot?.id === event.id && (
                                                <svg className="w-6 h-6 text-[#1a73e8]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                            )}
                                        </div>
                                    </button>
                                ))
                            )}
                        </div>
                        <div className="flex space-x-3">
                            <button
                                onClick={handleRequestSwap}
                                disabled={!selectedMySlot}
                                className="flex-1 px-4 py-2 bg-[#1a73e8] text-white rounded-lg hover:bg-[#1557b0] transition-colors text-sm font-medium disabled:bg-gray-300 disabled:cursor-not-allowed"
                            >
                                Confirm Swap Request
                            </button>
                            <button
                                onClick={() => {
                                    setShowSwapModal(false);
                                    setSelectedSlotForSwap(null);
                                    setSelectedMySlot(null);
                                }}
                                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
