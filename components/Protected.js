'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import NavBar from "./NavBar";
import { api } from "../lib/api";

export default function Protected({ children }) {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    api("/auth/me")
      .then(() => setChecking(false))
      .catch(() => router.replace("/login"));
  }, [router]);

  if (checking) {
    return <div className="auth-shell"><div className="spinner">Checking authentication...</div></div>;
  }

  return (
    <div className="page">
      <NavBar />
      {children}
    </div>
  );
}
