import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Search, Layers, List } from "lucide-react";

interface RoomFilterProps {
  searchTerm: string;
  setSearchTerm: (v: string) => void;
  floors: string[];
  selectedFloor: string | null;
  setSelectedFloor: (v: string | null) => void;
}

export default function RoomFilter({
  searchTerm,
  setSearchTerm,
  floors,
  selectedFloor,
  setSelectedFloor,
}: RoomFilterProps) {
  return (
    <div className="bg-white rounded-xl shadow p-6 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
        <div className="md:col-span-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              type="search"
              placeholder="Tìm kiếm phòng..."
              className="pl-11 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/30 transition"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="md:col-span-2">
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="w-full flex bg-gray-100 rounded-lg shadow-inner p-1 gap-2">
              <TabsTrigger
                value="all"
                className="flex-1 flex items-center justify-center gap-2 rounded-lg transition-all data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-md h-10"
                onClick={() => setSelectedFloor(null)}
              >
                <List className="h-4 w-4" />
                Tất cả
              </TabsTrigger>
              <TabsTrigger
                value="floors"
                className="flex-1 flex items-center justify-center gap-2 rounded-lg transition-all data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-md h-10"
              >
                <Layers className="h-4 w-4" />
                Tầng
              </TabsTrigger>
            </TabsList>
            <TabsContent value="floors" className="mt-3">
              <div className="flex flex-wrap gap-3">
                {floors.map((floor) => (
                  <Badge
                    key={floor}
                    variant={selectedFloor === floor ? "default" : "outline"}
                    className={`cursor-pointer px-4 py-2 text-base rounded-lg border-2 transition-all ${selectedFloor === floor ? "border-primary bg-primary/90 text-white shadow" : "border-gray-200 bg-white hover:bg-primary/10 hover:border-primary/50"}`}
                    onClick={() =>
                      setSelectedFloor(selectedFloor === floor ? null : floor)
                    }
                  >
                    Tầng {floor}
                  </Badge>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
