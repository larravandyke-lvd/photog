'use client';

import { useRef, useState, useEffect, useCallback } from 'react';

export default function CameraCapture({
  onDone,
}: {
  onDone: (photos: Blob[]) => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [shots, setShots] = useState<{ blob: Blob; url: string }[]>([]);
  const [cameraReady, setCameraReady] = useState(false);
  const [cameraError, setCameraError] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    let cancelled = false;
    navigator.mediaDevices
      ?.getUserMedia({ video: { facingMode: 'environment' }, audio: false })
      .then((stream) => {
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setCameraReady(true);
        }
      })
      .catch(() => setCameraError(true));

    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  function addBlob(blob: Blob) {
    const url = URL.createObjectURL(blob);
    setShots((s) => [...s, { blob, url }]);
  }

  function addFiles(files: FileList | File[]) {
    Array.from(files)
      .filter((f) => f.type.startsWith('image/'))
      .forEach((f) => addBlob(f));
  }

  function takeShot() {
    const video = videoRef.current;
    if (!video) return;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx?.drawImage(video, 0, 0);
    canvas.toBlob((blob) => blob && addBlob(blob), 'image/jpeg', 0.9);
  }

  function removeShot(i: number) {
    setShots((s) => s.filter((_, idx) => idx !== i));
  }

  function finish() {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    onDone(shots.map((s) => s.blob));
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files?.length) addFiles(e.dataTransfer.files);
  }, []);

  return (
    <div className="flex flex-col h-full bg-ink">
      <div
        className="relative flex-1 min-h-[40vh] bg-black"
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
      >
        {!cameraError && (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />
        )}

        {cameraError && (
          <div className="w-full h-full flex flex-col items-center justify-center text-paper/60 text-sm gap-2 px-6 text-center">
            <p>No camera available here.</p>
            <p>Choose photos or drag them in below.</p>
          </div>
        )}

        {!cameraReady && !cameraError && (
          <p className="absolute inset-0 flex items-center justify-center text-paper/70 text-sm">
            Starting camera…
          </p>
        )}

        {isDragging && (
          <div className="absolute inset-0 bg-rust/80 flex items-center justify-center text-paper font-medium text-lg pointer-events-none">
            Drop photos to add them
          </div>
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

      <div
        className="p-4 bg-charcoal flex flex-col gap-3"
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
      >
        <div className="flex items-center justify-between gap-4">
          <span className="text-paper/60 text-sm shrink-0">
            {shots.length} photo{shots.length === 1 ? '' : 's'}
          </span>

          {!cameraError && (
            <button
              onClick={takeShot}
              disabled={!cameraReady}
              className="w-16 h-16 rounded-full bg-paper border-4 border-amber active:scale-95 transition shrink-0 disabled:opacity-30"
              aria-label="Take photo"
            />
          )}

          <button
            onClick={finish}
            disabled={shots.length === 0}
            className="bg-rust text-paper px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-40 shrink-0"
          >
            Done
          </button>
        </div>

        <button
          onClick={() => fileInputRef.current?.click()}
          className="w-full border border-paper/30 text-paper/80 text-sm py-2.5 rounded-lg"
        >
          Choose photos from library / computer
        </button>
        <p className="text-paper/40 text-xs text-center -mt-1">
          Select as many at once as you want — or drag files anywhere above
        </p>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => {
            if (e.target.files) addFiles(e.target.files);
            e.target.value = '';
          }}
        />
      </div>
    </div>
  );
}
