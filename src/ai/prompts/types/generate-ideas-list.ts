export type VideoType = {
  id: string;
  name: string;
};

export type PreviousIdea = {
  name: string | null;
  description: string | null;
  videoType: VideoType;
};

export type GenerateIdeasListPromptProps = {
  userPrompt?: string | null;
  ideasCount?: number | null;
  ideasListName?: string | null;
  ideasListDescription?: string | null;
  ideasListTargetAudience?: string | null;
  ideasListTemplateName?: string | null;
  ideasListTemplateDescription?: string | null;
  ideasListProfileName?: string | null;
  ideasListProfileDescription?: string | null;
  ideasListTones?: string[] | null;
  ideasListVideoTypes?: VideoType[];
  previousGeneratedIdeas?: PreviousIdea[];
};
