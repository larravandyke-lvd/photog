"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type Props = {
  onCapture: (photo: Blob) => Promise<void> | void;
  busy?: boolean;
};

/**
 * Live camera preview with a shutter button.
 *
 * getUserMedia needs a secure context, so this works on localhost and over
 * HTTPS but not on a plain-HTTP deployment.
 */
export default function CameraCapture({ onCapture, busy = false }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [active, setActive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const stop = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    setActive(false);
  }, []);

  // Release the camera if the component goes away while the stream is live.
  useEffect(() => stop, [stop]);

  async function start() {
    setError(null);
    if (!navigator.mediaDevices?.getUserMedia) {
      setError("This browser has no camera API. Try Chrome or Safari over HTTPS.");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
        audio: false,
      });
      streamRef.current = stream;
      setActive(true);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
    } catch (cause) {
      setError(
        cause instanceof DOMException && cause.name === "NotAllowedError"
          ? "Camera permission was denied."
          : "Could not open the camera.",
      );
    }
  }

  async function shoot() {
    const video = videoRef.current;
    if (!video || !video.videoWidth) return;

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d")?.drawImage(video, 0, 0);

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", 0.9),
    );
    if (!blob) {
      setError("Could not read a frame from the camera.");
      return;
    }

    await onCapture(blob);
    stop();
  }

  return (
    <div className="space-y-3">
      {active ? (
        <>
          <video
            ref={videoRef}
            playsInline
            muted
            className="w-full rounded-lg border border-border bg-black"
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={shoot}
              disabled={busy}
              className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
            >
              {busy ? "Saving…" : "Take photo"}
            </button>
            <button
              type="button"
              onClick={stop}
              className="rounded-md border border-border px-4 py-2 text-sm"
            >
              Cancel
            </button>
          </div>
        </>
      ) : (
        <button
          type="button"
          onClick={start}
          className="rounded-md border border-border px-4 py-2 text-sm"
        >
          Open camera
        </button>
      )}

      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
    </div>
  );
}
