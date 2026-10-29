import Anthropic from "@anthropic-ai/sdk";

// One Anthropic client for the AI steps, created on first use so a missing
// key fails the call, not the build. Reads ANTHROPIC_API_KEY. Server only:
// app code imports this from route handlers, never from client components.
// (No "server-only" import here, so the eval harness can run the same code.)

let client: Anthropic | undefined;

export function anthropic(): Anthropic {
  client ??= new Anthropic({ maxRetries: 1 });
  return client;
}
