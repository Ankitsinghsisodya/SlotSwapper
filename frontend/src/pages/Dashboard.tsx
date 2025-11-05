import axios from 'axios';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MyCalendar from '../components/MyCalendar';
import Notifications from '../components/Notifications';
import SwapMarketplace from '../components/SwapMarketplace';
import { useToast } from '../components/ui/toast';
import type { Event, SwapRequest } from '../types';

type ViewType = 'calendar' | 'marketplace' | 'notifications';

function Dashboard() {
    const { toast } = useToast();
    const navigate = useNavigate();
    const [currentView, setCurrentView] = useState<ViewType>('calendar');
    const [myEvents, setMyEvents] = useState<Event[]>([]);
    const [swappableSlots, setSwappableSlots] = useState<Event[]>([]);
    const [incomingRequests, setIncomingRequests] = useState<SwapRequest[]>([]);
    const [outgoingRequests, setOutgoingRequests] = useState<SwapRequest[]>([]);
    const [loading, setLoading] = useState(false);
    const [unreadNotifications, setUnreadNotifications] = useState(0);
    const wsRef = useRef<WebSocket | null>(null);
    const heartbeatIntervalRef = useRef<number | null>(null);
    const reconnectTimeoutRef = useRef<number | null>(null);
    const userIdRef = useRef<number | null>(null);

    // Helper function to decode JWT and get userId
    const getUserIdFromToken = (token: string): number | null => {
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            return payload.id || null;
        } catch (error) {
            console.error('Error decoding token:', error);
            return null;
        }
    };

    // Function to connect WebSocket
    const connectWebSocket = (userId: number) => {
        // Close existing connection if any
        if (wsRef.current) {
            wsRef.current.close();
        }

        const wsUrl = import.meta.env.VITE_WS_URI || 'ws://localhost:8000';
        const ws = new WebSocket(wsUrl);

        ws.onopen = () => {
            console.log('WebSocket connected');
            // Register user
            ws.send(JSON.stringify({
                type: 'register',
                payload: { userId }
            }));

        };

        ws.onmessage = (event) => {
            try {
                const notification = JSON.parse(event.data);
                console.log('Received notification:', notification);

                // Handle different notification types
                switch (notification.type) {
                    case 'swap_request':
                        toast({
                            title: "New Swap Request! 🔔",
                            description: notification.payload.message,
                            variant: "default",
                        });
                        // Increment unread count
                        setUnreadNotifications(prev => prev + 1);
                        // Auto-refresh notifications view
                        fetchData();
                        break;

                    case 'swap_accepted':
                        toast({
                            title: "Swap Accepted! ✅",
                            description: notification.payload.message,
                            variant: "default",
                        });
                        // Refresh all data
                        fetchData();
                        break;

                    case 'swap_rejected':
                        toast({
                            title: "Swap Declined ❌",
                            description: notification.payload.message,
                            variant: "destructive",
                        });
                        fetchData();
                        break;
                }
            } catch (error) {
                console.error('Error handling WebSocket message:', error);
            }
        };

        ws.onerror = (error) => {
            console.error('WebSocket error:', error);
        };

        ws.onclose = () => {
            console.log('WebSocket disconnected');

            if (userIdRef.current) {
                console.log('Attempting to reconnect in 3 seconds...');
                reconnectTimeoutRef.current = window.setTimeout(() => {
                    console.log('Reconnecting...');
                    connectWebSocket(userIdRef.current!);
                }, 3000);
            }
        };

        wsRef.current = ws;
    };

    // WebSocket setup
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }

        const userId = getUserIdFromToken(token);
        if (!userId) {
            console.error('Could not get userId from token');
            return;
        }

        userIdRef.current = userId;

        // Connect WebSocket
        connectWebSocket(userId);

        // Cleanup on unmount
        return () => {
            userIdRef.current = null; // Prevent reconnection on unmount
            if (wsRef.current) {
                wsRef.current.close();
            }
        };
    }, [navigate]);

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
                const [slotsRes, myEventsRes] = await Promise.all([
                    axios.get(`${import.meta.env.VITE_SERVER_URI}/api/v1/swap/swappable-slots`, { headers }),
                    axios.get(`${import.meta.env.VITE_SERVER_URI}/api/v1/events/my-events`, { headers })
                ]);
                setSwappableSlots(slotsRes.data.data || []);
                setMyEvents(myEventsRes.data.data || []);
            } else if (currentView === 'notifications') {
                const [incoming, outgoing] = await Promise.all([
                    axios.get(`${import.meta.env.VITE_SERVER_URI}/api/v1/swap/swap-incoming-requests`, { headers }),
                    axios.get(`${import.meta.env.VITE_SERVER_URI}/api/v1/swap/swap-outgoing-requests`, { headers }),
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

    const handleLogout = () => {
        // Prevent reconnection
        userIdRef.current = null;

        // Clear timers
        if (heartbeatIntervalRef.current) {
            clearInterval(heartbeatIntervalRef.current);
        }
        if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
        }

        // Close WebSocket connection
        if (wsRef.current) {
            wsRef.current.close();
        }

        localStorage.removeItem('token');
        navigate('/login');
    };

    const handleViewChange = (view: ViewType) => {
        setCurrentView(view);
        // Clear unread notifications when clicking on notifications tab
        if (view === 'notifications') {
            setUnreadNotifications(0);
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
                        onClick={() => handleViewChange('calendar')}
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
                        onClick={() => handleViewChange('marketplace')}
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
                        onClick={() => handleViewChange('notifications')}
                        className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors relative ${currentView === 'notifications'
                            ? 'bg-blue-50 text-[#1a73e8]'
                            : 'text-gray-700 hover:bg-gray-50'
                            }`}
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                        </svg>
                        <span>Notifications</span>
                        {unreadNotifications > 0 && (
                            <span className="absolute top-2 right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                {unreadNotifications}
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
                {/* Content Area */}
                <main className="flex-1 overflow-auto p-8 bg-gray-50">
                    {currentView === 'calendar' && (
                        <MyCalendar
                            events={myEvents}
                            loading={loading}
                            onRefresh={fetchData}
                        />
                    )}

                    {currentView === 'marketplace' && (
                        <SwapMarketplace
                            slots={swappableSlots}
                            myEvents={myEvents}
                            loading={loading}
                            onRefresh={fetchData}
                        />
                    )}

                    {currentView === 'notifications' && (
                        <Notifications
                            incomingRequests={incomingRequests}
                            outgoingRequests={outgoingRequests}
                            loading={loading}
                            onRefresh={fetchData}
                        />
                    )}
                </main>
            </div>
        </div>
    );
}

export default Dashboard;
