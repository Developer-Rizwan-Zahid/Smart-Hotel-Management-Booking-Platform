const API_URL = "http://localhost:5000/api"; 

export interface CreateBookingDto {
    roomId: number;
    checkInDate: string;
    checkOutDate: string;
}

export interface Booking {
    id: number;
    roomId: number;
    userId: string;
    checkInDate: string;
    checkOutDate: string;
    status: number; 
    totalPrice: number;
    room?: {
        roomNumber: string;
        type: string;
    };
}

export const bookingService = {
    async createBooking(roomId: number, checkInDate: string, checkOutDate: string, token: string) {
        const response = await fetch(`${API_URL}/booking`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ roomId, checkInDate, checkOutDate }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || "Failed to create booking");
        }

        return response.json();
    },

    async getUserBookings(token: string): Promise<Booking[]> {
        const response = await fetch(`${API_URL}/booking`, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        if (!response.ok) throw new Error("Failed to fetch bookings");
        return response.json();
    },
};
