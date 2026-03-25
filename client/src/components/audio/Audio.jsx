import { Howl } from 'howler';
import music1 from '../../assets/music/track1.ogg';
import music2 from '../../assets/music/track2.ogg';
import music3 from '../../assets/music/track3.ogg';
import music4 from '../../assets/music/track4.ogg';
import music5 from '../../assets/music/track5.ogg';
import sound1 from '../../assets/sound/track1.ogg';
import sound2 from '../../assets/sound/track2.ogg';
import sound3 from '../../assets/sound/track3.ogg';
import sound4 from '../../assets/sound/track4.ogg';
import sound5 from '../../assets/sound/track5.ogg';

const getPreference = (type) => localStorage.getItem(`pref_${type}`) !== '0';

const sfxCache = {
    confetti: new Howl({ src: [sound1], preload: true }),
    impact: new Howl({ src: [sound2], preload: true }),
    pop: new Howl({ src: [sound3], preload: true }),
    bonus: new Howl({ src: [sound4], preload: true }),
    swoosh: new Howl({ src: [sound5], preload: true })
};

export const getMusicEnabled = () => getPreference('music');
export const getSoundEnabled = () => getPreference('sound');

export const setSoundEnabled = (enabled) => {
    localStorage.setItem('pref_sound', enabled ? '1' : '0');
};

export const setMusicEnabled = (enabled) => {
    localStorage.setItem('pref_music', enabled ? '1' : '0');
};

export const playSound = (name) => {
    if (!getPreference('sound')) return;
    const sound = sfxCache[name];
    if (sound) {
        sound.stop();
        sound.play();
    } else {
        console.warn(`Sound "${name}" not found.`);
    }
};

let musicSession = 0;
let currentMusicHowl = null;
let musicQueue = [];

export const stopMusic = () => {
    musicSession++;
    if (currentMusicHowl) {
        currentMusicHowl.stop();
        currentMusicHowl = null;
    }
};

export const playMusic = () => {
    stopMusic();
    const session = musicSession;

    const shuffleArray = (array) => [...array].sort(() => Math.random() - 0.5);

    const playNextTrack = () => {
        if (musicSession !== session) return;

        if (musicQueue.length === 0) {
            musicQueue = shuffleArray([music1, music2, music3, music4, music5]);
        }

        const nextTrack = musicQueue.pop();

        const howl = new Howl({
            src: [nextTrack],
            html5: false,
            onend: playNextTrack,
            onloaderror: (id, err) => console.warn('Audio load error:', err),
            onplayerror: () => {
                howl.once('unlock', () => howl.play());
            },
        });

        currentMusicHowl = howl;

        if (getPreference('music')) {
            howl.play();
        }
    };

    playNextTrack();
};