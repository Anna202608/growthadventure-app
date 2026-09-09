import { useEffect, useRef, useState } from "react";

export default function KidVideoPlayer({ src, onEnded, className = "" }) {
  const videoRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [ended, setEnded] = useState(false);

  useEffect(() => {
    setPlaying(false);
    setEnded(false);
    const node = videoRef.current;
    if (node) {
      node.pause();
      node.currentTime = 0;
    }
  }, [src]);

  function toggle() {
    const node = videoRef.current;
    if (!node || !src) return;
    if (ended) {
      node.currentTime = 0;
      setEnded(false);
    }
    if (node.paused) {
      node.play();
      setPlaying(true);
    } else {
      node.pause();
      setPlaying(false);
    }
  }

  return (
    <div className={`relative overflow-hidden rounded-[28px] bg-violet-950 ${className}`}>
      <video
        ref={videoRef}
        src={src}
        playsInline
        className="block h-full w-full object-contain"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => {
          setPlaying(false);
          setEnded(true);
          onEnded?.();
        }}
      />
      <button
        type="button"
        onClick={toggle}
        className="absolute bottom-3 right-3 z-10 flex h-10 w-10 items-center justify-center rounded-full border-2 border-white bg-orange-400 text-sm text-white shadow-[0_3px_0_rgba(194,65,12,0.45)] sm:bottom-4 sm:right-4"
        aria-label={playing ? "暂停" : "播放"}
      >
        {playing ? "⏸" : "▶"}
      </button>
    </div>
  );
}
