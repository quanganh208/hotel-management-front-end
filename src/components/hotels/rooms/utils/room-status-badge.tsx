import React from "react";
import { Room } from "@/types/room";
import { Badge } from "@/components/ui/badge";
import { getStatusColor, getStatusText } from "./room-status-helpers";

interface RoomStatusBadgeProps {
  status: Room["status"];
}

export const RoomStatusBadge = ({ status }: RoomStatusBadgeProps) => {
  return (
    <Badge variant="outline" className={`${getStatusColor(status)} text-white`}>
      {getStatusText(status)}
    </Badge>
  );
};
