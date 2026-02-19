export const CHANNEL_NAME_REGEX = /^[a-z0-9-]+$/;
export const MAX_CHANNEL_NAME_LENGTH = 50;

export function formatChannelNameInput(value: string): string {
  return value.toLowerCase().replace(/\s+/g, "-");
}

export function getChannelNameValidationError(name: string): string {
  const normalizedName = name.trim();

  if (normalizedName.length === 0) {
    return "Channel name is required";
  }

  if (normalizedName.length > MAX_CHANNEL_NAME_LENGTH) {
    return "Channel name must be 50 characters or less";
  }

  if (!CHANNEL_NAME_REGEX.test(normalizedName)) {
    return "Use only lowercase letters, numbers, and hyphens";
  }

  return "";
}
