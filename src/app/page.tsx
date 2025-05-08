import Background from "~/components/Background";
import Steamitemtracker from "~/components/Steamitemtracker";


export default function Home() {
  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <div className="absolute inset-0">
        <Background />
      </div>
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="pointer-events-auto">
          <Steamitemtracker />
        </div>
      </div>
    </div>
  );
}