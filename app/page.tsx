"use client"

import { Navbar } from '@/components/ui/shadcn-io/navbar-01';
import { createClient } from "@/utils/supabase/client";
import { useState, useEffect } from "react";
import type { User } from "@supabase/auth-js";
import type { Game, gameReleaseDates, gameDeveloper, gamePublisher, publisher, developer } from '@/utils/types';

export default function Home() {
  const supabase = createClient()
  const [user, setUser] = useState<User | null>(null)
  const [games, setGames] = useState<Game[]>([])
  const [releaseDates, setReleaseDates] = useState<gameReleaseDates[]>([])
  const [gamePublishers, setGamePublishers] = useState<gamePublisher[]>([])
  const [gameDevelopers, setGameDevelopers] = useState<gameDeveloper[]>([])
  const [publisher, setPublisher] = useState<publisher[]>([])
  const [developer, setDeveloper] = useState<developer[]>([])

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

    async function getGamePublishers(){
      const { data: publishers, error} = await supabase.from('gamePublisher').select('*')
      setGamePublishers(publishers ?? [])
      if (error){
        console.log(error)
      }
    }
    getGamePublishers()

    async function getGameDeveloper(){
      const { data: gameDevelopers, error} = await supabase.from('gameDeveloper').select('*')
      setGameDevelopers(gameDevelopers ?? [])
      if (error){
        console.log(error)
      }
    }
    getGameDeveloper()

    async function getDevelopers(){
      const { data : developers, error} = await supabase.from('developer').select('*')
      setDeveloper(developers ?? [])
      if (error) {
        console.log(error)
      }
    }
    getDevelopers()

    async function getPublishers(){
      const { data : publishers, error} = await supabase.from('publisher').select('*')
      setPublisher(publishers ?? [])
    }
    getPublishers()
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

  const genres = Array.from(new Set(games.map(game => game.genre).filter(Boolean)))
  const platforms = Array.from(new Set(releaseDates.map(r => r.platformName).filter(Boolean)))
  const developers = Array.from(new Set(gameDevelopers.map(r => r.developerID).filter(Boolean)))
  const publishers = Array.from(new Set(gamePublishers.map(r => r.publisherID).filter(Boolean)))

  type GroupedGames2 = {
  [key: string]: Game[]
}

  // Group by a combined key: `${genre}-${setting}`
  const groupedByGenreSetting: GroupedGames2 = games.reduce((acc, game) => {
    const key = `${game.genre ?? 'Unknown'}-${game.setting ?? 'Unknown'}`
    if (!acc[key]) acc[key] = []
    acc[key].push(game)
    return acc
  }, {} as GroupedGames2)

  type TopGamesGroup = {
  genre: string
  setting: string
  topGames: Game[]
}

const topByGenreSetting: TopGamesGroup[] = Object.entries(groupedByGenreSetting).map(
  ([key, gamesInGroup]) => {
    const [genre, setting] = key.split('-')
    const topGames = [...gamesInGroup]
      .sort((a, b) => b.moby_score - a.moby_score)
      .slice(0, 5) // top 5
    return { genre, setting, topGames }
  }
)

type PlatformStats = {
platform: string
gameCount: number
avgCriticsRating: number
avgPlayerRating: number
}

function parsePercentage(value: string | number | null | undefined): number | null {
  if (typeof value === 'number') return value
  if (typeof value === 'string') {
    const num = parseFloat(value.replace('%', ''))
    return isNaN(num) ? null : num
  }
  return null
}


// Group games by platform
const platformStats: PlatformStats[] = Array.from(
  new Set(releaseDates.map(r => r.platformName).filter(Boolean))
).map(platform => {
  const gamesOnPlatform = releaseDates
    .filter(r => r.platformName === platform)
    .map(r => games.find(g => g.id === r.gameID))
    .filter((g): g is Game => g !== undefined)

  const validCritics = gamesOnPlatform
    .map(g => parsePercentage(g.critics_rating))
    .filter((r): r is number => r !== null)

  const validPlayer = gamesOnPlatform
    .map(g => parsePercentage(g.player_rating))
    .filter((r): r is number => r !== null)

  return {
    platform,
    gameCount: gamesOnPlatform.length,
    avgCriticsRating:
      validCritics.length > 0
        ? validCritics.reduce((a, b) => a + b, 0) / validCritics.length
        : 0,
    avgPlayerRating:
      validPlayer.length > 0
        ? validPlayer.reduce((a, b) => a + b, 0) / validPlayer.length
        : 0,
  }
})

type TopDeveloper = {
  genre: string
  developerID: number
  avgCriticsRating: number
  gameCount: number
}

const topDevelopersByGenre: TopDeveloper[] = []


genres.forEach(genre => {
  // Games in this genre
  const gamesInGenre = games.filter(g => g.genre === genre)

  // Map developerID -> games
  const devMap = new Map<number, Game[]>()
  gamesInGenre.forEach(game => {
    const devs = gameDevelopers.filter(d => d.gameID === game.id)
    devs.forEach(d => {
      if (!devMap.has(d.developerID)) devMap.set(d.developerID, [])
      devMap.get(d.developerID)!.push(game)
    })
  })

  // Compute average critics rating per developer
  const devStats: TopDeveloper[] = Array.from(devMap.entries()).map(([devID, devGames]) => {
    const validCritics = devGames
      .map(g => parsePercentage(g.critics_rating))
      .filter((r): r is number => r !== null)
    const avgCritics =
      validCritics.length > 0
        ? validCritics.reduce((a, b) => a + b, 0) / validCritics.length
        : 0
    return { genre, developerID: devID, avgCriticsRating: avgCritics, gameCount: devGames.length }
  })

  // Sort by avgCriticsRating descending and take top 5
  const top5 = devStats.sort((a, b) => b.avgCriticsRating - a.avgCriticsRating).slice(0, 5)
  topDevelopersByGenre.push(...top5)
})



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

    <h1 className='text-3xl font-semibold ml-50 mt-20 mb-8'>Showing top 5 games in each genre / setting by moby score</h1>

    <table className="w-3/4 h-3/4 mx-auto mt-8 mb-16 bg-gray-100 divide-y divide-gray-200">
      <thead className="bg-gray-300">
        <tr>
          <th>Genre</th>
          <th>Setting</th>
          <th>Rank</th>
          <th>Game Name</th>
          <th>Moby Score</th>
        </tr>
      </thead>
      <tbody>
        {topByGenreSetting.map(group =>
          group.topGames.map((game, index) => (
            <tr
              key={`${group.genre}-${group.setting}-${game.id}`}
              className={index === 0 ? 'border-t-4 border-gray-400' : ''}
            >
              {index === 0 && (
                <td rowSpan={group.topGames.length} className="px-3 py-2 font-medium">
                  {group.genre}
                </td>
              )}
              <td className="px-3 py-2">{game.setting}</td>
              <td className="px-3 py-2">{index + 1}</td>
              <td className="px-3 py-2">{game.game_name}</td>
              <td className="px-3 py-2">{game.moby_score}</td>
            </tr>
          ))
        )}
      </tbody>
    </table>

    <h1 className='text-3xl font-semibold ml-50 mt-20 mb-8'>Showing number of games available on each platform and their ratings</h1>

    <table className="w-3/4 mx-auto mt-8 mb-16 bg-gray-100 divide-y divide-gray-200">
      <thead className="bg-gray-300">
        <tr>
          <th>Platform</th>
          <th>Number of Games</th>
          <th>Average Critics Rating</th>
          <th>Average Player Rating</th>
        </tr>
      </thead>
      <tbody>
        {platformStats.map(stat => (
          <tr key={stat.platform} className="bg-gray-50">
            <td className="px-3 py-2 font-medium">{stat.platform}</td>
            <td className="px-3 py-2">{stat.gameCount}</td>
            <td className="px-3 py-2">{stat.avgCriticsRating.toFixed(2)}</td>
            <td className="px-3 py-2">{stat.avgPlayerRating.toFixed(2)}</td>
          </tr>
        ))}
      </tbody>
    </table>

    <h1 className='text-3xl font-semibold ml-50 mt-20 mb-8'>Showing top 5 development companies by critics rating in each genre</h1>

    <table className="w-3/4 mx-auto mt-8 mb-16 bg-gray-100 divide-y divide-gray-200">
      <thead className="bg-gray-300">
        <tr>
          <th>Genre</th>
          <th>Developer</th>
          <th>Avg Critics Rating</th>
          <th>Number of Games</th>
        </tr>
      </thead>
      <tbody>
        {topDevelopersByGenre.map((dev, idx) => (
          <tr key={`${dev.genre}-${dev.developerID}-${idx}`} className="bg-gray-50">
            <td className="px-3 py-2 font-medium">{dev.genre}</td>
            <td className="px-3 py-2">{dev.developerID}</td>
            <td className="px-3 py-2">{dev.avgCriticsRating.toFixed(2)}%</td>
            <td className="px-3 py-2">{dev.gameCount}</td>
          </tr>
        ))}
      </tbody>
    </table>
    </div>
  );
}
