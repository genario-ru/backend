import template from "@/ai/prompts/templates/system-prompt.md";
import analyticalTemplate from "@/ai/prompts/templates/system-prompt-analytical.md";

export function systemPrompt(): string {
  return template;
}

export function analyticalSystemPrompt(): string {
  return analyticalTemplate;
}
