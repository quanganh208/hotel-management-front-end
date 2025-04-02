import { redirect } from "next/navigation";

export default async function TransactionsPage({
  params,
}: {
  params: { id: string };
}) {
  redirect(`/hotels/${params.id}/transactions/bookings`);
}
