"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import * as signalR from "@microsoft/signalr";

interface BookingContextType {
    connection: signalR.HubConnection | null;
    lastUpdate: string | null;
}

const BookingContext = createContext<BookingContextType>({
    connection: null,
    lastUpdate: null,
});

export const useBookingSignalR = () => useContext(BookingContext);

export const BookingProvider = ({ children }: { children: React.ReactNode }) => {
    const [connection, setConnection] = useState<signalR.HubConnection | null>(null);
    const [lastUpdate, setLastUpdate] = useState<string | null>(null);

    useEffect(() => {
        const newConnection = new signalR.HubConnectionBuilder()
            .withUrl("http://localhost:5000/bookingHub")
            .withAutomaticReconnect()
            .build();

        setConnection(newConnection);
    }, []);

    useEffect(() => {
        if (connection) {
            connection
                .start()
                .then(() => {
                    console.log("Connected to BookingHub");

                    connection.on("ReceiveBookingUpdate", (message: string) => {
                        console.log("Booking Update:", message);
                        setLastUpdate(message);
                        // Optionally trigger a toast or refresh data here
                    });
                })
                .catch((e) => console.log("Connection failed: ", e));
        }
    }, [connection]);

    return (
        <BookingContext.Provider value={{ connection, lastUpdate }}>
            {children}
        </BookingContext.Provider>
    );
};
