export type Choice = {
  id: string;
  label: string;
  available?: boolean;
};

export type StoryNodeType = "text" | "choice" | "ending";

export type StoryNode = {
  id: string;
  type: StoryNodeType;
  text: string;
  choices: Choice[];
};
