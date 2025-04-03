import { redirect } from "next/navigation";

type PageParams = Promise<{ id: string[] }>;
export default async function HotelPage({ params }: { params: PageParams }) {
  const { id } = await params;
  redirect(`/hotels/${id}/overview`);
}
