import YouTube, { YouTubeProps } from 'react-youtube';
import { songFirestore } from '../firebase/config';
import { useEffect, useRef } from 'react';
import { useAtom } from 'jotai';
import { controlList, songList } from '../services/songStore';

export default function Player() {
  const [songs] = useAtom(songList);
  const [current, next, _] = songs;

  const [controls] = useAtom(controlList);

  const firstDoc = controls?.at(0) ?? {};
  const { volume, paused } = firstDoc;

  const player = useRef<YouTube | any>();

  useEffect(() => {
    if (player.current) {
      player.current.getInternalPlayer().setVolume(volume);
      paused
        ? player.current.getInternalPlayer().pauseVideo()
        : player.current.getInternalPlayer().playVideo();
    }
  }, [volume, paused]);

  const opts: YouTubeProps['opts'] = {
    width: 600,
    height: 400,
    playerVars: {
      rel: 0,
      autoplay: 1,
      origin: '*',
    },
  };

  const onPlayerReady: YouTubeProps['onReady'] = (event) => {
    event.target.pauseVideo();
  };

  const onPlayerEnd: YouTubeProps['onEnd'] = () => {
    songFirestore.collection('song').doc(current?.id).delete();
  };

  const isPaused = () => {
    songFirestore
      .collection('control')
      .doc(firstDoc.id)
      .update({ paused: true });
  };

  const isPlaying = () => {
    songFirestore
      .collection('control')
      .doc(firstDoc.id)
      .update({ paused: false });
  };

  return (
    <>
      {current && (
        <main className='container vertical-middle'>
          <>
            <div className='text-center pt-3'>
              <YouTube
                ref={player}
                className='iframe text-white center'
                videoId={current?.video_id}
                opts={opts}
                onReady={onPlayerReady}
                onEnd={onPlayerEnd}
                id='player'
                onPause={isPaused}
                onPlay={isPlaying}
              />
            </div>
            <div className='pt-3'>
              {current && (
                <h2 className='text-center text-white'>
                  Now playing: {current.title}
                </h2>
              )}
              {next && (
                <h2 className='text-center text-white'>
                  Up next: {next.title}
                </h2>
              )}
            </div>
          </>
        </main>
      )}
    </>
  );
}
