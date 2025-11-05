import axios from 'axios';
import { useState } from 'react';
import type { Event } from '../types';
import { useToast } from './ui/toast';

interface MyCalendarProps {
    events: Event[];
    loading: boolean;
    onRefresh: () => void;
}

export default function MyCalendar({ events, loading, onRefresh }: MyCalendarProps) {
    const { toast } = useToast();
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [eventToDelete, setEventToDelete] = useState<number | null>(null);
    const [editingEvent, setEditingEvent] = useState<Event | null>(null);
    const [newEvent, setNewEvent] = useState({
        title: '',
        startTime: '',
        endTime: '',
    });
    const [editEvent, setEditEvent] = useState({
        title: '',
        startTime: '',
        endTime: '',
    });
    const [startTimeConfirmed, setStartTimeConfirmed] = useState(false);
    const [endTimeConfirmed, setEndTimeConfirmed] = useState(false);
    const [tempStartTime, setTempStartTime] = useState('');
    const [tempEndTime, setTempEndTime] = useState('');

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
            setStartTimeConfirmed(false);
            setEndTimeConfirmed(false);
            setTempStartTime('');
            setTempEndTime('');
            onRefresh();
        } catch (error) {
            console.error('Error creating event:', error);
        }
    };

    const handleConfirmStartTime = () => {
        if (tempStartTime) {
            setNewEvent({ ...newEvent, startTime: tempStartTime });
            setStartTimeConfirmed(true);
        }
    };

    const handleConfirmEndTime = () => {
        if (tempEndTime) {
            setNewEvent({ ...newEvent, endTime: tempEndTime });
            setEndTimeConfirmed(true);
        }
    };

    const handleEditStartTime = () => {
        setStartTimeConfirmed(false);
        setTempStartTime(newEvent.startTime);
    };

    const handleEditEndTime = () => {
        setEndTimeConfirmed(false);
        setTempEndTime(newEvent.endTime);
    };

    const handleEditClick = (event: Event) => {
        setEditingEvent(event);
        const formatForInput = (dateStr: string) => {
            const date = new Date(dateStr);
            return date.toISOString().slice(0, 16);
        };
        setEditEvent({
            title: event.title,
            startTime: formatForInput(event.startTime),
            endTime: formatForInput(event.endTime),
        });
        setShowEditModal(true);
    };

    const handleUpdateEvent = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingEvent) return;
        try {
            const token = localStorage.getItem('token');
            await axios.put(
                `${import.meta.env.VITE_SERVER_URI}/api/v1/events/update-event/${editingEvent.id}`,
                editEvent,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setShowEditModal(false);
            setEditingEvent(null);
            setEditEvent({ title: '', startTime: '', endTime: '' });
            onRefresh();
        } catch (error) {
            console.error('Error updating event:', error);
        }
    };

    const handleDeleteClick = (eventId: number) => {
        setEventToDelete(eventId);
        setShowDeleteModal(true);
    };

    const handleDeleteConfirm = async () => {
        if (!eventToDelete) return;
        try {
            const token = localStorage.getItem('token');
            await axios.delete(
                `${import.meta.env.VITE_SERVER_URI}/api/v1/events/delete-event/${eventToDelete}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setShowDeleteModal(false);
            setEventToDelete(null);
            toast({
                title: "Event Deleted",
                description: "The event has been successfully deleted.",
            });
            onRefresh();
        } catch (error) {
            console.error('Error deleting event:', error);
            toast({
                title: "Error",
                description: "Failed to delete event. Please try again.",
                variant: "destructive"
            });
        }
    };

    const handleToggleSwappable = async (eventId: number, currentStatus: string) => {
        try {
            const token = localStorage.getItem('token');
            const newStatus = currentStatus === 'BUSY' ? 'SWAPPABLE' : 'BUSY';
            await axios.put(
                `${import.meta.env.VITE_SERVER_URI}/api/v1/events/update-event/${eventId}`,
                { status: newStatus },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            onRefresh();
        } catch (error) {
            console.error('Error updating event:', error);
        }
    };

    return (
        <>
            {/* Header with Create Button */}
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-normal text-gray-800">My Calendar</h2>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="flex items-center space-x-2 px-4 py-2 bg-[#1a73e8] text-white rounded-lg hover:bg-[#1557b0] transition-colors text-sm font-medium"
                >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    <span>Create Event</span>
                </button>
            </div>

            {/* Events Grid */}
            {loading ? (
                <div className="flex items-center justify-center h-64">
                    <svg className="animate-spin h-8 w-8 text-[#1a73e8]" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                </div>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {events.length === 0 ? (
                        <div className="col-span-full text-center py-12">
                            <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <p className="text-gray-500">No events yet. Create your first event!</p>
                        </div>
                    ) : (
                        events.map((event) => (
                            <div key={event.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                                <div className="flex items-start justify-between mb-3">
                                    <h3 className="text-lg font-medium text-gray-900">{event.title}</h3>
                                    <div className="flex items-center space-x-2">
                                        <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(event.status)}`}>
                                            {event.status.replace('_', ' ')}
                                        </span>
                                        <button
                                            onClick={() => handleEditClick(event)}
                                            className="text-blue-500 hover:text-blue-700 transition-colors"
                                            title="Edit event"
                                        >
                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                            </svg>
                                        </button>
                                        <button
                                            onClick={() => handleDeleteClick(event.id)}
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
                                {!startTimeConfirmed ? (
                                    <div className="flex gap-2">
                                        <input
                                            type="datetime-local"
                                            required
                                            value={tempStartTime}
                                            onChange={(e) => setTempStartTime(e.target.value)}
                                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a73e8] focus:border-transparent"
                                        />
                                        <button
                                            type="button"
                                            onClick={handleConfirmStartTime}
                                            disabled={!tempStartTime}
                                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium disabled:bg-gray-300 disabled:cursor-not-allowed"
                                        >
                                            OK
                                        </button>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2 px-4 py-2 border border-green-300 bg-green-50 rounded-lg">
                                        <span className="flex-1 text-gray-700">{formatDateTime(newEvent.startTime)}</span>
                                        <button
                                            type="button"
                                            onClick={handleEditStartTime}
                                            className="text-[#1a73e8] hover:text-[#1557b0] text-sm font-medium"
                                        >
                                            Edit
                                        </button>
                                    </div>
                                )}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">End Time</label>
                                {!endTimeConfirmed ? (
                                    <div className="flex gap-2">
                                        <input
                                            type="datetime-local"
                                            required
                                            value={tempEndTime}
                                            onChange={(e) => setTempEndTime(e.target.value)}
                                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a73e8] focus:border-transparent"
                                        />
                                        <button
                                            type="button"
                                            onClick={handleConfirmEndTime}
                                            disabled={!tempEndTime}
                                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium disabled:bg-gray-300 disabled:cursor-not-allowed"
                                        >
                                            OK
                                        </button>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2 px-4 py-2 border border-green-300 bg-green-50 rounded-lg">
                                        <span className="flex-1 text-gray-700">{formatDateTime(newEvent.endTime)}</span>
                                        <button
                                            type="button"
                                            onClick={handleEditEndTime}
                                            className="text-[#1a73e8] hover:text-[#1557b0] text-sm font-medium"
                                        >
                                            Edit
                                        </button>
                                    </div>
                                )}
                            </div>
                            <div className="flex space-x-3 pt-4">
                                <button
                                    type="submit"
                                    disabled={!startTimeConfirmed || !endTimeConfirmed}
                                    className="flex-1 px-4 py-2 bg-[#1a73e8] text-white rounded-lg hover:bg-[#1557b0] transition-colors text-sm font-medium disabled:bg-gray-300 disabled:cursor-not-allowed"
                                >
                                    Create
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowCreateModal(false);
                                        setNewEvent({ title: '', startTime: '', endTime: '' });
                                        setStartTimeConfirmed(false);
                                        setEndTimeConfirmed(false);
                                        setTempStartTime('');
                                        setTempEndTime('');
                                    }}
                                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg max-w-md w-full p-6">
                        <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-red-100 rounded-full">
                            <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-medium text-gray-900 mb-2 text-center">Delete Event?</h3>
                        <p className="text-gray-600 mb-6 text-center">Are you sure you want to delete this event? This action cannot be undone.</p>
                        <div className="flex space-x-3">
                            <button
                                onClick={() => {
                                    setShowDeleteModal(false);
                                    setEventToDelete(null);
                                }}
                                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDeleteConfirm}
                                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Event Modal */}
            {showEditModal && editingEvent && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg max-w-md w-full p-6">
                        <h3 className="text-xl font-medium text-gray-900 mb-4">Edit Event</h3>
                        <form onSubmit={handleUpdateEvent} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Event Title</label>
                                <input
                                    type="text"
                                    required
                                    value={editEvent.title}
                                    onChange={(e) => setEditEvent({ ...editEvent, title: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a73e8] focus:border-transparent"
                                    placeholder="Team Meeting"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Start Time</label>
                                <input
                                    type="datetime-local"
                                    required
                                    value={editEvent.startTime}
                                    onChange={(e) => setEditEvent({ ...editEvent, startTime: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a73e8] focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">End Time</label>
                                <input
                                    type="datetime-local"
                                    required
                                    value={editEvent.endTime}
                                    onChange={(e) => setEditEvent({ ...editEvent, endTime: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a73e8] focus:border-transparent"
                                />
                            </div>
                            <div className="flex space-x-3 pt-4">
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2 bg-[#1a73e8] text-white rounded-lg hover:bg-[#1557b0] transition-colors text-sm font-medium"
                                >
                                    Update
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowEditModal(false);
                                        setEditingEvent(null);
                                    }}
                                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
