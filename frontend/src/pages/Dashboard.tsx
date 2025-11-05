import axios from 'axios';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

// Types
interface Event {
    id: number;
    title: string;
    startTime: string;
    endTime: string;
    status: 'BUSY' | 'SWAPPABLE' | 'SWAP_PENDING';
    ownerId: number;
    owner?: { id: number; name: string; email: string };
}

interface SwapRequest {
    id: number;
    requesterId: number;
    responderId: number;
    requesterSlotId: number;
    responderSlotId: number;
    status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'CANCELLED';
    requester: { id: number; name: string; email: string };
    responder: { id: number; name: string; email: string };
    requesterSlot: Event;
    responderSlot: Event;
    createdAt: string;
}


type ViewType = 'calendar' | 'marketplace' | 'notifications';

function Dashboard() {
    const navigate = useNavigate();
    const [currentView, setCurrentView] = useState<ViewType>('calendar');
    const [myEvents, setMyEvents] = useState<Event[]>([]);
    const [swappableSlots, setSwappableSlots] = useState<Event[]>([]);
    const [incomingRequests, setIncomingRequests] = useState<SwapRequest[]>([]);
    const [outgoingRequests, setOutgoingRequests] = useState<SwapRequest[]>([]);
    const [loading, setLoading] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showSwapModal, setShowSwapModal] = useState(false);
    const [selectedSlotForSwap, setSelectedSlotForSwap] = useState<Event | null>(null);

    // Form states
    const [newEvent, setNewEvent] = useState({
        title: '',
        startTime: '',
        endTime: '',
    });

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }
        fetchData();
    }, [currentView]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const headers = { Authorization: `Bearer ${token}` };

            if (currentView === 'calendar') {
                const res = await axios.get(`${import.meta.env.VITE_SERVER_URI}/api/v1/events/my-events`, { headers });
                setMyEvents(res.data.data || []);
            } else if (currentView === 'marketplace') {
                const res = await axios.get(`${import.meta.env.VITE_SERVER_URI}/api/v1/events/swappable-slots`, { headers });
                setSwappableSlots(res.data.data || []);
            } else if (currentView === 'notifications') {
                const [incoming, outgoing] = await Promise.all([
                    axios.get(`${import.meta.env.VITE_SERVER_URI}/api/v1/swap/incoming-requests`, { headers }),
                    axios.get(`${import.meta.env.VITE_SERVER_URI}/api/v1/swap/outgoing-requests`, { headers }),
                ]);
                setIncomingRequests(incoming.data.data || []);
                setOutgoingRequests(outgoing.data.data || []);
            }
        } catch (error: any) {
            console.error('Error fetching data:', error);
            if (error.response?.status === 401) {
                navigate('/login');
            }
        } finally {
            setLoading(false);
        }
    };

     const handleDeleteEvent = async (eventId: number) => {
        if (!confirm('Are you sure you want to delete this event?')) return;
        try {
            const token = localStorage.getItem('token');
            await axios.delete(
                `${import.meta.env.VITE_SERVER_URI}/api/v1/events/delete-event/${eventId}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            fetchData();
        } catch (error) {
            console.error('Error deleting event:', error);
        }
    };
    const handleCreateEvent = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            await axios.post(
                `${import.meta.env.VITE_SERVER_URI}/api/v1/events/create-event`,
                newEvent,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setShowCreateModal(false);
            setNewEvent({ title: '', startTime: '', endTime: '' });
            fetchData();
        } catch (error) {
            console.error('Error creating event:', error);
        }
    };

    const handleToggleSwappable = async (eventId: number, currentStatus: string) => {
        try {
            const token = localStorage.getItem('token');
            const newStatus = currentStatus === 'BUSY' ? 'SWAPPABLE' : 'BUSY';
            await axios.patch(
                `${import.meta.env.VITE_SERVER_URI}/api/v1/events/${eventId}`,
                { status: newStatus },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            fetchData();
        } catch (error) {
            console.error('Error updating event:', error);
        }
    };

    const handleRequestSwap = async (mySlotId: number) => {
        if (!selectedSlotForSwap) return;
        try {
            const token = localStorage.getItem('token');
            await axios.post(
                `${import.meta.env.VITE_SERVER_URI}/api/v1/swap/request`,
                { mySlotId, theirSlotId: selectedSlotForSwap.id },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setShowSwapModal(false);
            setSelectedSlotForSwap(null);
            alert('Swap request sent!');
        } catch (error) {
            console.error('Error requesting swap:', error);
        }
    };

    const handleSwapResponse = async (requestId: number, accept: boolean) => {
        try {
            const token = localStorage.getItem('token');
            await axios.post(
                `${import.meta.env.VITE_SERVER_URI}/api/v1/swap/response/${requestId}`,
                { accept },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            fetchData();
        } catch (error) {
            console.error('Error responding to swap:', error);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

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

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'BUSY': return 'bg-gray-100 text-gray-800';
            case 'SWAPPABLE': return 'bg-green-100 text-green-800';
            case 'SWAP_PENDING': return 'bg-yellow-100 text-yellow-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="min-h-screen bg-white flex">
            {/* Sidebar */}
            <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
                <div className="p-6 border-b border-gray-200">
                    <div className="flex items-center space-x-2">
                        <svg className="w-8 h-8 text-[#1a73e8]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <h1 className="text-xl font-normal text-gray-800">SlotSwapper</h1>
                    </div>
                </div>

                <nav className="flex-1 p-4">
                    <button
                        onClick={() => setCurrentView('calendar')}
                        className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${currentView === 'calendar'
                                ? 'bg-blue-50 text-[#1a73e8]'
                                : 'text-gray-700 hover:bg-gray-50'
                            }`}
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span>My Calendar</span>
                    </button>

                    <button
                        onClick={() => setCurrentView('marketplace')}
                        className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${currentView === 'marketplace'
                                ? 'bg-blue-50 text-[#1a73e8]'
                                : 'text-gray-700 hover:bg-gray-50'
                            }`}
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                        </svg>
                        <span>Swap Marketplace</span>
                    </button>

                    <button
                        onClick={() => setCurrentView('notifications')}
                        className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors relative ${currentView === 'notifications'
                                ? 'bg-blue-50 text-[#1a73e8]'
                                : 'text-gray-700 hover:bg-gray-50'
                            }`}
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                        </svg>
                        <span>Notifications</span>
                        {incomingRequests.length > 0 && (
                            <span className="absolute top-2 right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                {incomingRequests.length}
                            </span>
                        )}
                    </button>
                </nav>

                <div className="p-4 border-t border-gray-200">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        <span>Logout</span>
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col">
                {/* Header */}
                <header className="bg-white border-b border-gray-200 px-8 py-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-normal text-gray-800">
                            {currentView === 'calendar' && 'My Calendar'}
                            {currentView === 'marketplace' && 'Swap Marketplace'}
                            {currentView === 'notifications' && 'Notifications'}
                        </h2>
                        {currentView === 'calendar' && (
                            <button
                                onClick={() => setShowCreateModal(true)}
                                className="flex items-center space-x-2 px-4 py-2 bg-[#1a73e8] text-white rounded-lg hover:bg-[#1557b0] transition-colors text-sm font-medium"
                            >
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                                <span>Create Event</span>
                            </button>
                        )}
                    </div>
                </header>

                {/* Content Area */}
                <main className="flex-1 overflow-auto p-8 bg-gray-50">
                    {loading ? (
                        <div className="flex items-center justify-center h-64">
                            <svg className="animate-spin h-8 w-8 text-[#1a73e8]" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        </div>
                    ) : (
                        <>
                            {/* My Calendar View */}
                          {currentView === 'calendar' && (
                                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                    {myEvents.length === 0 ? (
                                        <div className="col-span-full text-center py-12">
                                            <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                            <p className="text-gray-500">No events yet. Create your first event!</p>
                                        </div>
                                    ) : (
                                        myEvents.map((event) => (
                                            <div key={event.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                                                <div className="flex items-start justify-between mb-3">
                                                    <h3 className="text-lg font-medium text-gray-900">{event.title}</h3>
                                                    <div className="flex items-center space-x-2">
                                                        <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(event.status)}`}>
                                                            {event.status.replace('_', ' ')}
                                                        </span>
                                                        <button
                                                            onClick={() => handleDeleteEvent(event.id)}
                                                            className="text-red-500 hover:text-red-700 transition-colors"
                                                            title="Delete event"
                                                        >
                                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                            </svg>
                                                        </button>
                                                    </div>
                                                </div>
                                                <div className="space-y-2 text-sm text-gray-600 mb-4">
                                                    <div className="flex items-center space-x-2">
                                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                        </svg>
                                                        <span>Start: {formatDateTime(event.startTime)}</span>
                                                    </div>
                                                    <div className="flex items-center space-x-2">
                                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                        </svg>
                                                        <span>End: {formatDateTime(event.endTime)}</span>
                                                    </div>
                                                </div>
                                                {event.status !== 'SWAP_PENDING' && (
                                                    <button
                                                        onClick={() => handleToggleSwappable(event.id, event.status)}
                                                        className="w-full px-4 py-2 border border-[#1a73e8] text-[#1a73e8] rounded-lg hover:bg-blue-50 transition-colors text-sm font-medium"
                                                    >
                                                        {event.status === 'BUSY' ? 'Make Swappable' : 'Mark as Busy'}
                                                    </button>
                                                )}
                                            </div>
                                        ))
                                    )}
                                </div>
                            )}

                            {/* Marketplace View */}
                            {currentView === 'marketplace' && (
                                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                    {swappableSlots.length === 0 ? (
                                        <div className="col-span-full text-center py-12">
                                            <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                                            </svg>
                                            <p className="text-gray-500">No swappable slots available right now.</p>
                                        </div>
                                    ) : (
                                        swappableSlots.map((slot) => (
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

                            {/* Notifications View */}
                            {currentView === 'notifications' && (
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
                                                incomingRequests.map((request) => (
                                                    <div key={request.id} className="bg-white border border-gray-200 rounded-lg p-6">
                                                        <div className="flex items-start justify-between mb-4">
                                                            <div>
                                                                <p className="text-sm text-gray-600 mb-1">
                                                                    <span className="font-medium text-gray-900">{request.requester.name}</span> wants to swap slots
                                                                </p>
                                                                <p className="text-xs text-gray-500">{new Date(request.createdAt).toLocaleString()}</p>
                                                            </div>
                                                            <span className="px-2 py-1 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                                                                PENDING
                                                            </span>
                                                        </div>
                                                        <div className="grid md:grid-cols-2 gap-4 mb-4">
                                                            <div className="border border-gray-200 rounded p-3">
                                                                <p className="text-xs text-gray-500 mb-1">They offer:</p>
                                                                <p className="font-medium text-gray-900">{request.requesterSlot.title}</p>
                                                                <p className="text-sm text-gray-600">{formatDateTime(request.requesterSlot.startTime)}</p>
                                                            </div>
                                                            <div className="border border-gray-200 rounded p-3">
                                                                <p className="text-xs text-gray-500 mb-1">For your:</p>
                                                                <p className="font-medium text-gray-900">{request.responderSlot.title}</p>
                                                                <p className="text-sm text-gray-600">{formatDateTime(request.responderSlot.startTime)}</p>
                                                            </div>
                                                        </div>
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
                                                    </div>
                                                ))
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
                                                outgoingRequests.map((request) => (
                                                    <div key={request.id} className="bg-white border border-gray-200 rounded-lg p-6">
                                                        <div className="flex items-start justify-between mb-4">
                                                            <div>
                                                                <p className="text-sm text-gray-600 mb-1">
                                                                    Swap request to <span className="font-medium text-gray-900">{request.responder.name}</span>
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
                                                                <p className="font-medium text-gray-900">{request.requesterSlot.title}</p>
                                                                <p className="text-sm text-gray-600">{formatDateTime(request.requesterSlot.startTime)}</p>
                                                            </div>
                                                            <div className="border border-gray-200 rounded p-3">
                                                                <p className="text-xs text-gray-500 mb-1">For their:</p>
                                                                <p className="font-medium text-gray-900">{request.responderSlot.title}</p>
                                                                <p className="text-sm text-gray-600">{formatDateTime(request.responderSlot.startTime)}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </main>
            </div>

            {/* Create Event Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg max-w-md w-full p-6">
                        <h3 className="text-xl font-medium text-gray-900 mb-4">Create New Event</h3>
                        <form onSubmit={handleCreateEvent} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Event Title</label>
                                <input
                                    type="text"
                                    required
                                    value={newEvent.title}
                                    onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a73e8] focus:border-transparent"
                                    placeholder="Team Meeting"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Start Time</label>
                                <input
                                    type="datetime-local"
                                    required
                                    value={newEvent.startTime}
                                    onChange={(e) => setNewEvent({ ...newEvent, startTime: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a73e8] focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">End Time</label>
                                <input
                                    type="datetime-local"
                                    required
                                    value={newEvent.endTime}
                                    onChange={(e) => setNewEvent({ ...newEvent, endTime: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a73e8] focus:border-transparent"
                                />
                            </div>
                            <div className="flex space-x-3 pt-4">
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2 bg-[#1a73e8] text-white rounded-lg hover:bg-[#1557b0] transition-colors text-sm font-medium"
                                >
                                    Create
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowCreateModal(false)}
                                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
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
                                        onClick={() => handleRequestSwap(event.id)}
                                        className="w-full text-left p-4 border border-gray-200 rounded-lg hover:border-[#1a73e8] hover:bg-blue-50 transition-colors"
                                    >
                                        <p className="font-medium text-gray-900">{event.title}</p>
                                        <p className="text-sm text-gray-600">{formatDateTime(event.startTime)}</p>
                                    </button>
                                ))
                            )}
                        </div>
                        <button
                            onClick={() => {
                                setShowSwapModal(false);
                                setSelectedSlotForSwap(null);
                            }}
                            className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Dashboard;