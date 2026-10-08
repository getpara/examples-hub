export function getVerifyTitle(hasFrame: boolean, hasPasskey: boolean) {
  return hasPasskey && !hasFrame ? "Verify your passkey" : "Complete verification";
}

export function getVerifyDescription(destination: string, hasFrame: boolean, hasPasskey: boolean) {
  if (hasPasskey && !hasFrame) {
    return "Create or use your passkey to finish signing in.";
  }

  if (hasFrame && !hasPasskey) {
    return `Para sent a code to ${destination}. Enter it below.`;
  }

  return "Finish the Para verification below.";
}
