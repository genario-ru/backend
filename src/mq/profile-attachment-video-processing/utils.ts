import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

const TEMP_DIR_PREFIX = "profile-attachment-video-";

export async function createJobTempDir(): Promise<string> {
  return mkdtemp(join(tmpdir(), TEMP_DIR_PREFIX));
}

type CleanupJobTempDirParams = {
  tempDir: string;
};

export async function cleanupJobTempDir({
  tempDir,
}: CleanupJobTempDirParams): Promise<void> {
  await rm(tempDir, { recursive: true, force: true });
}
