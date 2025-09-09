/**
 * STELLAR STRIKER - Class-based version
 * メインエントリーポイント
 */

import GameManager from './js/GameManager.js';

// DOMContentLoaded後に初期化
document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('gameCanvas');
    
    if (!canvas) {
        console.error('Canvas element not found');
        return;
    }
    
    // ゲームマネージャーを作成して開始
    const gameManager = new GameManager(canvas);
    gameManager.start();
});