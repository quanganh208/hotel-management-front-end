import React from "react";
import { motion } from "framer-motion";
import { Room } from "@/types/room";
import { RoomStatusBadge } from "../utils/room-status-badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface RoomsTabProps {
  rooms: Room[];
}

export const RoomsTab = ({ rooms }: RoomsTabProps) => {
  return (
    <motion.div
      key="rooms-tab-content"
      initial={{ opacity: 0, x: 10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -10 }}
      transition={{ duration: 0.2 }}
    >
      <div className="rounded-md border h-full overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="font-medium">Tên phòng</TableHead>
              <TableHead className="font-medium">Khu vực</TableHead>
              <TableHead className="font-medium">Trạng thái</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rooms.length === 0 ? (
              <TableRow key="no-rooms">
                <TableCell colSpan={3} className="text-center h-24">
                  Không có phòng nào thuộc hạng phòng này.
                </TableCell>
              </TableRow>
            ) : (
              rooms.map((room) => (
                <TableRow key={`room-${room._id}`}>
                  <TableCell className="font-medium">
                    Phòng {room.roomNumber}
                  </TableCell>
                  <TableCell>Tầng {room.floor}</TableCell>
                  <TableCell>
                    <RoomStatusBadge status={room.status} />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </motion.div>
  );
};
