import Image from "next/image";
import { Navbar } from '@/components/ui/shadcn-io/navbar-01';


export default function Home() {
  return (
    <div>
      <div className="relative md:w-3/4 w-full mx-auto">
        <Navbar />
      </div>
    </div>
  );
}
