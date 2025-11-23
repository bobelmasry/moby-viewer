"use client"

import { Navbar } from '@/components/ui/shadcn-io/navbar-01';
import { createClient } from "@/utils/supabase/client";
import { useState, useEffect } from "react";
import type { User } from "@supabase/auth-js";
import type { Game, gameReleaseDates, gameDeveloper, gamePublisher } from '@/utils/types';

export default function Home() {
  const supabase = createClient()
  const [user, setUser] = useState<User | null>(null)
  const [games, setGames] = useState<Game[]>([])
  const [releaseDates, setReleaseDates] = useState<gameReleaseDates[]>([])
  const [gamePublishers, setPublishers] = useState<gamePublisher[]>([])
  const [gameDevelopers, setGameDevelopers] = useState<gameDeveloper[]>([])

  useEffect(() => {
      async function loadUser() {
        const { data } = await supabase.auth.getUser()
        setUser(data.user)
      }
      loadUser()
    }, [])

  useEffect(() => {
      async function getGameData(){
        const { data: games, error } = await supabase.from('game').select('*');
        setGames(games ?? [])
        if (error) {
            console.log(error)
        }
    }

    getGameData()

    async function getGameReleaseDates(){
      const { data: gameReleaseDates, error} = await supabase.from('gameReleaseDates').select('*')
      setReleaseDates(gameReleaseDates ?? [])
      if (error){
        console.log(error)
      }
    }
    getGameReleaseDates()

    async function getPublishers(){
      const { data: publishers, error} = await supabase.from('gamePublisher').select('*')
      setPublishers(publishers ?? [])
      if (error){
        console.log(error)
      }
    }
    getPublishers()

    async function getGameDeveloper(){
      const { data: gameDevelopers, error} = await supabase.from('gameDeveloper').select('*')
      setGameDevelopers(gameDevelopers ?? [])
      if (error){
        console.log(error)
      }
    }
    getGameDeveloper()
    }, [])

    const gamesWithYear = games.map(game => {
      const release = releaseDates.find(r => r.gameID === game.id)
      const year = release ? new Date(release.releaseDate).getFullYear() : null
      return {
        ...game,
        year
      }
    })

    type GroupedGames = {
      [key: string]: (Game & { year: number | null })[]
    }

    // Group by genre:
    const groupedByGenre: GroupedGames = gamesWithYear.reduce((acc, game) => {
      const genre = game.genre ?? 'Unknown'
      if (!acc[genre]) acc[genre] = []
      acc[genre].push(game)
      return acc
    }, {} as GroupedGames)

    // Group by year:
    const groupedByYear: GroupedGames = gamesWithYear.reduce((acc, game) => {
      const year = game.year ?? 0
      if (!acc[year]) acc[year] = []
      acc[year].push(game)
      return acc
    }, {} as GroupedGames)

    type TopGames = {
    key: string | number,
    topCritics: Game | null,
    topPlayers: Game | null
  }[]

  function getTopGames(grouped: GroupedGames): TopGames {
    return Object.entries(grouped).map(([key, gamesInGroup]) => {
      const topCritics = [...gamesInGroup].sort((a, b) => b.critics_rating - a.critics_rating)[0] || null
      const topPlayers = [...gamesInGroup].sort((a, b) => b.player_rating - a.player_rating)[0] || null
      return { key, topCritics, topPlayers }
    })
  }

  type Filters = {
  genre?: string
  platform?: string
  developerID?: number
  publisherID?: number
}

function filterGames(
  games: Game[],
  releaseDates: gameReleaseDates[],
  gameDevelopers: gameDeveloper[],
  gamePublishers: gamePublisher[],
  filters: Filters
) {
  return games.filter(game => {
    const release = releaseDates.find(r => r.gameID === game.id)

    const matchesGenre = filters.genre ? game.genre === filters.genre : true
    const matchesPlatform = filters.platform ? release?.platformName === filters.platform : true

    const matchesDeveloper = filters.developerID
      ? gameDevelopers.some(d => d.gameID === game.id && d.developerID === filters.developerID)
      : true

    const matchesPublisher = filters.publisherID
      ? gamePublishers.some(p => p.gameID === game.id && p.publisherID === filters.publisherID)
      : true

    return matchesGenre && matchesPlatform && matchesDeveloper && matchesPublisher
  })
}

const [filteredGames, setFilteredGames] = useState<Game[]>([])
const [selectedGenre, setSelectedGenre] = useState<string | undefined>()
const [selectedPlatform, setSelectedPlatform] = useState<string | undefined>()
const [selectedDeveloper, setSelectedDeveloper] = useState<string | undefined>()
const [selectedPublisher, setSelectedPublisher] = useState<string | undefined>()


useEffect(() => {
  const result = filterGames(
    games,
    releaseDates,
    gameDevelopers,
    gamePublishers,
    {
      genre: selectedGenre,
      platform: selectedPlatform,
      developerID: selectedDeveloper ? Number(selectedDeveloper) : undefined,
      publisherID: selectedPublisher ? Number(selectedPublisher) : undefined
    }
  )
  setFilteredGames(result)
}, [games, releaseDates, gameDevelopers, gamePublishers, selectedDeveloper, selectedGenre, selectedPlatform])


  const topByGenre = getTopGames(groupedByGenre)
  const topByYear = getTopGames(groupedByYear)

  const genres = Array.from(new Set(games.map(game => game.genre).filter(Boolean)))
  const platforms = Array.from(new Set(releaseDates.map(r => r.platformName).filter(Boolean)))
  const developers = Array.from(new Set(gameDevelopers.map(r => r.developerID).filter(Boolean)))
  const publishers = Array.from(new Set(gamePublishers.map(r => r.publisherID).filter(Boolean)))


    return (
    <div>
      <div className="relative md:w-3/4 w-full mx-auto">
        <Navbar user={user} />
      </div>
      <h1 className='text-3xl font-semibold ml-48 mt-20'>Top rated games by critics and players in each genre/year</h1>
      <table className="w-3/4 h-3/4 mx-auto mt-16 mb-16 bg-gray-100 divide-y divide-gray-200">
      <thead>
        <tr>
          <th>Genre/Year</th>
          <th>Top Critics Game</th>
          <th>Critics Rating</th>
          <th>Top Players Game</th>
          <th>Players Rating</th>
        </tr>
      </thead>
      <tbody>
        {topByGenre.map(group => (
          <tr key={group.key}>
            <td className="px-3 py-2">{group.key}</td>
            <td className="px-3 py-2">{group.topCritics?.game_name ?? 'N/A'}</td>
            <td className="px-3 py-2">{group.topCritics?.critics_rating ?? 'N/A'}</td>
            <td className="px-3 py-2">{group.topPlayers?.game_name ?? 'N/A'}</td>
            <td className="px-3 py-2">{group.topPlayers?.player_rating ?? 'N/A'}</td>
          </tr>
        ))}
      </tbody>
    </table>

    <h1 className='text-3xl font-semibold ml-50 mt-20 mb-8'>Showing games for a specific genre / platform / publisher / developer</h1>
    <div className="flex gap-4 ml-50">
      {/* Genre dropdown */}
      <div className="flex flex-col gap-2">
      <label htmlFor="">Genre</label>
      <select
        value={selectedGenre ?? ''}
        onChange={e => setSelectedGenre(e.target.value || undefined)}
        className="border px-2 py-1"
      >
        <option value="">All Genres</option>
        {genres.map(genre => (
          <option key={genre} value={genre}>{genre}</option>
        ))}
      </select>
      </div>

      {/* Platform dropdown */}
      <div className="flex flex-col gap-2">
      <label htmlFor="">Platform</label>
      <select
        value={selectedPlatform ?? ''}
        onChange={e => setSelectedPlatform(e.target.value || undefined)}
        className="border px-2 py-1"
      >
        <option value="">All Platforms</option>
        {platforms.map(platform => (
          <option key={platform} value={platform}>{platform}</option>
        ))}
      </select>
      </div>
      {/* Developer dropdown */}
      <div className="flex flex-col gap-2">
      <label htmlFor="">Developer</label>
      <select
        value={selectedDeveloper ?? ''}
        onChange={e => setSelectedDeveloper(e.target.value || undefined)}
        className="border px-2 py-1"
      >
        <option value="">All Developers</option>
        {developers.map(platform => (
          <option key={platform} value={platform}>{platform}</option>
        ))}
      </select>
      </div>
      {/* Publisher dropdown */}
      <div className="flex flex-col gap-2">
      <label htmlFor="">Publisher</label>
      <select
        value={selectedPublisher ?? ''}
        onChange={e => setSelectedPublisher(e.target.value || undefined)}
        className="border px-2 py-1"
      >
        <option value="">All Publishers</option>
        {publishers.map(platform => (
          <option key={platform} value={platform}>{platform}</option>
        ))}
      </select>
      </div>
      <div className="mt-8">
        <button className='bg-gray-200 p-1 rounded-md'
        onClick={() => {setSelectedGenre(''); setSelectedPlatform(''); setSelectedDeveloper(''); setSelectedPublisher('')}}>
          Reset
        </button>
      </div>
    </div>
      <table className="w-3/4 h-3/4 mx-auto mt-8 mb-16 bg-gray-100 divide-y divide-gray-200">
      <thead>
        <tr>
          <th>Game Name</th>
          <th>Genre</th>
          <th>Platform</th>
          <th>Developers</th>
          <th>Publishers</th>
        </tr>
      </thead>
      <tbody>
        {filteredGames.map(game => {
          const release = releaseDates.find(r => r.gameID === game.id)
          const devs = gameDevelopers.filter(d => d.gameID === game.id).map(d => d.developerID).join(', ')
          const pubs = gamePublishers.filter(p => p.gameID === game.id).map(p => p.publisherID).join(', ')

          return (
            <tr key={game.id}>
              <td className="px-3 py-2">{game.game_name}</td>
              <td className="px-3 py-2">{game.genre}</td>
              <td className="px-3 py-2">{release?.platformName ?? 'N/A'}</td>
              <td className="px-3 py-2">{devs || 'N/A'}</td>
              <td className="px-3 py-2">{pubs || 'N/A'}</td>
            </tr>
          )
        })}
      </tbody>
    </table>
    </div>
  );
}
