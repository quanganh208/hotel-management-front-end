"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams } from "next/navigation";
import { AnimatePresence } from "framer-motion";
import { CalendarDays, CreditCard } from "lucide-react";
import Header from "@/components/header";
import { Button } from "@/components/ui/button";
import { useRoomStore } from "@/store/rooms";
import { RoomStatus, RoomWithType } from "@/types/room";
import { toast } from "sonner";
import QuickStats from "@/components/hotels/receptionist/QuickStats";
import RoomSearchAndFilter from "@/components/hotels/receptionist/RoomSearchAndFilter";
import RoomGrid from "@/components/hotels/receptionist/RoomGrid";
import { BookingDialog } from "@/components/hotels/receptionist/booking-dialog";
import { RoomDetailDialog } from "@/components/hotels/receptionist/room-detail-dialog";

export default function ReceptionistPage() {
  const params = useParams();
  const hotelId = params.id as string;
  const { rooms, isFetching, fetchRooms } = useRoomStore();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatuses, setSelectedStatuses] = useState<RoomStatus[]>([]);
  const [quickStats, setQuickStats] = useState({
    available: 0,
    occupied: 0,
    cleaning: 0,
    maintenance: 0,
  });
  const [bookingDialogOpen, setBookingDialogOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<RoomWithType | null>(null);
  const [roomDetailOpen, setRoomDetailOpen] = useState(false);

  // Fetch rooms on component mount
  useEffect(() => {
    if (hotelId) {
      fetchRooms(hotelId);
    }
  }, [hotelId, fetchRooms]);

  // Filter rooms by hotel ID
  const hotelRooms = useMemo(() => {
    return rooms.filter((room) => room.hotelId === hotelId);
  }, [rooms, hotelId]);

  // Calculate stats when hotel rooms change
  useEffect(() => {
    const stats = {
      available: hotelRooms.filter(
        (room) => room.status === RoomStatus.AVAILABLE
      ).length,
      occupied: hotelRooms.filter(
        (room) =>
          room.status === RoomStatus.OCCUPIED ||
          room.status === RoomStatus.CHECKED_IN
      ).length,
      cleaning: hotelRooms.filter((room) => room.status === RoomStatus.CLEANING)
        .length,
      maintenance: hotelRooms.filter(
        (room) =>
          room.status === RoomStatus.MAINTENANCE ||
          room.status === RoomStatus.OUT_OF_SERVICE
      ).length,
    };
    setQuickStats(stats);
  }, [hotelRooms]);

  // Filter rooms by search term, selected floor, and selected statuses
  const filteredRooms = useMemo(() => {
    return hotelRooms.filter((room) => {
      const matchesSearch =
        searchTerm === "" ||
        room.roomNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (room.roomTypeId?.name &&
          room.roomTypeId.name
            .toLowerCase()
            .includes(searchTerm.toLowerCase()));
      const matchesStatus =
        selectedStatuses.length === 0 || selectedStatuses.includes(room.status);
      return matchesSearch && matchesStatus;
    });
  }, [hotelRooms, searchTerm, selectedStatuses]);

  // Group rooms by floor
  const roomsByFloor = useMemo(() => {
    const grouped: Record<string, RoomWithType[]> = {};
    filteredRooms.forEach((room) => {
      const floor = room.floor || "Khác";
      if (!grouped[floor]) grouped[floor] = [];
      grouped[floor].push(room);
    });
    return grouped;
  }, [filteredRooms]);

  // Handle room click
  const handleRoomClick = (room: RoomWithType) => {
    setSelectedRoom(room);
    setRoomDetailOpen(true);
  };

  // Handle create invoice
  const handleCreateInvoice = () => {
    toast.info("Tạo hóa đơn bán lẻ");
    // TODO: Triển khai tạo hóa đơn bán lẻ
  };

  // Handle create booking
  const handleCreateBooking = () => {
    setBookingDialogOpen(true);
  };

  return (
    <div className="flex min-h-screen flex-col bg-gray-50 dark:bg-zinc-950">
      <Header />
      <main className="flex-1 p-4 md:p-6 max-w-screen-2xl mx-auto">
        {/* Dashboard Header */}
        <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
                Quản lý Lễ tân
              </h1>
              <p className="text-gray-500 dark:text-gray-300 mt-1">
                Quản lý phòng, đặt phòng và tạo hóa đơn
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button
                onClick={handleCreateInvoice}
                variant="secondary"
                className="gap-2"
              >
                <CreditCard className="h-4 w-4" />
                Tạo hóa đơn bán lẻ
              </Button>
              <Button onClick={handleCreateBooking} className="gap-2">
                <CalendarDays className="h-4 w-4" />
                Đặt phòng
              </Button>
            </div>
          </div>
        </div>
        {/* Quick Stats Cards */}
        <QuickStats stats={quickStats} />
        {/* Search and filter */}
        <RoomSearchAndFilter
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          selectedStatuses={selectedStatuses}
          setSelectedStatuses={setSelectedStatuses}
        />
        {/* Room grid by floor */}
        <AnimatePresence mode="wait">
          {isFetching ? (
            <div className="flex justify-center items-center py-12">
              <div className="flex flex-col items-center">
                <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full mb-3"></div>
                <p className="text-gray-500 dark:text-gray-300">
                  Đang tải dữ liệu phòng...
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-8">
              {Object.keys(roomsByFloor).length === 0 ? (
                <div className="flex justify-center items-center py-12 text-gray-500 dark:text-gray-300">
                  Không tìm thấy phòng nào phù hợp với bộ lọc.
                </div>
              ) : (
                Object.keys(roomsByFloor)
                  .sort((a, b) => parseInt(a) - parseInt(b))
                  .map((floor) => (
                    <section key={floor}>
                      <h3 className="text-xl font-bold mb-4 text-primary flex items-center gap-2 dark:text-primary-300">
                        Tầng {floor}
                      </h3>
                      <RoomGrid
                        rooms={roomsByFloor[floor]}
                        onRoomClick={handleRoomClick}
                      />
                    </section>
                  ))
              )}
            </div>
          )}
        </AnimatePresence>

        {/* Booking Dialog */}
        <BookingDialog
          open={bookingDialogOpen}
          onOpenChange={setBookingDialogOpen}
          rooms={hotelRooms}
          onBookingSuccess={() => fetchRooms(hotelId)} // Refresh danh sách phòng sau khi đặt phòng thành công
        />

        {/* Room Detail Dialog */}
        {selectedRoom && (
          <RoomDetailDialog
            room={selectedRoom}
            open={roomDetailOpen}
            onOpenChange={setRoomDetailOpen}
            onBookingSuccess={() => fetchRooms(hotelId)} // Refresh danh sách phòng sau khi đặt phòng thành công
          />
        )}
      </main>
    </div>
  );
}
