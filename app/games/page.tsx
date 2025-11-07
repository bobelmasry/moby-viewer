import { createClient } from "@/utils/supabase/server";
import { DataTable } from "@/components/ui/data-table";
import { Navbar } from '@/components/ui/shadcn-io/navbar-01';
import { columns } from "@/components/gameColumns";


export default async function GamePage () {

    const supabase = await createClient();

    const { data: games, error } = await supabase.from('game').select('*');

    if (error) {
        console.error(error);
    }

    return (
        <>
        <div className="relative md:w-3/4 w-full mx-auto">
            <Navbar />
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