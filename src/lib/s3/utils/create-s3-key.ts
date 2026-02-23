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
  return `user-files/${userId}/${folderName}/${fileName}`;
}
