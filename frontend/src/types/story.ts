export type Choice = {
  id: string;
  label: string;
  available?: boolean;
  imageUrl?: string;
  voiceUrl?: string;
};

export type StoryNodeType = "text" | "choice" | "ending";

export type StoryNode = {
  id: string;
  type: StoryNodeType;
  text: string;
  choices: Choice[];
  bgmUrl?: string;
};
