'use client';

import { useRef, useState, useEffect } from 'react';

export default function CameraCapture({
  onDone,
}: {
  onDone: (photos: Blob[]) => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [shots, setShots] = useState<{ blob: Blob; url: string }[]>([]);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: 'environment' }, audio: false })
      .then((stream) => {
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setReady(true);
        }
      })
      .catch(() => setError('Camera access denied. Check your browser/site permissions.'));

    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  function takeShot() {
    const video = videoRef.current;
    if (!video) return;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx?.drawImage(video, 0, 0);
    canvas.toBlob(
      (blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          setShots((s) => [...s, { blob, url }]);
        }
      },
      'image/jpeg',
      0.9
    );
  }

  function removeShot(i: number) {
    setShots((s) => s.filter((_, idx) => idx !== i));
  }

  function finish() {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    onDone(shots.map((s) => s.blob));
  }

  if (error) {
    return (
      <div className="p-6 text-center">
        <p className="text-rust">{error}</p>
        <label className="mt-4 inline-block bg-ink text-paper px-4 py-2 rounded-lg cursor-pointer">
          Choose photos instead
          <input
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => {
              const files = Array.from(e.target.files || []);
              onDone(files);
            }}
          />
        </label>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-ink">
      <div className="relative flex-1 min-h-[50vh] bg-black">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover"
        />
        {!ready && (
          <p className="absolute inset-0 flex items-center justify-center text-paper/70 text-sm">
            Starting camera…
          </p>
        )}
      </div>

      {shots.length > 0 && (
        <div className="flex gap-2 overflow-x-auto p-3 bg-charcoal">
          {shots.map((s, i) => (
            <div key={i} className="relative shrink-0">
              <img src={s.url} className="h-16 w-16 object-cover rounded-md" />
              <button
                onClick={() => removeShot(i)}
                className="absolute -top-1 -right-1 bg-rust text-paper text-xs w-5 h-5 rounded-full"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="p-4 bg-charcoal flex items-center justify-between gap-4">
        <span className="text-paper/60 text-sm">{shots.length} photo{shots.length === 1 ? '' : 's'}</span>
        <button
          onClick={takeShot}
          disabled={!ready}
          className="w-16 h-16 rounded-full bg-paper border-4 border-amber active:scale-95 transition"
          aria-label="Take photo"
        />
        <button
          onClick={finish}
          disabled={shots.length === 0}
          className="bg-rust text-paper px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-40"
        >
          Done
        </button>
      </div>
    </div>
  );
}
