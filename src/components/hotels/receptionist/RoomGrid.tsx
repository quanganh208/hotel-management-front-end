import RoomCard from "./RoomCard";
import { motion } from "framer-motion";
import { RoomWithType } from "@/types/room";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

interface RoomGridProps {
  rooms: RoomWithType[];
  onRoomClick: (room: RoomWithType) => void;
}

export default function RoomGrid({ rooms, onRoomClick }: RoomGridProps) {
  if (rooms.length === 0) {
    return (
      <motion.div
        className="flex justify-center items-center py-12 text-gray-500"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        Không tìm thấy phòng nào phù hợp với bộ lọc.
      </motion.div>
    );
  }
  return (
    <motion.div
      className="bg-white dark:bg-zinc-900 rounded-lg shadow-sm dark:shadow-none p-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
        Danh sách phòng ({rooms.length})
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {rooms.map((room) => (
          <RoomCard
            key={room._id}
            room={room}
            onClick={() => onRoomClick(room)}
          />
        ))}
      </div>
    </motion.div>
  );
}
