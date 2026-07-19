type TruncateForPromptParams = {
  text: string;
  maxLength: number;
};

export function truncateForPrompt({
  text,
  maxLength,
}: TruncateForPromptParams): string {
  if (text.length <= maxLength) {
    return text;
  }

  return `${text.slice(0, maxLength)}...`;
}
