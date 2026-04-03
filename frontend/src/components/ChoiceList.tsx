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
            className="w-full rounded-md border border-zinc-300 bg-white px-4 py-3 text-left text-sm font-medium text-zinc-800 transition hover:border-zinc-400 hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-600 dark:bg-zinc-950 dark:text-zinc-100 dark:hover:border-zinc-500 dark:hover:bg-zinc-900"
            onClick={() => onSelect?.(choice)}
          >
            {choice.label}
          </button>
        </li>
      ))}
    </ul>
  );
}
