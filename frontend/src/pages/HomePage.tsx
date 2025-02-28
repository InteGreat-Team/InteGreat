import { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000'; // Update if needed

function HomePage() {
    const [events, setEvents] = useState<{ event_id: number; name: string; date: string; location: string }[]>([]);

    useEffect(() => {
        axios.get(`${API_BASE_URL}/events/1`) // Fetch event with ID 1
            .then(response => setEvents([response.data]))
            .catch(error => console.error('Error fetching events:', error));
    }, []);

    return (
        <div>
            <h2>📅 Events</h2>
            {events.length > 0 ? (
                <ul>
                    {events.map(event => (
                        <li key={event.event_id}>
                            <strong>{event.name}</strong> - {event.date} at {event.location}
                        </li>
                    ))}
                </ul>
            ) : (
                <p>No events found.</p>
            )}
        </div>
    );
}

export default HomePage;
