"use client"

import { createClient } from "@/utils/supabase/client";
import { DataTable } from "@/components/ui/data-table";
import { Navbar } from '@/components/ui/shadcn-io/navbar-01';
import { columns } from "@/components/gameColumns";
import type { User } from "@supabase/auth-js";
import { useState, useEffect } from "react";

export default function GamePage () {

    type Game = {
  id: number;
  game_name: string;
  genre: string;
  pacing: string;
  setting: string;
  business_model: string;
  media_type: string;
  maturity_rating: string;
  moby_score: number;
  critics_rating: number;
  player_rating: number;
  player_count: number;
  perspective: string;
  interface: string;
  director: string;
};

    const supabase = createClient();
    const [user, setUser] = useState<User | null>(null)
    const [games, setGames] = useState<Game[]>([])
    

    useEffect(() => {
    async function loadUser() {
      const { data } = await supabase.auth.getUser()
      setUser(data.user)
    }
    loadUser()

    async function getGameData(){
        const { data: games, error } = await supabase.from('game').select('*');
        setGames(games ?? [])
        if (error) {
            console.log(error)
        }
    }

    getGameData()
  }, [])

    return (
        <>
        <div className="relative md:w-3/4 w-full mx-auto">
            <Navbar user={user} />
        </div>
        <div className="w-3/4 h-3/4 m-auto">
            <h1 className="font-semibold text-3xl mb-8 mt-8">Games Viewer</h1>
            {games && (
                <DataTable columns={columns} data={games} />
            )}
        </div>
        </>
    )

}