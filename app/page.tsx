"use client"

import Image from "next/image";
import { Navbar } from '@/components/ui/shadcn-io/navbar-01';
import { createClient } from "@/utils/supabase/client";
import { useState, useEffect } from "react";
import type { User } from "@supabase/auth-js";

export default function Home() {
  const supabase = createClient()
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
      async function loadUser() {
        const { data } = await supabase.auth.getUser()
        setUser(data.user)
      }
      loadUser()
    }, [])
  console.log(user)
  return (
    <div>
      <div className="relative md:w-3/4 w-full mx-auto">
        <Navbar user={user} />
      </div>
    </div>
  );
}
