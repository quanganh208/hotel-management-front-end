import { redirect } from "next/navigation";

export default async function InventoryPage({
  params,
}: {
  params: { id: string };
}) {
  redirect(`/hotels/${params.id}/inventory/categories`);
}
