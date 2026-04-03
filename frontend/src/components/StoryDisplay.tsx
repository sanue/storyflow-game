"use client";

import { useEffect, useState } from "react";

type StoryDisplayProps = {
  text: string;
  sceneImageBase?: string;
};

const SCENE_IMAGE_EXTS = ["png", "jpg", "jpeg", "webp", "PNG", "JPG", "JPEG", "WEBP"] as const;

export function StoryDisplay({ text, sceneImageBase }: StoryDisplayProps) {
  const chars = Array.from(text);

  const [visibleCount, setVisibleCount] = useState(0);
  const [tick, setTick] = useState(0);
  const [sceneImgOk, setSceneImgOk] = useState(true);
  const [tryIndex, setTryIndex] = useState(0);

  useEffect(() => {
    setVisibleCount(0);
    setTick((t) => t + 1);
  }, [text]);

  useEffect(() => {
    setSceneImgOk(true);
    setTryIndex(0);
  }, [sceneImageBase]);

  useEffect(() => {
    if (chars.length === 0) return;
    const speedMs = 18; // 打字速度：越小越快
    const id = window.setInterval(() => {
      setVisibleCount((c) => {
        const next = c + 1;
        return next > chars.length ? chars.length : next;
      });
    }, speedMs);
    return () => window.clearInterval(id);
  }, [tick]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <section
      className="relative overflow-hidden rounded-lg border border-zinc-200 bg-zinc-50 p-6 text-zinc-900 shadow-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
      aria-live="polite"
    >
      {sceneImageBase && sceneImgOk ? (
        <div className="mb-4 overflow-hidden rounded-md border border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950">
          {/* 场景图片占位：默认按 node.id 加载；若文件不存在，自动隐藏 */}
          <img
            src={`${sceneImageBase}.${SCENE_IMAGE_EXTS[tryIndex]}`}
            alt=""
            className="h-40 w-full object-cover sm:h-48"
            onError={() => {
              setTryIndex((i) => {
                const next = i + 1;
                if (next >= SCENE_IMAGE_EXTS.length) {
                  setSceneImgOk(false);
                  return i;
                }
                return next;
              });
            }}
          />
        </div>
      ) : null}

      <div
        className="pointer-events-none absolute inset-0 opacity-20"
        style={{
          backgroundImage:
            "repeating-linear-gradient(to bottom, rgba(0,0,0,0.15), rgba(0,0,0,0.15) 1px, rgba(255,255,255,0) 3px, rgba(255,255,255,0) 6px)",
          mixBlendMode: "overlay",
        }}
      />
      <p className="whitespace-pre-wrap leading-relaxed font-mono text-sm md:text-base">
        {chars.map((ch, i) => {
          const revealed = i < visibleCount;
          // 未显示的字符用不换行空格占位，避免布局抖动
          const shown = ch === "\n" ? "\n" : revealed ? ch : "\u00A0";
          return (
            <span
              key={i}
              className={revealed ? "retro-glow" : ""}
            >
              {shown}
            </span>
          );
        })}
      </p>
    </section>
  );
}
