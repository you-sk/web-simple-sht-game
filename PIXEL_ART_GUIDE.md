# STELLAR STRIKER - ドット絵実装ガイド

## 概要
現在のベクターグラフィックスからドット絵（ピクセルアート）への移行ガイド

## 実装方法の選択肢

### 方法1: 画像ファイルを使用（推奨）
**メリット**
- 高品質なドット絵を外部ツールで作成可能
- アニメーションが作りやすい
- 修正や差し替えが容易

**デメリット**
- 画像ファイルの準備が必要
- ロード時間が発生

### 方法2: プログラムで描画
**メリット**
- 追加ファイル不要
- 動的な色変更が可能
- ロード時間なし

**デメリット**
- 複雑なドット絵は記述が大変
- メンテナンスが困難

## 推奨フォルダ構造

```
web-simple-sht-game/
├── assets/
│   ├── sprites/
│   │   ├── player/
│   │   │   ├── player_idle.png (32x32)
│   │   │   ├── player_move.png (32x32 x 4フレーム)
│   │   │   ├── player_damaged.png (32x32 x 3フレーム)
│   │   │   └── player_explosion.png (32x32 x 8フレーム)
│   │   ├── enemies/
│   │   │   ├── crosser.png (24x24)
│   │   │   ├── chaser.png (24x24)
│   │   │   ├── shooter.png (24x24)
│   │   │   └── enemy_bullets.png (8x8 x 4種類)
│   │   ├── bosses/
│   │   │   ├── boss1_idle.png (96x64)
│   │   │   ├── boss1_attack.png (96x64 x 4フレーム)
│   │   │   ├── boss2_idle.png (96x64)
│   │   │   ├── boss2_attack.png (96x64 x 4フレーム)
│   │   │   ├── boss3_idle.png (96x64)
│   │   │   └── boss3_attack.png (96x64 x 4フレーム)
│   │   ├── effects/
│   │   │   ├── explosion_small.png (16x16 x 6フレーム)
│   │   │   ├── explosion_medium.png (32x32 x 8フレーム)
│   │   │   ├── explosion_large.png (64x64 x 10フレーム)
│   │   │   └── muzzle_flash.png (16x16 x 3フレーム)
│   │   ├── items/
│   │   │   ├── powerup_3way.png (16x16)
│   │   │   ├── powerup_laser.png (16x16)
│   │   │   ├── powerup_speed.png (16x16)
│   │   │   └── powerup_shield.png (16x16)
│   │   └── ui/
│   │       ├── life_icon.png (16x16)
│   │       ├── score_numbers.png (8x8 x 10)
│   │       └── boss_healthbar.png (128x16)
│   └── backgrounds/
│       ├── stage1/
│       │   ├── forest_tiles.png (32x32 タイルセット)
│       │   ├── mountain_tiles.png
│       │   └── river_tiles.png
│       ├── stage2/
│       │   ├── desert_tiles.png
│       │   └── pyramid_tiles.png
│       └── stage3/
│           ├── space_bg.png
│           ├── stars.png
│           └── planets.png
```

## 画像仕様

### サイズ規格
| オブジェクト | 推奨サイズ | 備考 |
|------------|-----------|------|
| プレイヤー | 32x32px | アニメーション用に横並び |
| 小型敵 | 24x24px | 各タイプごとに作成 |
| ボス | 96x64px | ステージごとに異なるデザイン |
| プレイヤー弾 | 8x16px | 縦長の弾丸 |
| 敵弾 | 8x8px | 円形または菱形 |
| ボス弾 | 12x12px | 特殊パターン用 |
| アイテム | 16x16px | 光る演出付き |
| 爆発エフェクト | 16/32/64px | サイズ別に用意 |

### カラーパレット（推奨）
```css
/* メインカラー */
--color-black: #1a1a2e;
--color-white: #eee;
--color-gray: #707070;

/* プレイヤー */
--player-main: #3498db;
--player-accent: #5dade2;
--player-dark: #2874a6;

/* 敵 */
--enemy-red: #e74c3c;
--enemy-orange: #e67e22;
--enemy-purple: #9b59b6;

/* ボス */
--boss-main: #c0392b;
--boss-accent: #a93226;
--boss-core: #ff7979;

/* エフェクト */
--explosion-yellow: #f1c40f;
--explosion-orange: #f39c12;
--explosion-red: #e74c3c;

/* 背景 */
--bg-forest: #27ae60;
--bg-desert: #f0e68c;
--bg-space: #000033;
```

## 実装コード例

### 1. AssetLoader クラス
```javascript
// js/AssetLoader.js
export default class AssetLoader {
    constructor() {
        this.assets = new Map();
        this.loadQueue = [];
        this.onProgress = null;
        this.onComplete = null;
    }

    addToQueue(key, path, type = 'image') {
        this.loadQueue.push({ key, path, type });
    }

    async loadAll() {
        const total = this.loadQueue.length;
        let loaded = 0;

        for (const item of this.loadQueue) {
            try {
                if (item.type === 'image') {
                    const img = await this.loadImage(item.path);
                    this.assets.set(item.key, img);
                }
                // 他のタイプ（音声など）も追加可能
                
                loaded++;
                if (this.onProgress) {
                    this.onProgress(loaded, total);
                }
            } catch (error) {
                console.error(`Failed to load ${item.key}:`, error);
            }
        }

        if (this.onComplete) {
            this.onComplete();
        }
    }

    loadImage(path) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = reject;
            img.src = path;
        });
    }

    get(key) {
        return this.assets.get(key);
    }
}
```

### 2. SpriteRenderer クラス
```javascript
// js/SpriteRenderer.js
export default class SpriteRenderer {
    constructor(image, frameWidth, frameHeight) {
        this.image = image;
        this.frameWidth = frameWidth;
        this.frameHeight = frameHeight;
        this.currentFrame = 0;
        this.frameCount = Math.floor(image.width / frameWidth);
        this.animationSpeed = 0.2;
        this.animationTimer = 0;
        this.loop = true;
        this.playing = true;
    }

    update(deltaTime = 1) {
        if (!this.playing) return;

        this.animationTimer += this.animationSpeed * deltaTime;
        
        if (this.animationTimer >= 1) {
            this.animationTimer = 0;
            this.currentFrame++;
            
            if (this.currentFrame >= this.frameCount) {
                if (this.loop) {
                    this.currentFrame = 0;
                } else {
                    this.currentFrame = this.frameCount - 1;
                    this.playing = false;
                }
            }
        }
    }

    draw(ctx, x, y, scale = 1) {
        const sx = this.currentFrame * this.frameWidth;
        const sy = 0;
        
        ctx.imageSmoothingEnabled = false; // ピクセルアートをシャープに表示
        ctx.drawImage(
            this.image,
            sx, sy, this.frameWidth, this.frameHeight,
            x, y, this.frameWidth * scale, this.frameHeight * scale
        );
    }

    reset() {
        this.currentFrame = 0;
        this.animationTimer = 0;
        this.playing = true;
    }
}
```

### 3. Player クラスの更新例
```javascript
// js/Player.js の更新
import GameObject from './GameObject.js';
import SpriteRenderer from './SpriteRenderer.js';

class Player extends GameObject {
    constructor(x, y, assetLoader) {
        super(x, y, 32, 32);
        
        // スプライト設定
        this.sprites = {
            idle: new SpriteRenderer(assetLoader.get('player_idle'), 32, 32),
            move: new SpriteRenderer(assetLoader.get('player_move'), 32, 32),
            damaged: new SpriteRenderer(assetLoader.get('player_damaged'), 32, 32)
        };
        
        this.currentSprite = this.sprites.idle;
        this.state = 'idle';
        
        // 既存のプロパティ
        this.speed = 5;
        this.lives = 3;
        // ...
    }

    update() {
        super.update();
        
        // スプライトアニメーション更新
        this.currentSprite.update();
        
        // 状態に応じてスプライト切り替え
        if (this.invulnerableTime > 0) {
            this.setState('damaged');
        } else if (Math.abs(this.velocity.x) > 0 || Math.abs(this.velocity.y) > 0) {
            this.setState('move');
        } else {
            this.setState('idle');
        }
    }

    setState(newState) {
        if (this.state !== newState) {
            this.state = newState;
            this.currentSprite = this.sprites[newState];
            this.currentSprite.reset();
        }
    }

    draw(ctx) {
        if (!this.active) return;
        
        // 無敵時間中の点滅
        if (this.invulnerableTime > 0 && Math.floor(this.invulnerableTime / 5) % 2 === 0) {
            ctx.globalAlpha = 0.5;
        }
        
        // スプライト描画
        this.currentSprite.draw(ctx, this.x, this.y);
        
        ctx.globalAlpha = 1.0;
    }
}
```

### 4. ゲーム初期化の更新
```javascript
// js/GameManager.js の更新
import AssetLoader from './AssetLoader.js';

class GameManager {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.assetLoader = new AssetLoader();
        this.assetsLoaded = false;
        
        // ピクセルパーフェクト設定
        this.ctx.imageSmoothingEnabled = false;
        
        this.setupAssetLoader();
    }

    setupAssetLoader() {
        // アセットをキューに追加
        this.assetLoader.addToQueue('player_idle', 'assets/sprites/player/player_idle.png');
        this.assetLoader.addToQueue('player_move', 'assets/sprites/player/player_move.png');
        this.assetLoader.addToQueue('enemy_crosser', 'assets/sprites/enemies/crosser.png');
        this.assetLoader.addToQueue('enemy_chaser', 'assets/sprites/enemies/chaser.png');
        this.assetLoader.addToQueue('enemy_shooter', 'assets/sprites/enemies/shooter.png');
        this.assetLoader.addToQueue('boss1', 'assets/sprites/bosses/boss1_idle.png');
        // ... 他のアセット

        // プログレスバー表示
        this.assetLoader.onProgress = (loaded, total) => {
            this.drawLoadingScreen(loaded / total);
        };

        // ロード完了後
        this.assetLoader.onComplete = () => {
            this.assetsLoaded = true;
            this.setupTitleScreen();
            this.gameLoop();
        };
    }

    drawLoadingScreen(progress) {
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
        
        // プログレスバー
        const barWidth = 300;
        const barHeight = 20;
        const x = (this.canvasWidth - barWidth) / 2;
        const y = this.canvasHeight / 2;
        
        this.ctx.strokeStyle = '#fff';
        this.ctx.strokeRect(x, y, barWidth, barHeight);
        
        this.ctx.fillStyle = '#3498db';
        this.ctx.fillRect(x, y, barWidth * progress, barHeight);
        
        this.ctx.fillStyle = '#fff';
        this.ctx.font = '20px monospace';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(`Loading... ${Math.floor(progress * 100)}%`, 
                         this.canvasWidth / 2, y - 20);
    }

    async start() {
        await this.assetLoader.loadAll();
    }
}
```

## ドット絵作成ツール

### 無料ツール
1. **Piskel** (https://www.piskelapp.com/)
   - ブラウザ版あり
   - アニメーション作成機能
   - スプライトシート出力

2. **GraphicsGale** (Windows)
   - アニメーション対応
   - レイヤー機能

3. **GIMP** (全OS対応)
   - 汎用画像エディタ
   - グリッド表示機能

### 有料ツール
1. **Aseprite** ($20)
   - プロ向け機能
   - タイムライン機能
   - 自動タイルセット生成

2. **Pyxel Edit** ($9)
   - タイルセット特化
   - タイルマップエディタ

## パフォーマンス最適化

### スプライトシート使用
```javascript
// 複数の画像を1枚にまとめる
class SpriteSheet {
    constructor(image, spriteData) {
        this.image = image;
        this.sprites = new Map();
        
        // spriteData: { key: {x, y, width, height} }
        for (const [key, rect] of Object.entries(spriteData)) {
            this.sprites.set(key, rect);
        }
    }

    draw(ctx, key, x, y, scale = 1) {
        const rect = this.sprites.get(key);
        if (!rect) return;
        
        ctx.drawImage(
            this.image,
            rect.x, rect.y, rect.width, rect.height,
            x, y, rect.width * scale, rect.height * scale
        );
    }
}
```

### キャンバスキャッシング
```javascript
// 頻繁に使う描画をキャッシュ
class CachedSprite {
    constructor(image, width, height) {
        this.cache = document.createElement('canvas');
        this.cache.width = width;
        this.cache.height = height;
        const ctx = this.cache.getContext('2d');
        ctx.drawImage(image, 0, 0, width, height);
    }

    draw(ctx, x, y) {
        ctx.drawImage(this.cache, x, y);
    }
}
```

## 実装ステップ

### Phase 1: 基盤準備
1. AssetLoaderクラスの実装
2. SpriteRendererクラスの実装
3. ローディング画面の実装

### Phase 2: プレイヤー実装
1. プレイヤーのドット絵作成（32x32）
2. Playerクラスの更新
3. アニメーション実装

### Phase 3: 敵キャラクター実装
1. 各敵タイプのドット絵作成
2. Enemyクラスの更新
3. 敵弾のスプライト化

### Phase 4: ボス実装
1. 各ステージボスのドット絵作成
2. Bossクラスの更新
3. ボス攻撃パターンのビジュアル強化

### Phase 5: エフェクト実装
1. 爆発アニメーション作成
2. EffectManagerの更新
3. パーティクルエフェクト追加

### Phase 6: 背景実装
1. タイルセット作成
2. 背景システムの更新
3. パララックススクロール実装

## 注意事項

1. **解像度の統一**
   - すべてのスプライトで同じピクセル密度を保つ
   - 拡大縮小時は整数倍を使用

2. **アンチエイリアス無効化**
   ```javascript
   ctx.imageSmoothingEnabled = false;
   ```

3. **カラーパレット制限**
   - 統一感のため16色程度に制限
   - ステージごとにパレット変更も可

4. **アニメーションフレーム数**
   - 通常: 2-4フレーム
   - 爆発: 6-10フレーム
   - 滑らかさとファイルサイズのバランス

5. **ファイルフォーマット**
   - PNG形式（透過対応）
   - 圧縮レベル最大

## 参考リソース

- [OpenGameArt.org](https://opengameart.org/) - フリーのゲームアセット
- [itch.io Game Assets](https://itch.io/game-assets) - 有料/無料アセット
- [Lospec Palette List](https://lospec.com/palette-list) - カラーパレット集
- [The Spriters Resource](https://www.spriters-resource.com/) - スプライト参考

## トラブルシューティング

### 画像がぼやける
```javascript
// キャンバス全体に適用
ctx.imageSmoothingEnabled = false;
// CSSでも設定
canvas {
    image-rendering: pixelated;
    image-rendering: crisp-edges;
}
```

### 画像が表示されない
- パスが正しいか確認
- CORS設定を確認（ローカルサーバー使用推奨）
- 画像のロード完了を待つ

### アニメーションがカクつく
- requestAnimationFrameを使用
- フレームレート固定（60fps）
- 不要な再描画を避ける