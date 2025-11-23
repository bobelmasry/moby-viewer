"use client"

import { Navbar } from '@/components/ui/shadcn-io/navbar-01';
import { createClient } from "@/utils/supabase/client";
import { useState, useEffect } from "react";
import type { User } from "@supabase/auth-js";
import type { userRating, Game } from '@/utils/types';

export default function Home() {
  const supabase = createClient()
  const [user, setUser] = useState<User | null>(null)
  const [userRatings, setUserRatings] = useState<userRating[]>([])
  const [games, setGames] = useState<Game[]>([])
  type UserRatingWithName = userRating & { game_name: string | null }
  const [merged, setMerged] = useState<UserRatingWithName[]>([])

  useEffect(() => {
  async function loadUser() {
    const { data } = await supabase.auth.getUser()
    setUser(data.user)
  }
  async function loadGames(){
    const { data } = await supabase.from('game').select('*')
    setGames(data ?? [])
  }
  loadUser()
  loadGames()
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
  const merged = userRatings.map(r => {
    const game = games.find(g => g.id === r.gameID)
    return { ...r, game_name: game ? game.game_name : null }
  })
  setMerged(merged)
}, [userRatings, games])

  console.log(merged)

    return (
    <div>
      <div className="relative md:w-3/4 w-full mx-auto">
        <Navbar user={user} />
      </div>
      <div className="ml-64 mt-12">
        <h1 className="text-4xl font-semibold">My ratings</h1>
      </div>
      <div className="overflow-x-auto rounded border border-gray-300 shadow-sm w-64 flex mx-auto mt-32">
        <table className="min-w-full divide-y-2 divide-gray-200">
          <thead className="ltr:text-left rtl:text-right">
            <tr className="*:font-medium *:text-gray-900">
              <th className="px-3 py-2 whitespace-nowrap">Game Name</th>
              <th className="px-3 py-2 whitespace-nowrap">Rating</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-200">
            {merged.map((mergedEntry) => ( 
            <tr className="*:text-gray-900 *:first:font-medium">
              <td className="px-3 py-2 whitespace-nowrap">{mergedEntry.game_name}</td>
              <td className="px-3 py-2 whitespace-nowrap">{mergedEntry.rating}</td>
            </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
