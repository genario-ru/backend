import type { Idea } from "@/schemas/domains/ideas/entities/idea";
import type { IdeasListExtended } from "@/schemas/domains/ideas-lists/entities/ideas-list";
import type { VideoType } from "@/schemas/domains/video-types/entities/video-type";

type IdeaExport = Idea & {
  videoType: VideoType;
};

export type IdeasListExportData = IdeasListExtended & {
  ideas: IdeaExport[];
};
