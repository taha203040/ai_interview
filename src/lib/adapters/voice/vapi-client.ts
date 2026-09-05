"use client";

import Vapi from "@vapi-ai/web";

/**
 * Thin, client-only wrapper around the official Vapi Web SDK.
 *
 * All WebRTC, audio, and transcript handling is provided by @vapi-ai/web;
 * this class only narrows the surface area used by the application.
 *
 * See: https://docs.vapi.ai
 */

export interface TranscriptMessage {
  role: string;
  transcript: string;
}

export interface VoiceCallbacks {
  onTranscript?: (message: TranscriptMessage) => void;
  onCallStart?: () => void;
  onCallEnd?: () => void;
  onSpeechStart?: () => void;
  onSpeechEnd?: () => void;
  onError?: (error: unknown) => void;
}

export class InterviewVoice {
  private vapi: Vapi;

  constructor(publicKey: string) {
    this.vapi = new Vapi(publicKey);
  }

  start(
    assistantId: string,
    overrides?: Parameters<Vapi["start"]>[1]
  ): ReturnType<Vapi["start"]> {
    return this.vapi.start(assistantId, overrides);
  }

  stop(): ReturnType<Vapi["stop"]> {
    return this.vapi.stop();
  }

  setMuted(muted: boolean): void {
    this.vapi.setMuted(muted);
  }

  isMuted(): boolean {
    return this.vapi.isMuted();
  }

  subscribe(callbacks: VoiceCallbacks): void {
    if (callbacks.onCallStart) this.vapi.on("call-start", callbacks.onCallStart);
    if (callbacks.onCallEnd) this.vapi.on("call-end", callbacks.onCallEnd);
    if (callbacks.onSpeechStart) this.vapi.on("speech-start", callbacks.onSpeechStart);
    if (callbacks.onSpeechEnd) this.vapi.on("speech-end", callbacks.onSpeechEnd);
    if (callbacks.onError) this.vapi.on("error", callbacks.onError);

    if (callbacks.onTranscript) {
      this.vapi.on(
        "message",
        (message: { type?: string; role?: string; transcript?: string }) => {
          if (message.type === "transcript") {
            callbacks.onTranscript?.({
              role: message.role ?? "",
              transcript: message.transcript ?? "",
            });
          }
        }
      );
    }
  }
}
