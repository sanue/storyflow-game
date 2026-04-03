"use client";

import { useEffect, useState } from "react";
import type { Choice, StoryNode } from "@/types/story";
import { ChoiceList } from "./ChoiceList";
import { StoryDisplay } from "./StoryDisplay";

const API_BASE = "http://localhost:8080";
const USER_ID = "demo";

export function GameContainer() {
  const [node, setNode] = useState<StoryNode | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void start();
  }, []);

  async function start() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/api/story/start`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: USER_ID }),
      });
      if (!res.ok) {
        throw new Error(`start failed: HTTP ${res.status}`);
      }
      const data = (await res.json()) as StoryNode;
      setNode(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "start failed");
    } finally {
      setLoading(false);
    }
  }

  async function handleSelect(choice: Choice) {
    if (!node) return;
    if (choice.available === false) return;

    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/api/story/choose`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: USER_ID,
          fromNodeId: node.id,
          choiceId: choice.id,
        }),
      });
      if (!res.ok) {
        throw new Error(`choose failed: HTTP ${res.status}`);
      }
      const data = (await res.json()) as StoryNode;
      setNode(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "choose failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      {node ? (
        <>
          <StoryDisplay text={node.text} />

          {node.type === "choice" ? (
            <ChoiceList choices={node.choices} onSelect={handleSelect} />
          ) : null}

          {node.type === "ending" ? (
            <div className="flex items-center justify-center">
              <button
                type="button"
                className="rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-800 transition hover:border-zinc-400 hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-950 dark:text-zinc-100 dark:hover:border-zinc-500 dark:hover:bg-zinc-900"
                onClick={() => void start()}
                disabled={loading}
              >
                重新开始
              </button>
            </div>
          ) : null}
        </>
      ) : (
        <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-6 text-sm text-zinc-600 shadow-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300">
          {loading ? "加载剧情中..." : "点击“开始游戏”后将显示剧情。"}
        </div>
      )}

      {error ? (
        <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-200">
          {error}
        </div>
      ) : null}
    </div>
  );
}
