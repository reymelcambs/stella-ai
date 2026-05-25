import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Play, Tv, ExternalLink, Youtube, Sparkles } from 'lucide-react';

interface YouTubeVideo {
  id: string;
  title: string;
  description?: string;
  thumbnailUrl: string;
  channelName?: string;
}

interface YouTubeDeckProps {
  videos: YouTubeVideo[];
  isDarkMode: boolean;
}

export const YouTubeDeck: React.FC<YouTubeDeckProps> = ({ videos, isDarkMode }) => {
  const [playingId, setPlayingId] = useState<string | null>(null);

  if (!videos || videos.length === 0) return null;

  return (
    <div className="mt-6 space-y-4">
      {/* Deck Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-6 h-6 rounded-full bg-red-500/10 text-red-500">
            <Youtube className="w-3.5 h-3.5" />
          </div>
          <span className={`text-xs font-black uppercase tracking-[0.2em] ${
            isDarkMode ? 'text-slate-400' : 'text-slate-600'
          }`}>
            Visual Explanations
          </span>
        </div>
        <div className={`flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${
          isDarkMode 
            ? 'bg-brand-950/40 text-brand-400 border border-brand-900/30' 
            : 'bg-brand-50 text-brand-600 border border-brand-100'
        }`}>
          <Sparkles className="w-2.5 h-2.5" />
          Playable Inline
        </div>
      </div>

      {/* Videos List Container */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-2">
        {videos.map((video) => {
          const isPlaying = playingId === video.id;

          return (
            <motion.div
              key={video.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className={`flex flex-col border rounded-3xl overflow-hidden shadow-sm transition-colors ${
                isDarkMode 
                  ? 'bg-slate-900/40 border-slate-800/80 hover:border-slate-700/80' 
                  : 'bg-white border-slate-100 hover:border-slate-200'
              }`}
            >
              {/* Video Player or Thumbnail Aspect Container */}
              <div className="relative aspect-video w-full bg-black overflow-hidden group">
                {isPlaying ? (
                  <iframe
                    src={`https://www.youtube.com/embed/${video.id}?autoplay=1&rel=0`}
                    title={video.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    className="w-full h-full border-0 absolute inset-0"
                    referrerPolicy="strict-origin-when-cross-origin"
                  />
                ) : (
                  <>
                    <img
                      src={video.thumbnailUrl}
                      alt={video.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      loading="lazy"
                    />
                    
                    {/* Dark Hover Control Mask */}
                    <div className="absolute inset-0 bg-slate-950/40 group-hover:bg-slate-950/50 transition-all flex items-center justify-center">
                      {/* Play Button Ring */}
                      <button
                        onClick={() => setPlayingId(video.id)}
                        className="w-12 h-12 flex items-center justify-center rounded-full bg-brand-600 text-white shadow-lg shadow-brand-600/30 group-hover:bg-brand-500 group-hover:scale-110 active:scale-95 transition-all text-center focus:outline-none focus:ring-2 focus:ring-brand-500"
                        title="Play Lesson Inline"
                      >
                        <Play className="w-5 h-5 ml-0.5 fill-current text-white" />
                      </button>
                    </div>

                    {/* Channel Tag Overlay */}
                    {video.channelName && (
                      <div className="absolute bottom-3 left-3 px-2 py-0.5 rounded-md text-[9px] font-extrabold uppercase tracking-widest bg-slate-950/70 text-slate-200 backdrop-blur-sm">
                        {video.channelName}
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Video Details Card Section */}
              <div className="p-4 flex-1 flex flex-col justify-between">
                <div className="space-y-1.5">
                  <h4 className={`font-sans font-semibold text-xs leading-snug line-clamp-2 ${
                    isDarkMode ? 'text-slate-100' : 'text-slate-800'
                  }`} title={video.title}>
                    {video.title}
                  </h4>
                  {video.description && (
                    <p className={`text-[10px] line-clamp-2 leading-relaxed ${
                      isDarkMode ? 'text-slate-400' : 'text-slate-500'
                    }`}>
                      {video.description}
                    </p>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                  {isPlaying ? (
                    <button
                      onClick={() => setPlayingId(null)}
                      className="text-[10px] font-black uppercase tracking-wider text-red-500 hover:text-red-400 transition"
                    >
                      Stop Playback
                    </button>
                  ) : (
                    <button
                      onClick={() => setPlayingId(video.id)}
                      className="text-[10px] font-black uppercase tracking-wider text-brand-600 dark:text-brand-400 hover:underline inline-flex items-center gap-1"
                    >
                      <Tv className="w-3.5 h-3.5" />
                      Watch Lesson
                    </button>
                  )}

                  <a
                    href={`https://www.youtube.com/watch?v=${video.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`p-1.5 rounded-lg border transition-colors ${
                      isDarkMode 
                        ? 'border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200 bg-slate-900/60' 
                        : 'border-slate-100 text-slate-500 hover:border-slate-200 hover:text-slate-700 bg-slate-50'
                    }`}
                    title="Open on YouTube"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
