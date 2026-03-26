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
let preloadedNextMusic = null;
let musicQueue = [];

const shuffleArray = (array) => [...array].sort(() => Math.random() - 0.5);

const prepareNextMusic = () => {
    if (musicQueue.length === 0) {
        musicQueue = shuffleArray([music1, music2, music3, music4, music5]);
    }
    const nextTrack = musicQueue.pop();

    preloadedNextMusic = new Howl({
        src: [nextTrack],
        html5: false,
        preload: true,
        onloaderror: (id, err) => console.warn('Music load error:', err),
        onplayerror: function() {
            this.once('unlock', () => this.play());
        }
    });
};

prepareNextMusic(); 

export const waitForAudio = () => {
    return new Promise((resolve) => {
        const sounds = [...Object.values(sfxCache), preloadedNextMusic];
        let loadedCount = 0;

        const checkDone = () => {
            if (loadedCount === sounds.length) resolve();
        };

        sounds.forEach(sound => {
            if (sound.state() === 'loaded') {
                loadedCount++;
            } else {
                sound.once('load', () => {
                    loadedCount++;
                    checkDone();
                });
                sound.once('loaderror', () => {
                    console.warn('Audio failed to load.');
                    loadedCount++;
                    checkDone();
                });
            }
        });

        checkDone(); 
    });
};

export const stopMusic = () => {
    musicSession++;
    if (currentMusicHowl) {
        currentMusicHowl.stop();
        currentMusicHowl.unload();
        currentMusicHowl = null;
    }
};

export const playMusic = () => {
    stopMusic();
    const session = musicSession;

    const playCurrent = () => {
        if (musicSession !== session) return;

        currentMusicHowl = preloadedNextMusic;

        currentMusicHowl.on('end', function() {
            if (musicSession === session) {
                playCurrent(); 
            }
            this.unload();
        });

        if (getPreference('music')) {
            currentMusicHowl.play();
        }
        
        prepareNextMusic();
    };

    playCurrent();
};