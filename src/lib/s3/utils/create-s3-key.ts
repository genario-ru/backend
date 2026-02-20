type CreateS3KeyParams = {
  userId: string;
  folderName: string;
  fileName: string;
};

export function createS3Key({
  userId,
  folderName,
  fileName,
}: CreateS3KeyParams) {
  return `${userId}/${folderName}/${fileName}`;
}
