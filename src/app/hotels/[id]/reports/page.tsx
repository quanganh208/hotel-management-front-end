import { redirect } from "next/navigation";

export default async function ReportsPage({
  params,
}: {
  params: { id: string };
}) {
  redirect(`/hotels/${params.id}/reports/revenue`);
}
