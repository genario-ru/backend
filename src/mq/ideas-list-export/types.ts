import type { Idea } from "@/domains/ideas/schemas/entities/idea";
import type { IdeasListExtended } from "@/domains/ideas-lists/schemas/entities/ideas-list";
import type { VideoType } from "@/domains/video-types/schemas/entities/video-type";

type IdeaExport = Idea & {
  videoType: VideoType;
};

export type IdeasListExportData = IdeasListExtended & {
  ideas: IdeaExport[];
};
