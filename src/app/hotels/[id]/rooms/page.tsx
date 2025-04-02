import { redirect } from "next/navigation";

export default async function RoomsPage({
  params,
}: {
  params: { id: string };
}) {
  redirect(`/hotels/${params.id}/rooms/list`);
}
