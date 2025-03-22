"use client";
import { useSession } from "next-auth/react";

export default function DashboardPage() {
  const session = useSession();
  console.log(session);
  return (
    <div>
      <h1>Dashboard</h1>
    </div>
  );
}
