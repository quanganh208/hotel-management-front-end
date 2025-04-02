import { redirect } from "next/navigation";

export default async function HotelPage({
  params,
}: {
  params: { id: string };
}) {
  redirect(`/hotels/${params.id}/overview`);
}
