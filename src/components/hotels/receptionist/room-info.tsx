import Image from "next/image";
import { RoomWithType } from "@/types/room";
import { formatNumberWithCommas } from "@/lib/utils";

interface RoomInfoProps {
  room: RoomWithType;
}

export function RoomInfo({ room }: RoomInfoProps) {
  return (
    <div className="space-y-3">
      {room.image && (
        <div className="rounded-md overflow-hidden aspect-video relative">
          <Image
            src={room.image}
            alt={`Phòng ${room.roomNumber}`}
            fill
            className="object-cover"
          />
        </div>
      )}

      <div className="bg-muted/50 p-3 rounded-md">
        <div className="grid grid-cols-2 gap-y-2">
          <div className="text-sm font-medium">Loại phòng:</div>
          <div className="text-sm">{room.roomTypeId?.name || "N/A"}</div>

          <div className="text-sm font-medium">Giá theo giờ:</div>
          <div className="text-sm">
            {room.roomTypeId?.pricePerHour
              ? formatNumberWithCommas(room.roomTypeId.pricePerHour) + " đ"
              : "N/A"}
          </div>

          <div className="text-sm font-medium">Giá theo ngày:</div>
          <div className="text-sm">
            {room.roomTypeId?.pricePerDay
              ? formatNumberWithCommas(room.roomTypeId.pricePerDay) + " đ"
              : "N/A"}
          </div>

          <div className="text-sm font-medium">Giá qua đêm:</div>
          <div className="text-sm">
            {room.roomTypeId?.priceOvernight
              ? formatNumberWithCommas(room.roomTypeId.priceOvernight) + " đ"
              : "N/A"}
          </div>
        </div>
      </div>

      {room.note && (
        <div className="mt-2">
          <div className="text-sm font-medium mb-1">Ghi chú:</div>
          <div className="text-sm bg-muted/50 p-3 rounded-md">{room.note}</div>
        </div>
      )}
    </div>
  );
}
