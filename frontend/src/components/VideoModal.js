import { useState } from "react";

export default function VideoModal( { videoId } ) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div>
      <img
        src = { `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` }
        alt = "Video Thumbnail"
        className = "thumbnail"
        onClick = { () => setIsOpen(true) }
      />

      { isOpen && (
        <div className = "modal">
          <button className = "close-button" onClick = { () => setIsOpen(false) } >
            ✕
          </button>

          <div className = "video-container">
            <iframe className = "video" src={`https://www.youtube.com/embed/${videoId}?autoplay=1`} frameBorder = "0" allowFullScreen/>
          </div>
        </div>
      )}
    </div>
  );
}