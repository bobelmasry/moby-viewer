"use client"

import { createClient } from "@/utils/supabase/client";
import { DataTable } from "@/components/ui/data-table";
import { Navbar } from '@/components/ui/shadcn-io/navbar-01';
import { columns } from "@/components/gameColumns";
import type { User } from "@supabase/auth-js";
import { useState, useEffect } from "react";
import type { Game, userRating } from "@/utils/types";

export default function GamePage () {
    type GameWithUserRating = Game & { userRating: number | null }

    const supabase = createClient();
    const [user, setUser] = useState<User | null>(null)
    const [games, setGames] = useState<Game[]>([])
    const [userRatings, setUserRatings] = useState<userRating[]>([])
    const [merged, setMerged] = useState<GameWithUserRating[]>([])
    

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

  useEffect(() => {
    if (!user) return
    async function loadUserRatings(){
        const { data } = await supabase.from("userRating").select("*").eq('userID', user?.id)
        setUserRatings(data ?? [])
    }
    loadUserRatings()
    }, [user])

    useEffect(() => {
    const merged = games.map(game => {
        // find the user's rating for this game
        const ratingEntry = userRatings.find(r => r.gameID === game.id)
        return {
        ...game,
        userRating: ratingEntry ? ratingEntry.rating : null // attach user's rating or null
        }
    })
    setMerged(merged)
    }, [games, userRatings])

    return (
        <>
        <div className="relative md:w-3/4 w-full mx-auto">
            <Navbar user={user} />
        </div>
        <div className="w-3/4 h-3/4 m-auto">
            <h1 className="font-semibold text-3xl mb-8 mt-8">Games Viewer</h1>
            {merged && (
                <DataTable columns={columns} data={merged} />
            )}
        </div>
        </>
    )

}