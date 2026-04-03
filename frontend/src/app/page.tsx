import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 bg-zinc-100 px-4 dark:bg-zinc-950">
      <div className="text-center">
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          剧情向网页游戏
        </h1>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">
          Next.js + Spring Boot + MongoDB 示例骨架
        </p>
      </div>
      <Link
        href="/game"
        className="rounded-full bg-zinc-900 px-8 py-3 text-sm font-medium text-white transition hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
      >
        开始游戏
      </Link>
    </div>
  );
}
