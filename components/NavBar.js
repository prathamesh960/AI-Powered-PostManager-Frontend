'use client';

import Link from "next/link";
import { useRouter } from "next/navigation";
import { api } from "../lib/api";

export default function NavBar() {
  const router = useRouter();

  async function logout() {
    try {
      await api("/auth/logout", { method: "POST" });
      router.push("/login");
    } catch {
      router.push("/login");
    }
  }

  return (
    <nav className="navbar">
      <div className="brand">GBP Post </div>
      <div className="navlinks">
        <Link href="/dashboard">Dashboard</Link>
        <Link href="/locations">Locations</Link>
        <Link href="/posts">Posts</Link>
        <Link href="/create-post">Create Post</Link>
        <button className="btn btn-secondary" onClick={logout}>Logout</button>
      </div>
    </nav>
  );
}
