class SoundManager {
    constructor() {
        this.audioContext = null;
        this.sounds = {};
        this.bgm = null;
        this.currentBGM = null;
        this.masterVolume = 1.0;
        this.bgmVolume = 0.3;
        this.seVolume = 0.5;
        this.isMuted = false;
        this.isInitialized = false;
        
        // Web Audio APIの音源定義
        this.soundDefinitions = {
            // BGM
            titleBGM: { type: 'bgm', synthType: 'synth', pattern: 'title' },
            stageBGM: { type: 'bgm', synthType: 'synth', pattern: 'stage' },
            bossBGM: { type: 'bgm', synthType: 'synth', pattern: 'boss' },
            
            // 効果音
            playerShoot: { type: 'se', synthType: 'noise', duration: 0.05, frequency: 800 },
            enemyShoot: { type: 'se', synthType: 'sine', duration: 0.1, frequency: 400 },
            explosion: { type: 'se', synthType: 'noise', duration: 0.3, frequency: 100 },
            powerUp: { type: 'se', synthType: 'sine', duration: 0.2, frequency: 600, modulation: true },
            damage: { type: 'se', synthType: 'sawtooth', duration: 0.15, frequency: 200 },
            bossHit: { type: 'se', synthType: 'square', duration: 0.1, frequency: 150 },
            gameOver: { type: 'se', synthType: 'sine', duration: 1.0, frequency: 200, descending: true },
            stageClear: { type: 'se', synthType: 'sine', duration: 0.8, frequency: 400, ascending: true },
            bomb: { type: 'se', synthType: 'noise', duration: 0.5, frequency: 50 }
        };
    }
    
    // 初期化（ユーザー操作後に呼び出す）
    async init() {
        if (this.isInitialized) return;
        
        try {
            // Web Audio APIのコンテキストを作成
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            this.audioContext = new AudioContext();
            
            // サスペンド状態の場合は再開
            if (this.audioContext.state === 'suspended') {
                await this.audioContext.resume();
            }
            
            this.isInitialized = true;
            console.log('SoundManager initialized');
        } catch (error) {
            console.error('Failed to initialize SoundManager:', error);
        }
    }
    
    // 効果音を再生
    playSE(soundName) {
        if (!this.isInitialized || this.isMuted) return;
        
        const soundDef = this.soundDefinitions[soundName];
        if (!soundDef || soundDef.type !== 'se') return;
        
        try {
            const now = this.audioContext.currentTime;
            
            // ゲインノード（音量調整）
            const gainNode = this.audioContext.createGain();
            gainNode.connect(this.audioContext.destination);
            gainNode.gain.value = this.seVolume * this.masterVolume;
            
            if (soundDef.synthType === 'noise') {
                // ノイズ系の効果音
                this.playNoise(soundDef, gainNode, now);
            } else {
                // オシレーター系の効果音
                this.playOscillator(soundDef, gainNode, now);
            }
        } catch (error) {
            console.error('Failed to play SE:', error);
        }
    }
    
    // ノイズ効果音
    playNoise(soundDef, gainNode, startTime) {
        const bufferSize = this.audioContext.sampleRate * soundDef.duration;
        const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
        const output = buffer.getChannelData(0);
        
        // ホワイトノイズを生成
        for (let i = 0; i < bufferSize; i++) {
            output[i] = Math.random() * 2 - 1;
        }
        
        const source = this.audioContext.createBufferSource();
        source.buffer = buffer;
        
        // フィルターを適用
        const filter = this.audioContext.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = soundDef.frequency || 1000;
        
        source.connect(filter);
        filter.connect(gainNode);
        
        // エンベロープ
        gainNode.gain.setValueAtTime(0, startTime);
        gainNode.gain.linearRampToValueAtTime(this.seVolume * this.masterVolume, startTime + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + soundDef.duration);
        
        source.start(startTime);
        source.stop(startTime + soundDef.duration);
    }
    
    // オシレーター効果音
    playOscillator(soundDef, gainNode, startTime) {
        const oscillator = this.audioContext.createOscillator();
        oscillator.type = soundDef.synthType;
        oscillator.frequency.value = soundDef.frequency;
        
        // 周波数変調
        if (soundDef.modulation) {
            const lfo = this.audioContext.createOscillator();
            lfo.frequency.value = 10;
            const lfoGain = this.audioContext.createGain();
            lfoGain.gain.value = 50;
            lfo.connect(lfoGain);
            lfoGain.connect(oscillator.frequency);
            lfo.start(startTime);
            lfo.stop(startTime + soundDef.duration);
        }
        
        // 上昇/下降音
        if (soundDef.ascending) {
            oscillator.frequency.setValueAtTime(soundDef.frequency, startTime);
            oscillator.frequency.exponentialRampToValueAtTime(soundDef.frequency * 2, startTime + soundDef.duration);
        } else if (soundDef.descending) {
            oscillator.frequency.setValueAtTime(soundDef.frequency, startTime);
            oscillator.frequency.exponentialRampToValueAtTime(soundDef.frequency / 2, startTime + soundDef.duration);
        }
        
        oscillator.connect(gainNode);
        
        // エンベロープ
        gainNode.gain.setValueAtTime(0, startTime);
        gainNode.gain.linearRampToValueAtTime(this.seVolume * this.masterVolume, startTime + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + soundDef.duration);
        
        oscillator.start(startTime);
        oscillator.stop(startTime + soundDef.duration);
    }
    
    // BGMを再生
    playBGM(bgmName) {
        if (!this.isInitialized) return;
        
        // 現在のBGMを停止
        this.stopBGM();
        
        const soundDef = this.soundDefinitions[bgmName];
        if (!soundDef || soundDef.type !== 'bgm') return;
        
        try {
            this.currentBGM = bgmName;
            
            // BGM用のゲインノード
            const gainNode = this.audioContext.createGain();
            gainNode.connect(this.audioContext.destination);
            gainNode.gain.value = this.isMuted ? 0 : this.bgmVolume * this.masterVolume;
            
            // BGMパターンを生成
            this.bgm = this.createBGMPattern(soundDef.pattern, gainNode);
            
        } catch (error) {
            console.error('Failed to play BGM:', error);
        }
    }
    
    // BGMパターンの生成
    createBGMPattern(pattern, gainNode) {
        const bgmData = {
            oscillators: [],
            gainNode: gainNode,
            startTime: this.audioContext.currentTime
        };
        
        // パターンに応じたBGMを生成
        switch(pattern) {
            case 'title':
                this.createTitleBGM(bgmData);
                break;
            case 'stage':
                this.createStageBGM(bgmData);
                break;
            case 'boss':
                this.createBossBGM(bgmData);
                break;
        }
        
        return bgmData;
    }
    
    // タイトルBGM（シンプルなメロディ）
    createTitleBGM(bgmData) {
        const notes = [261.63, 293.66, 329.63, 349.23, 392.00, 349.23, 329.63, 293.66]; // C, D, E, F, G, F, E, D
        const duration = 0.5;
        let currentTime = bgmData.startTime;
        
        // メロディループ
        const playMelody = () => {
            notes.forEach((freq, index) => {
                const osc = this.audioContext.createOscillator();
                osc.type = 'sine';
                osc.frequency.value = freq;
                osc.connect(bgmData.gainNode);
                osc.start(currentTime + index * duration);
                osc.stop(currentTime + (index + 1) * duration);
            });
            currentTime += notes.length * duration;
            
            // ループ
            if (this.bgm === bgmData) {
                setTimeout(() => playMelody(), notes.length * duration * 1000);
            }
        };
        
        playMelody();
    }
    
    // ステージBGM（アップテンポ）
    createStageBGM(bgmData) {
        const bassNotes = [130.81, 146.83, 164.81, 146.83]; // C, D, E, D
        const duration = 0.25;
        let currentTime = bgmData.startTime;
        
        const playBass = () => {
            bassNotes.forEach((freq, index) => {
                // ベースライン
                const bass = this.audioContext.createOscillator();
                bass.type = 'sawtooth';
                bass.frequency.value = freq;
                const bassGain = this.audioContext.createGain();
                bassGain.gain.value = 0.3;
                bass.connect(bassGain);
                bassGain.connect(bgmData.gainNode);
                bass.start(currentTime + index * duration);
                bass.stop(currentTime + (index + 1) * duration);
                
                // ハイハット風
                if (index % 2 === 0) {
                    const hihat = this.audioContext.createOscillator();
                    hihat.type = 'square';
                    hihat.frequency.value = 8000;
                    const hihatGain = this.audioContext.createGain();
                    hihatGain.gain.value = 0.05;
                    hihat.connect(hihatGain);
                    hihatGain.connect(bgmData.gainNode);
                    hihat.start(currentTime + index * duration);
                    hihat.stop(currentTime + index * duration + 0.05);
                }
            });
            currentTime += bassNotes.length * duration;
            
            // ループ
            if (this.bgm === bgmData) {
                setTimeout(() => playBass(), bassNotes.length * duration * 1000);
            }
        };
        
        playBass();
    }
    
    // ボスBGM（緊張感のある）
    createBossBGM(bgmData) {
        const notes = [110, 116.54, 110, 103.83]; // A, Bb, A, Ab
        const duration = 0.3;
        let currentTime = bgmData.startTime;
        
        const playBossTheme = () => {
            notes.forEach((freq, index) => {
                // 低音
                const bass = this.audioContext.createOscillator();
                bass.type = 'square';
                bass.frequency.value = freq;
                const bassGain = this.audioContext.createGain();
                bassGain.gain.value = 0.4;
                bass.connect(bassGain);
                bassGain.connect(bgmData.gainNode);
                bass.start(currentTime + index * duration);
                bass.stop(currentTime + (index + 1) * duration);
                
                // 高音アクセント
                if (index === 0 || index === 2) {
                    const accent = this.audioContext.createOscillator();
                    accent.type = 'sawtooth';
                    accent.frequency.value = freq * 4;
                    const accentGain = this.audioContext.createGain();
                    accentGain.gain.value = 0.1;
                    accent.connect(accentGain);
                    accentGain.connect(bgmData.gainNode);
                    accent.start(currentTime + index * duration);
                    accent.stop(currentTime + index * duration + 0.1);
                }
            });
            currentTime += notes.length * duration;
            
            // ループ
            if (this.bgm === bgmData) {
                setTimeout(() => playBossTheme(), notes.length * duration * 1000);
            }
        };
        
        playBossTheme();
    }
    
    // BGMを停止
    stopBGM() {
        if (this.bgm) {
            // フェードアウト
            if (this.bgm.gainNode) {
                const now = this.audioContext.currentTime;
                this.bgm.gainNode.gain.setValueAtTime(this.bgm.gainNode.gain.value, now);
                this.bgm.gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
            }
            this.bgm = null;
            this.currentBGM = null;
        }
    }
    
    // 音量設定
    setMasterVolume(volume) {
        this.masterVolume = Math.max(0, Math.min(1, volume));
        this.updateBGMVolume();
    }
    
    setBGMVolume(volume) {
        this.bgmVolume = Math.max(0, Math.min(1, volume));
        this.updateBGMVolume();
    }
    
    setSEVolume(volume) {
        this.seVolume = Math.max(0, Math.min(1, volume));
    }
    
    updateBGMVolume() {
        if (this.bgm && this.bgm.gainNode) {
            this.bgm.gainNode.gain.value = this.isMuted ? 0 : this.bgmVolume * this.masterVolume;
        }
    }
    
    // ミュート切り替え
    toggleMute() {
        this.isMuted = !this.isMuted;
        this.updateBGMVolume();
        return this.isMuted;
    }
    
    // クリーンアップ
    cleanup() {
        this.stopBGM();
        if (this.audioContext) {
            this.audioContext.close();
            this.audioContext = null;
        }
        this.isInitialized = false;
    }
}

export default SoundManager;