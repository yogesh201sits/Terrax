"use client";

import { useAuth } from "@clerk/nextjs";

export default function AuthTestPage() {
  const { getToken } = useAuth();

  const test = async () => {
    const token = await getToken();

    console.log("Clerk token:", token);
  };

  return (
    <main className="p-8">
      <button
        onClick={test}
        className="rounded-md border px-4 py-2"
      >
        Get Clerk Token
      </button>
    </main>
  );
}