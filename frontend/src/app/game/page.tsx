import { GameContainer } from "@/components/GameContainer";
import Link from "next/link";

export default function GamePage() {
  return (
    <div className="min-h-screen bg-zinc-100 px-4 py-10 dark:bg-zinc-950">
      <header className="mx-auto mb-8 flex max-w-2xl items-center justify-between">
        <Link
          href="/"
          className="text-sm text-zinc-600 underline-offset-4 hover:text-zinc-900 hover:underline dark:text-zinc-400 dark:hover:text-zinc-100"
        >
          ← 返回首页
        </Link>
        <span className="text-sm font-medium text-zinc-500 dark:text-zinc-500">
          /game
        </span>
      </header>
      <GameContainer />
    </div>
  );
}
