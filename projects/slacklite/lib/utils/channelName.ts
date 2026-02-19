import { validateChannelName } from "@/lib/utils/validation";

export const CHANNEL_NAME_REGEX = /^[a-z0-9-]+$/;
export const MAX_CHANNEL_NAME_LENGTH = 50;

export function formatChannelNameInput(value: string): string {
  return value.toLowerCase().replace(/\s+/g, "-");
}

export function getChannelNameValidationError(name: string): string {
  const validationResult = validateChannelName(name);

  if (validationResult.valid) {
    return "";
  }

  return validationResult.error ?? "Channel name must be 1-50 characters.";
}
