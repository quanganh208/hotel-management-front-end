import { redirect } from "next/navigation";

export default async function StaffPage({
  params,
}: {
  params: { id: string };
}) {
  redirect(`/hotels/${params.id}/staff/list`);
}
