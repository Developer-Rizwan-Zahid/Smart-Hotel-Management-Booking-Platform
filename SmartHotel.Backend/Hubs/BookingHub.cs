using Microsoft.AspNetCore.SignalR;

namespace SmartHotel.Backend.Hubs
{
    public class BookingHub : Hub
    {
        // Broadcast a booking update to all connected clients
        public async Task SendBookingUpdate(string message)
        {
            await Clients.All.SendAsync("ReceiveBookingUpdate", message);
        }

        // Broadcast availability update
        public async Task SendAvailabilityUpdate(int roomId, bool isAvailable)
        {
            await Clients.All.SendAsync("ReceiveAvailabilityUpdate", roomId, isAvailable);
        }

        public async Task JoinRoomGroup(string roomId)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, $"Room_{roomId}");
        }

        public async Task LeaveRoomGroup(string roomId)
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"Room_{roomId}");
        }
    }
}
