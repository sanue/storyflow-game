"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Choice, StoryNode } from "@/types/story";
import { ChoiceList } from "./ChoiceList";
import { StoryDisplay } from "./StoryDisplay";

const API_BASE = "http://localhost:8080";
const USER_ID = "demo";

type BgmState = {
  ctx: AudioContext;
  masterGain: GainNode;
  osc1: OscillatorNode;
  osc2: OscillatorNode;
  intervalId: number;
};

export function GameContainer() {
  const [node, setNode] = useState<StoryNode | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [muted, setMuted] = useState(true);

  const bgmRef = useRef<BgmState | null>(null);
  const [bgmStarted, setBgmStarted] = useState(false);

  const statusText = useMemo(() => {
    if (loading) return "加载剧情中...";
    if (error) return "发生错误";
    return "点击“开始游戏”后将显示剧情";
  }, [loading, error]);

  useEffect(() => {
    return () => {
      stopBgm();
    };
  }, []);

  useEffect(() => {
    if (!bgmRef.current) return;
    bgmRef.current.masterGain.gain.value = muted ? 0 : 0.05;
  }, [muted]);

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
      ensureBgmStarted();
      setBgmStarted(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "start failed");
    } finally {
      setLoading(false);
    }
  }

  function ensureBgmStarted() {
    if (bgmRef.current) return;
    const AudioContextImpl =
      window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextImpl) return;

    const ctx = new AudioContextImpl();
    const masterGain = ctx.createGain();
    masterGain.gain.value = muted ? 0 : 0.05;
    masterGain.connect(ctx.destination);

    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 900;
    filter.Q.value = 0.5;
    filter.connect(masterGain);

    const osc1 = ctx.createOscillator();
    osc1.type = "sawtooth";
    osc1.frequency.value = 110;
    osc1.connect(filter);

    const osc2 = ctx.createOscillator();
    osc2.type = "triangle";
    osc2.frequency.value = 220;
    osc2.connect(filter);

    osc1.start();
    osc2.start();

    const intervalId = window.setInterval(() => {
      // 占位“长音乐”：每隔一段时间改变频率/滤波，让它听起来有流动感
      const now = ctx.currentTime;
      const drift = (Math.random() - 0.5) * 30;
      osc1.frequency.setValueAtTime(110 + drift, now);
      osc2.frequency.setValueAtTime(220 + drift * 1.8, now);
      filter.frequency.setValueAtTime(800 + Math.random() * 400, now);
    }, 1800);

    bgmRef.current = { ctx, masterGain, osc1, osc2, intervalId };
  }

  function stopBgm() {
    const bgm = bgmRef.current;
    if (!bgm) return;
    window.clearInterval(bgm.intervalId);
    try {
      bgm.osc1.stop();
      bgm.osc2.stop();
    } catch {
      // ignore
    }
    bgmRef.current = null;
    try {
      bgm.ctx.close();
    } catch {
      // ignore
    }
  }

  function hashToFreq(id: string) {
    let h = 0;
    for (let i = 0; i < id.length; i += 1) h = (h * 31 + id.charCodeAt(i)) % 100000;
    return 320 + (h % 420);
  }

  function playVoice(choice: Choice) {
    const AudioContextImpl =
      window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextImpl) return;

    // 优先复用 BGM 的 AudioContext（已在用户点击“开始游戏”时创建）
    const ctx = bgmRef.current?.ctx ?? new AudioContextImpl();
    if (ctx.state === "suspended") void ctx.resume();

    const osc = ctx.createOscillator();
    osc.type = "square";
    osc.frequency.value = hashToFreq(choice.id);

    const gain = ctx.createGain();
    gain.gain.value = 0;

    osc.connect(gain);
    gain.connect(ctx.destination);

    const now = ctx.currentTime;
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.08, now + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.25);

    osc.start(now);
    osc.stop(now + 0.26);
  }

  async function handleSelect(choice: Choice) {
    if (!node) return;
    if (choice.available === false) return;

    // 选项语音占位：点击后立刻播放
    playVoice(choice);

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
      <div className="flex items-center justify-between gap-4">
        <div className="text-sm text-zinc-500 dark:text-zinc-400">
          {node ? `当前节点：${node.id}` : "未开始"}
        </div>
        <label className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-300">
          <input
            type="checkbox"
            checked={muted}
            onChange={(e) => setMuted(e.target.checked)}
            disabled={!bgmStarted}
          />
          静音（BGM）
        </label>
      </div>

      {node ? (
        <>
          <StoryDisplay
            text={node.text}
            sceneImageBase={
              node.type === "text" || node.type === "ending"
                ? `/images/scenes/${node.id}`
                : undefined
            }
          />

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
          <div className="flex flex-col gap-4">
            <div>{statusText}</div>
            <button
              type="button"
              className="self-start rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-800 transition hover:border-zinc-400 hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-950 dark:text-zinc-100 dark:hover:border-zinc-500 dark:hover:bg-zinc-900 disabled:opacity-50"
              onClick={() => void start()}
              disabled={loading}
            >
              开始游戏
            </button>
          </div>
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
