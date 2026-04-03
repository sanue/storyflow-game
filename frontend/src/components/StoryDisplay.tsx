type StoryDisplayProps = {
  text: string;
};

export function StoryDisplay({ text }: StoryDisplayProps) {
  return (
    <section
      className="rounded-lg border border-zinc-200 bg-zinc-50 p-6 text-zinc-900 shadow-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
      aria-live="polite"
    >
      <p className="whitespace-pre-wrap leading-relaxed">{text}</p>
    </section>
  );
}
