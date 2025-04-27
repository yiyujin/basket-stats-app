import React, { useEffect, useRef, useState } from "react";

export default function YouTubePlayer( { videoId, onPlayerReady } ){
  const playerRef = useRef(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const intervalRef = useRef(null); // Track interval to clear it later

  useEffect(() => {
    const loadYouTubeAPI = () => {
      if (window.YT && window.YT.Player) {
        initializePlayer();
        return;
      }

      window.onYouTubeIframeAPIReady = initializePlayer;

      if (!document.querySelector("script[src='https://www.youtube.com/iframe_api']")) {
        const script = document.createElement("script");
        script.src = "https://www.youtube.com/iframe_api";
        script.async = true;
        document.body.appendChild(script);
      }
    };

    const initializePlayer = () => {
      if (!videoId) return;

      playerRef.current = new YT.Player("player", {
        width: "100%",
        height: "100%",
        videoId,
        playerVars: {
          autoplay: 0,
          controls: 1,
          rel: 0,
          fs: 1,
        },
        events: {
          onReady: (event) => {
            onPlayerReady(event.target);
            setDuration(event.target.getDuration());

            intervalRef.current = setInterval(() => {
              setCurrentTime(event.target.getCurrentTime());
            }, 1000);
          },
        },
      });
    };

    loadYouTubeAPI();

    return () => {
      if (playerRef.current) {
        playerRef.current.destroy();
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [videoId, onPlayerReady]);

  return (
    <div style={{ position: "relative", paddingTop: "56.25%", width: "100%" }}>
      <div id="player" style ={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%" }} />
    </div>
  );
};