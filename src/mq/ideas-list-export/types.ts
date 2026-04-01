import type { Idea } from "@/schemas/entities/ideas/entities/idea";
import type { IdeasListExtended } from "@/schemas/entities/ideas-lists/entities/ideas-list";
import type { VideoType } from "@/schemas/entities/video-types/entities/video-type";

type IdeaExport = Idea & {
  videoType: VideoType;
};

export type IdeasListExportData = IdeasListExtended & {
  ideas: IdeaExport[];
};
