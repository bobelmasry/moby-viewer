"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";

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

export const columns: ColumnDef<Game>[] = [
  { accessorKey: "moby_score", header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Moby Score
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ), },
  { accessorKey: "game_name", header: "Name" },
  { accessorKey: "genre", header: "Genre" },
  { accessorKey: "pacing", header: "Pacing" },
  { accessorKey: "setting", header: "Setting" },
  { accessorKey: "business_model", header: "Business Model" },
  { accessorKey: "media_type", header: "Media Type" },
  { accessorKey: "maturity_rating", header: "Maturity Rating" },
  { accessorKey: "critics_rating", header: "Critics Rating" },
  { accessorKey: "player_rating", header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Player Rating
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ), },
  { accessorKey: "player_count", header: "Player Count" },
  { accessorKey: "perspective", header: "Perspective" },
  { accessorKey: "interface", header: "Interface" },
  { accessorKey: "director", header: "Director" },
];
