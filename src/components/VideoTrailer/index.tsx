import React, { useState } from "react";
import styles from './VideoTrailer.module.scss'
import { getThumbnail } from "../../utils/format/getThumbnail";
import { getYouTubeEmbedUrl } from "../../utils/format/tranferUrl";

interface VideoTrailerProps {
    trailerUrl: string,
    movieName: string
}

const VideoTrailer: React.FC<VideoTrailerProps> = ({ trailerUrl, movieName }) => {
    const [isPlaying, setPlaying] = useState<boolean>(false);
    const demoTrailerUrl = trailerUrl || "https://www.youtube.com/watch?v=dQw4w9WgXcQ";
    const demoMovieName = movieName || "Demo Movie";


    const handlePlay = (): void => {
        setPlaying(true);
    }

    const handleClose = (): void => {
        setPlaying(false)
    }

    return (
        <div className={styles.container}>
            {!isPlaying ? (
                <div className={styles.thumbnail} onClick={handlePlay}>
                    <img
                        src={getThumbnail(demoTrailerUrl)}
                        alt={`${demoMovieName} trailer`}
                        className={styles.thumbnailImage}
                    />
                    <div className={styles.playOverlay}>
                        <div className={styles.playButton}>
                            <svg className={styles.playIcon} viewBox="0 0 24 24" fill="currentColor">
                                <path d="M8 5v14l11-7z" />
                            </svg>
                        </div>
                    </div>
                    <div className={styles.trailerLabel}>
                        Xem Trailer
                    </div>
                </div>
            ) : (
                <div className={styles.videoPlayer}>
                    <div className={styles.videoHeader}>
                        <h3 className={styles.videoTitle}>{demoMovieName} - Official Trailer</h3>
                        <button className={styles.closeButton} onClick={handleClose}>
                            <svg className={styles.closeIcon} viewBox="0 0 24 24" fill="currentColor">
                                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                            </svg>
                        </button>
                    </div>

                    <div className={styles.videoWrapper}>
                        <iframe
                            src={getYouTubeEmbedUrl(demoTrailerUrl)}
                            title={`${demoMovieName} Trailer`}
                            className={styles.videoFrame}
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                        />
                    </div>
                </div>
            )}
        </div>
    );
}

export default VideoTrailer;