// let simulationInterval: NodeJS.Timeout | null = null;
let simulationInterval: ReturnType<typeof setInterval> | null = null;


export const startDriverSimulation = (socket: any, rideId: string, startLat: any, startLng: any) => {

    let currentLat = parseFloat(startLat);
    let currentLng = parseFloat(startLng);

    simulationInterval = setInterval(() => {
        // Move the driver slightly north-east randomly
        currentLat += 0.0005;
        currentLng += 0.0005;

        socket.emit("updateDriverLocation", {
            rideId: rideId,
            latitude: currentLat,
            longitude: currentLng,
            heading: 45 // Facing North-East
        });

    }, 2000); // Send update every 2 seconds
};

export const startFullTripSimulation = (socket: any, tripData: any) => {
    let currentLat = parseFloat(tripData.pickup_lat) - 0.01; // Start a bit away
    let currentLng = parseFloat(tripData.pickup_lng) - 0.01;
    let phase = 'TO_PICKUP';

    const interval = setInterval(() => {
        // Simple logic: Move toward target
        const target = phase === 'TO_PICKUP'
            ? { lat: parseFloat(tripData.pickup_lat), lng: parseFloat(tripData.pickup_lng) }
            : { lat: parseFloat(tripData.destination_lat), lng: parseFloat(tripData.destination_lng) };

        // Move coordinates 0.0005 closer to target
        if (currentLat < target.lat) currentLat += 0.0005; else currentLat -= 0.0005;
        if (currentLng < target.lng) currentLng += 0.0005; else currentLng -= 0.0005;

        socket.emit("updateDriverLocation", {
            rideId: tripData.trip_id,
            latitude: currentLat,
            longitude: currentLng,
        });

        // Check if arrived at pickup to switch phase
        const dist = Math.abs(currentLat - target.lat) + Math.abs(currentLng - target.lng);
        if (dist < 0.001 && phase === 'TO_PICKUP') {
            phase = 'ON_TRIP';
            socket.emit("updateStatus", { tripId: tripData.trip_id, status: 'ON_TRIP' });
        }
    }, 2000);
};


export const startNavigationSimulation = (socket: any, tripId: string, roadCoords: any[]) => {
    stopDriverSimulation();
    let index = 0;
    const intervalTime = 5000; // 20 seconds
    simulationInterval = setInterval(() => {
        if (index >= roadCoords.length) {
            stopDriverSimulation();
            return;
        }

        const current = roadCoords[index];
        const next = roadCoords[index + 1];

        // --- BETTER HEADING CALCULATION ---
        // Using Math.atan2(y, x) is fine for small distances, 
        // but ensure it's normalized to 0-360 degrees.
        let heading = 0;
        if (next) {
            const dy = next.latitude - current.latitude;
            const dx = next.longitude - current.longitude;
            heading = (Math.atan2(dx, dy) * 180) / Math.PI;
            if (heading < 0) heading += 360;
        }

        // --- ETA CALCULATION ---
        // Instead of just counting points, you could calculate 
        // the remaining distance if roadCoords is high-res.
        const remainingPoints = roadCoords.length - (index + 1);
        const etaInMinutes = Math.max(1, Math.ceil((remainingPoints * intervalTime) / 60000));
        // console.log(tripId,
        //     current.latitude,
        //     current.longitude,
        //     heading,
        //     etaInMinutes, "123");

        socket.emit("updateDriverLocation", {
            rideId: tripId,
            latitude: current.latitude,
            longitude: current.longitude,
            heading: heading,
            eta: etaInMinutes
        });

        index++;
    }, intervalTime);
};

// export const startNavigationSimulation = (socket: any, tripId: string, roadCoords: any[]) => {
//     stopDriverSimulation();
//     let index = 0;
//     const intervalTime = 10000; // 10 seconds
//     const simulatedSpeedKmh = 80; // Assume a steady city speed

//     simulationInterval = setInterval(() => {
//         if (index >= roadCoords.length) {
//             stopDriverSimulation();
//             return;
//         }

//         const current = roadCoords[index];
//         const next = roadCoords[index + 1]; // Just look at the immediate next point

//         // Calculate Bearing (Heading)
//         let heading = 0;
//         if (next) {
//             heading = calculateBearing(current, next);
//         }

//         // Calculate Real Distance Remaining (Kilometers)
//         const remainingDistance = calculateTotalDistance(roadCoords.slice(index));

//         // ETA = (Distance / Speed) * 60 minutes
//         const etaInMinutes = Math.ceil((remainingDistance / simulatedSpeedKmh) * 60);

//         socket.emit("updateDriverLocation", {
//             rideId: tripId,
//             latitude: current.latitude,
//             longitude: current.longitude,
//             heading: heading,
//             eta: Math.max(1, etaInMinutes)
//         });

//         index++;
//     }, intervalTime);
// };

// const toRad = (value: number) => (value * Math.PI) / 180;

// function calculateTotalDistance(coords: any[]): number {
//     let totalDistance = 0;
//     const R = 6371; // Earth's radius in kilometers

//     for (let i = 0; i < coords.length - 1; i++) {
//         const p1 = coords[i];
//         const p2 = coords[i + 1];

//         const dLat = toRad(p2.latitude - p1.latitude);
//         const dLon = toRad(p2.longitude - p1.longitude);

//         const a =
//             Math.sin(dLat / 2) * Math.sin(dLat / 2) +
//             Math.cos(toRad(p1.latitude)) * Math.cos(toRad(p2.latitude)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);

//         const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
//         totalDistance += R * c;
//     }

//     return totalDistance;
// }


// // Helper to get true compass bearing
// function calculateBearing(p1: any, p2: any) {
//     const lat1 = p1.latitude * Math.PI / 180;
//     const lat2 = p2.latitude * Math.PI / 180;
//     const dLon = (p2.longitude - p1.longitude) * Math.PI / 180;

//     const y = Math.sin(dLon) * Math.cos(lat2);
//     const x = Math.cos(lat1) * Math.sin(lat2) -
//         Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);

//     let brng = Math.atan2(y, x) * 180 / Math.PI;
//     return (brng + 360) % 360;
// }

// TestDriverUI.ts

// export const startFullTripSimulation = (socket: any, tripData: any) => {
//     // 1. In a real scenario, you'd fetch this from Google Directions API
//     // For now, we mock a few points to show movement
//     const mockRoute = [
//         { latitude: parseFloat(tripData.pickup_lat), longitude: parseFloat(tripData.pickup_lng) },
//         { latitude: parseFloat(tripData.pickup_lat) + 0.002, longitude: parseFloat(tripData.pickup_lng) + 0.001 },
//         { latitude: parseFloat(tripData.pickup_lat) + 0.004, longitude: parseFloat(tripData.pickup_lng) + 0.002 },
//         { latitude: parseFloat(tripData.drop_lat), longitude: parseFloat(tripData.drop_lng) }
//     ];

//     let step = 0;

//     const interval = setInterval(() => {
//         if (step >= mockRoute.length) {
//             clearInterval(interval);
//             console.log("🏁 Mock Trip Finished");
//             return;
//         }

//         const currentPoint = mockRoute[step];
//         const nextPoint = mockRoute[step + 1];

//         // Calculate heading (rotation) so the car faces the right way
//         const heading = nextPoint ? calculateHeading(currentPoint, nextPoint) : 0;

//         socket.emit("updateDriverLocation", {
//             rideId: tripData.trip_id,
//             latitude: currentPoint.latitude,
//             longitude: currentPoint.longitude,
//             heading: heading
//         });

//         step++;
//     }, 3000); // Move every 3 seconds

//     (globalThis as any).tripInterval = interval;
// };

const calculateHeading = (p1: any, p2: any) => {
    const lat1 = p1.latitude;
    const lon1 = p1.longitude;
    const lat2 = p2.latitude;
    const lon2 = p2.longitude;
    const angle = Math.atan2(lon2 - lon1, lat2 - lat1) * 180 / Math.PI;
    return angle;
};
export const stopDriverSimulation = () => {
    if (simulationInterval) {
        clearInterval(simulationInterval);
        simulationInterval = null;
    }
};