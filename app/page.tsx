"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

const KonterApp = dynamic(() => import("./KonterApp"), { ssr: false });

export default function Page() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) window.location.href = "/login";
      else setReady(true);
    });
  }, []);

  if (!ready) return null;
  return <KonterApp />;
}
