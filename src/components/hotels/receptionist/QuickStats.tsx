import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  CheckCircle,
  Users,
  Coffee,
  BedDouble,
  Clipboard,
  Clock,
  Ban,
  ShieldCheck,
  Star,
} from "lucide-react";

const STATUS_LIST = [
  {
    key: "available",
    label: "Phòng trống",
    icon: (
      <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
    ),
    color: "bg-green-100 dark:bg-green-900",
    valueKey: "available",
  },
  {
    key: "occupied",
    label: "Đang sử dụng",
    icon: <Users className="h-5 w-5 text-purple-600 dark:text-purple-400" />,
    color: "bg-purple-100 dark:bg-purple-900",
    valueKey: "occupied",
  },
  {
    key: "booked",
    label: "Đã đặt trước",
    icon: <Clipboard className="h-5 w-5 text-blue-600 dark:text-blue-400" />,
    color: "bg-blue-100 dark:bg-blue-900",
    valueKey: "booked",
  },
  {
    key: "checked_in",
    label: "Đã nhận phòng",
    icon: (
      <ShieldCheck className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
    ),
    color: "bg-indigo-100 dark:bg-indigo-900",
    valueKey: "checked_in",
  },
  {
    key: "checked_out",
    label: "Đã trả phòng",
    icon: <Clock className="h-5 w-5 text-amber-600 dark:text-amber-400" />,
    color: "bg-amber-100 dark:bg-amber-900",
    valueKey: "checked_out",
  },
  {
    key: "cleaning",
    label: "Đang dọn dẹp",
    icon: <Coffee className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />,
    color: "bg-cyan-100 dark:bg-cyan-900",
    valueKey: "cleaning",
  },
  {
    key: "maintenance",
    label: "Bảo trì",
    icon: <BedDouble className="h-5 w-5 text-red-600 dark:text-red-400" />,
    color: "bg-red-100 dark:bg-red-900",
    valueKey: "maintenance",
  },
  {
    key: "out_of_service",
    label: "Ngừng sử dụng",
    icon: <Ban className="h-5 w-5 text-gray-600 dark:text-gray-400" />,
    color: "bg-gray-100 dark:bg-zinc-800",
    valueKey: "out_of_service",
  },
  {
    key: "reserved",
    label: "Đã giữ chỗ",
    icon: <Star className="h-5 w-5 text-teal-600 dark:text-teal-400" />,
    color: "bg-teal-100 dark:bg-teal-900",
    valueKey: "reserved",
  },
];

export default function QuickStats({
  stats,
}: {
  stats: Record<string, number>;
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 mb-6">
      {STATUS_LIST.map((status) => (
        <Card
          key={status.key}
          className={`bg-white dark:bg-zinc-900 border-0 shadow-sm dark:shadow-none`}
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-300 flex items-center gap-2">
              {status.icon}
              {status.label}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <div className={`${status.color} p-2 rounded-full mr-3`}>
                {status.icon}
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats[status.valueKey] ?? 0}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
