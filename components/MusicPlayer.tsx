'use client'

import { AnimatePresence, m } from 'framer-motion'
import { useEffect } from 'react'
import { Disc3 } from 'lucide-react'
import { usePlayerStore, fmt } from '@/hooks/usePlayerStore'
import { PLAYLIST } from '@/lib/playlist'
import { EASE_OUT } from '@/lib/motion'
import { MpPanel } from './mp/MpPanel'
import { MpBar } from './mp/MpBar'
import { MpFullscreen } from './mp/MpFullscreen'

/* 播放器渲染层：状态与逻辑在 usePlayerStore，这里只做编排。
   三种形态：无歌 → 右下角小球；有歌 → 底部迷你条；展开 → 面板 / 沉浸歌词。 */
export function MusicPlayer() {
  const {
    idx, playing, time, duration, vol, shuffle, open, full, tab, cover, lrc, activeLrc, err,
    buffering, cur, pct, volPct, audioRef, seekBarRef, scrollRef,
    setOpen, setFull, setTab, play, next, prev, toggle, onSeekTo, seekToTime, toggleShuffle,
    setVolSafe, handlers,
  } = usePlayerStore()

  const showBar = idx >= 0 && !open

  /* 迷你条是 fixed 的，会盖住页脚最后一行：给 <html> 挂个标记，
     由 CSS 在 body 底部留出同等高度（有歌时才留）。 */
  useEffect(() => {
    document.documentElement.classList.toggle('has-mpbar', idx >= 0)
    return () => document.documentElement.classList.remove('has-mpbar')
  }, [idx])

  const openFull = () => {
    setOpen(false)
    setFull(true)
  }

  return (
    <>
      <AnimatePresence>
        {open && (
          <m.div
            className="fixed inset-0 z-[76] bg-black/50 sm:bg-black/40 backdrop-blur-[2px] max-sm:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: EASE_OUT }}
            onClick={() => setOpen(false)}
          />
        )}
      </AnimatePresence>

      <div className="mplayer fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-[80]">
        <AnimatePresence>
          {showBar && (
            <MpBar
              track={cur}
              cover={cover}
              playing={playing}
              pct={pct}
              onOpen={() => setOpen(true)}
              onToggle={toggle}
              onNext={next}
              onFull={openFull}
            />
          )}
        </AnimatePresence>

        <AnimatePresence>
          {open && (
            <MpPanel
              track={cur}
              error={err}
              buffering={buffering}
              tab={tab}
              cover={cover}
              playing={playing}
              lrc={lrc}
              activeLrc={activeLrc}
              tracks={PLAYLIST}
              idx={idx}
              pct={pct}
              timeStr={fmt(time)}
              durationStr={duration > 0 ? fmt(duration) : '--:--'}
              vol={vol}
              volPct={volPct}
              shuffle={shuffle}
              scrollRef={scrollRef}
              seekBarRef={seekBarRef}
              onClose={() => setOpen(false)}
              onTab={setTab}
              onPlay={play}
              onSeekTo={onSeekTo}
              onToggleShuffle={toggleShuffle}
              onPrev={prev}
              onToggle={toggle}
              onNext={next}
              onVol={setVolSafe}
              onFull={openFull}
            />
          )}
        </AnimatePresence>

        {idx < 0 && (
          <m.button
            onClick={() => play(0)}
            whileTap={{ scale: 0.9 }}
            transition={{ duration: 0.2 }}
            className="mp-ball"
            aria-label="播放余烬歌单"
          >
            {cover ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={cover} alt="" />
            ) : (
              <span className="mp-ball-cover">
                <Disc3 className="w-6 h-6" />
              </span>
            )}
          </m.button>
        )}
      </div>

      <AnimatePresence>
        {full && (
          <MpFullscreen
            track={cur}
            cover={cover}
            playing={playing}
            lrc={lrc}
            activeLrc={activeLrc}
            pct={pct}
            timeStr={fmt(time)}
            durationStr={duration > 0 ? fmt(duration) : '--:--'}
            onClose={() => setFull(false)}
            onToggle={toggle}
            onPrev={prev}
            onNext={next}
            onSeekTo={onSeekTo}
            onSeekToTime={seekToTime}
          />
        )}
      </AnimatePresence>

      <audio
        ref={audioRef}
        preload="none"
        onPlay={handlers.onAudioPlay}
        onPause={handlers.onAudioPause}
        onWaiting={handlers.onAudioWaiting}
        onCanPlay={handlers.onAudioCanPlay}
        onTimeUpdate={handlers.onAudioTimeUpdate}
        onLoadedMetadata={handlers.onAudioLoadedMetadata}
        onEnded={handlers.onAudioEnded}
        onError={handlers.onAudioError}
      />
    </>
  )
}
