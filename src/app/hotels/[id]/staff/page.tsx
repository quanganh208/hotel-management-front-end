import { redirect } from "next/navigation";

type PageParams = Promise<{ id: string[] }>;
export default async function StaffPage({ params }: { params: PageParams }) {
  const { id } = await params;
  redirect(`/hotels/${id}/staff/list`);
}
