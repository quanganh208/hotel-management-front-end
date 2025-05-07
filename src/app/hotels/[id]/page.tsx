import { redirect } from "next/navigation";
import { StaffRole } from "@/types/staff";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

type PageParams = Promise<{ id: string[] }>;
export default async function HotelPage({ params }: { params: PageParams }) {
  const session = await getServerSession(authOptions);
  const { id } = await params;

  if (session?.user?.role === StaffRole.RECEPTIONIST) {
    redirect(`/hotels/${id}/receptionist`);
  } else {
    redirect(`/hotels/${id}/overview`);
  }
}
