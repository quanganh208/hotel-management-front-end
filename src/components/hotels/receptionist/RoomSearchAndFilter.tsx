import { Input } from "@/components/ui/input";
import {
  Search,
  CheckCircle,
  Users,
  Clipboard,
  Clock,
  Coffee,
  BedDouble,
  ShieldCheck,
  Ban,
} from "lucide-react";
import { RoomStatus } from "@/types/room";

const STATUS_LIST = [
  {
    value: RoomStatus.AVAILABLE,
    label: "Trống",
    icon: <CheckCircle className="h-4 w-4" />,
    color: "bg-green-100 text-green-700 border-green-400",
  },
  {
    value: RoomStatus.OCCUPIED,
    label: "Đang sử dụng",
    icon: <Users className="h-4 w-4" />,
    color: "bg-purple-100 text-purple-700 border-purple-400",
  },
  {
    value: RoomStatus.BOOKED,
    label: "Đã đặt trước",
    icon: <Clipboard className="h-4 w-4" />,
    color: "bg-blue-100 text-blue-700 border-blue-400",
  },
  {
    value: RoomStatus.CHECKED_IN,
    label: "Đã nhận phòng",
    icon: <ShieldCheck className="h-4 w-4" />,
    color: "bg-indigo-100 text-indigo-700 border-indigo-400",
  },
  {
    value: RoomStatus.CHECKED_OUT,
    label: "Đã trả phòng",
    icon: <Clock className="h-4 w-4" />,
    color: "bg-amber-100 text-amber-700 border-amber-400",
  },
  {
    value: RoomStatus.CLEANING,
    label: "Đang dọn dẹp",
    icon: <Coffee className="h-4 w-4" />,
    color: "bg-cyan-100 text-cyan-700 border-cyan-400",
  },
  {
    value: RoomStatus.MAINTENANCE,
    label: "Bảo trì",
    icon: <BedDouble className="h-4 w-4" />,
    color: "bg-red-100 text-red-700 border-red-400",
  },
  {
    value: RoomStatus.OUT_OF_SERVICE,
    label: "Ngừng sử dụng",
    icon: <Ban className="h-4 w-4" />,
    color: "bg-gray-100 text-gray-700 border-gray-400",
  },
  {
    value: RoomStatus.RESERVED,
    label: "Đã giữ chỗ",
    icon: <Clipboard className="h-4 w-4" />,
    color: "bg-teal-100 text-teal-700 border-teal-400",
  },
];

interface RoomSearchAndFilterProps {
  searchTerm: string;
  setSearchTerm: (v: string) => void;
  selectedStatuses: RoomStatus[];
  setSelectedStatuses: (v: RoomStatus[]) => void;
}

export default function RoomSearchAndFilter({
  searchTerm,
  setSearchTerm,
  selectedStatuses,
  setSelectedStatuses,
}: RoomSearchAndFilterProps) {
  const toggleStatus = (status: RoomStatus) => {
    if (selectedStatuses.includes(status)) {
      setSelectedStatuses(selectedStatuses.filter((s) => s !== status));
    } else {
      setSelectedStatuses([...selectedStatuses, status]);
    }
  };

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-xl shadow p-6 mb-6">
      <div className="flex flex-col gap-4">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-zinc-400" />
          <Input
            type="search"
            placeholder="Tìm kiếm phòng theo số, loại phòng..."
            className="pl-11 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-primary/30 transition text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-zinc-400"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap gap-3 mt-2">
          {STATUS_LIST.map((status) => (
            <button
              key={status.value}
              type="button"
              className={`flex items-center gap-1 px-4 py-2 rounded-full border text-sm font-medium transition-all focus:outline-none shadow-sm
                ${status.color}
                ${selectedStatuses.includes(status.value) ? "ring-2 ring-primary scale-105" : "opacity-80 hover:opacity-100"}
                dark:border-zinc-700 dark:shadow-none dark:bg-opacity-80`}
              onClick={() => toggleStatus(status.value)}
              style={{
                backgroundColor: selectedStatuses.includes(status.value)
                  ? undefined
                  : undefined,
              }}
            >
              {status.icon}
              {status.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
