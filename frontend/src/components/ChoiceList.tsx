import type { Choice } from "@/types/story";

type ChoiceListProps = {
  choices: Choice[];
  onSelect?: (choice: Choice) => void;
};

export function ChoiceList({ choices, onSelect }: ChoiceListProps) {
  return (
    <ul className="flex flex-col gap-2" role="list">
      {choices.map((choice) => (
        <li key={choice.id}>
          <button
            type="button"
            disabled={choice.available === false}
            className="flex w-full items-center gap-3 rounded-md border border-zinc-300 bg-white px-4 py-3 text-left text-sm font-medium text-zinc-800 transition hover:border-zinc-400 hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-600 dark:bg-zinc-950 dark:text-zinc-100 dark:hover:border-zinc-500 dark:hover:bg-zinc-900"
            onClick={() => onSelect?.(choice)}
          >
            <img
              src={choice.imageUrl ?? "/images/choice_placeholder.svg"}
              alt=""
              className="h-10 w-10 rounded-md border border-zinc-200 bg-zinc-50 object-cover dark:border-zinc-700 dark:bg-zinc-900"
            />
            <div className="flex min-w-0 flex-1 flex-col">
              <div className="flex items-center justify-between gap-2">
                <span className="truncate">{choice.label}</span>
                <span className="shrink-0 text-xs text-zinc-500 dark:text-zinc-400">
                  ♪
                </span>
              </div>
            </div>
          </button>
        </li>
      ))}
    </ul>
  );
}
