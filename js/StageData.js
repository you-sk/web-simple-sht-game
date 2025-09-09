/**
 * ステージデータ
 */

const canvasWidth = 480;
const canvasHeight = 720;

// タイルカラー定義
export const tileColors = [
    // ステージ1: 森林
    {
        base: '#6ab04c',
        forest: '#3d5c3a',
        river: '#4FC3F7',
        mountain: '#795548',
        road: '#BDBDBD'
    },
    // ステージ2: 砂漠
    {
        base: '#f0e68c',
        pyramid: '#d2b48c',
        oasis: '#20b2aa',
        rock: '#a0522d'
    },
    // ステージ3: 宇宙
    {
        base: '#000020',
        star: '#ffffff',
        nebula: '#483d8b',
        planet: '#4682b4'
    }
];

// ステージ背景データ
export const stageData = [
    // ステージ1
    [
        {time: 60, x: 50, width: 100, height: 100, type: 'forest'},
        {time: 120, x: 300, width: 120, height: 80, type: 'forest'},
        {time: 240, x: 100, width: 80, height: 150, type: 'forest'},
        {time: 300, x: 200, width: 80, height: 200, type: 'road'},
        {time: 360, x: 200, width: 80, height: 200, type: 'road'},
        {time: 420, x: 200, width: 80, height: 200, type: 'road'},
        {time: 480, x: 200, width: 80, height: 200, type: 'road'},
        {time: 540, x: 200, width: 80, height: 200, type: 'road'},
        {time: 600, x: 0, width: canvasWidth, height: 80, type: 'river'},
        {time: 630, x: 0, width: canvasWidth, height: 80, type: 'river'},
        {time: 660, x: 0, width: canvasWidth, height: 80, type: 'river'},
        {time: 690, x: 0, width: canvasWidth, height: 80, type: 'river'},
        {time: 900, x: 30, width: 150, height: 120, type: 'mountain'},
        {time: 980, x: 250, width: 200, height: 180, type: 'mountain'},
        {time: 1200, x: 10, width: 100, height: 100, type: 'forest'},
        {time: 1300, x: 40, width: 180, height: 150, type: 'mountain'},
        {time: 1450, x: 350, width: 100, height: 100, type: 'forest'},
        {time: 1500, x: 0, width: 150, height: 150, type: 'forest'},
        {time: 1550, x: 330, width: 150, height: 150, type: 'forest'},
        {time: 1650, x: 100, width: 280, height: 80, type: 'road'},
        {time: 1750, x: 180, width: 120, height: 120, type: 'mountain'}
    ],
    // ステージ2
    [
        {time: 60, x: 100, width: 120, height: 100, type: 'pyramid', shape: 'pyramid'},
        {time: 150, x: 300, width: 80, height: 80, type: 'rock'},
        {time: 300, x: 50, width: 200, height: 60, type: 'oasis'},
        {time: 400, x: 350, width: 100, height: 100, type: 'pyramid', shape: 'pyramid'},
        {time: 500, x: 150, width: 60, height: 60, type: 'rock'},
        {time: 700, x: 250, width: 150, height: 120, type: 'pyramid', shape: 'pyramid'},
        {time: 800, x: 80, width: 40, height: 40, type: 'rock'},
        {time: 900, x: 380, width: 50, height: 50, type: 'rock'},
        {time: 1000, x: 200, width: 120, height: 80, type: 'oasis'},
        {time: 1200, x: 50, width: 100, height: 80, type: 'pyramid', shape: 'pyramid'},
        {time: 1300, x: 400, width: 60, height: 100, type: 'rock'},
        {time: 1500, x: 150, width: 180, height: 150, type: 'pyramid', shape: 'pyramid'}
    ],
    // ステージ3
    [
        {time: 10, x: 10, width: 2, height: 2, type: 'star', shape: 'star'},
        {time: 20, x: 400, width: 1, height: 1, type: 'star', shape: 'star'},
        {time: 30, x: 200, width: 3, height: 3, type: 'star', shape: 'star'},
        {time: 100, x: 0, width: 150, height: 400, type: 'nebula'},
        {time: 150, x: 100, width: 3, height: 3, type: 'star', shape: 'star'},
        {time: 160, x: 300, width: 1, height: 1, type: 'star', shape: 'star'},
        {time: 400, x: 300, width: 120, height: 120, type: 'planet'},
        {time: 450, x: 450, width: 2, height: 2, type: 'star', shape: 'star'},
        {time: 800, x: 240, width: 300, height: 200, type: 'nebula'},
        {time: 900, x: 50, width: 80, height: 80, type: 'planet'},
        {time: 1000, x: 20, width: 1, height: 1, type: 'star', shape: 'star'},
        {time: 1500, x: 400, width: 150, height: 150, type: 'planet'}
    ]
];

// 敵出現データ
export const enemyData = [
    // ステージ1
    [
        {time: 120, x: 80, type: 'crosser', vx: 2, vy: 2},
        {time: 150, x: canvasWidth - 80, type: 'crosser', vx: -2, vy: 2},
        {time: 200, x: canvasWidth/2, type: 'chaser'},
        {time: 250, x: 100, type: 'chaser'},
        {time: 250, x: canvasWidth - 100, type: 'chaser'},
        {time: 350, x: canvasWidth/2, type: 'shooter', vx: 2, vy: 1},
        {time: 400, x: 40, type: 'crosser', vx: 3, vy: 3},
        {time: 400, x: canvasWidth - 40, type: 'crosser', vx: -3, vy: 3},
        {time: 450, x: canvasWidth/2, type: 'chaser'},
        {time: 500, x: 120, type: 'chaser'},
        {time: 500, x: canvasWidth - 120, type: 'chaser'},
        {time: 550, x: 60, type: 'crosser', vx: 2, vy: 2},
        {time: 550, x: canvasWidth - 60, type: 'crosser', vx: -2, vy: 2},
        {time: 600, x: 100, type: 'shooter', vx: 2, vy: 1},
        {time: 650, x: canvasWidth - 100, type: 'shooter', vx: -2, vy: 1},
        {time: 700, x: canvasWidth/2, type: 'chaser'},
        {time: 720, x: canvasWidth/2 - 40, type: 'chaser'},
        {time: 720, x: canvasWidth/2 + 40, type: 'chaser'},
        {time: 740, x: canvasWidth/2 - 80, type: 'chaser'},
        {time: 740, x: canvasWidth/2 + 80, type: 'chaser'},
        {time: 800, x: 20, type: 'crosser', vx: 4, vy: 2},
        {time: 810, x: 20, type: 'crosser', vx: 4, vy: 2},
        {time: 820, x: 20, type: 'crosser', vx: 4, vy: 2},
        {time: 830, x: 20, type: 'crosser', vx: 4, vy: 2},
        {time: 900, x: canvasWidth - 20, type: 'crosser', vx: -4, vy: 2},
        {time: 910, x: canvasWidth - 20, type: 'crosser', vx: -4, vy: 2},
        {time: 920, x: canvasWidth - 20, type: 'crosser', vx: -4, vy: 2},
        {time: 930, x: canvasWidth - 20, type: 'crosser', vx: -4, vy: 2},
        {time: 1000, x: 100, type: 'shooter', vx: 0, vy: 2},
        {time: 1000, x: canvasWidth/2, type: 'shooter', vx: 0, vy: 2},
        {time: 1000, x: canvasWidth - 100, type: 'shooter', vx: 0, vy: 2},
        {time: 1150, x: 100, type: 'chaser'},
        {time: 1150, x: canvasWidth - 100, type: 'chaser'},
        {time: 1200, x: canvasWidth/2, type: 'chaser'},
        {time: 1250, x: 40, type: 'crosser', vx: 2, vy: 3},
        {time: 1250, x: canvasWidth - 40, type: 'crosser', vx: -2, vy: 3},
        {time: 1300, x: 100, type: 'shooter', vx: 3, vy: 1},
        {time: 1300, x: canvasWidth - 100, type: 'shooter', vx: -3, vy: 1},
        {time: 1350, x: 150, type: 'chaser'},
        {time: 1350, x: canvasWidth - 150, type: 'chaser'},
        {time: 1400, x: canvasWidth/2, type: 'shooter', vx: 2, vy: 1},
        {time: 1450, x: canvasWidth/2, type: 'chaser'}
    ],
    // ステージ2
    [
        {time: 100, x: 50, type: 'chaser', vy: 2.5},
        {time: 100, x: canvasWidth - 50, type: 'chaser', vy: 2.5},
        {time: 180, x: 100, type: 'shooter', vx: 3, vy: 1.5},
        {time: 250, x: canvasWidth/2, type: 'chaser', vy: 3},
        {time: 300, x: 20, type: 'crosser', vx: 4, vy: 3},
        {time: 300, x: canvasWidth - 20, type: 'crosser', vx: -4, vy: 3},
        {time: 400, x: 100, type: 'shooter', vx: -3, vy: 1},
        {time: 400, x: canvasWidth - 100, type: 'shooter', vx: 3, vy: 1},
        {time: 500, x: canvasWidth/2 - 100, type: 'chaser', vy: 2.5},
        {time: 500, x: canvasWidth/2 + 100, type: 'chaser', vy: 2.5},
        {time: 600, x: 40, type: 'crosser', vx: 5, vy: 2},
        {time: 620, x: 40, type: 'crosser', vx: 5, vy: 2},
        {time: 640, x: 40, type: 'crosser', vx: 5, vy: 2},
        {time: 700, x: canvasWidth/2, type: 'shooter', vx: 0, vy: 2},
        {time: 750, x: canvasWidth/2 - 150, type: 'chaser', vy: 3},
        {time: 750, x: canvasWidth/2 + 150, type: 'chaser', vy: 3},
        {time: 850, x: canvasWidth - 40, type: 'crosser', vx: -5, vy: 2},
        {time: 870, x: canvasWidth - 40, type: 'crosser', vx: -5, vy: 2},
        {time: 890, x: canvasWidth - 40, type: 'crosser', vx: -5, vy: 2},
        {time: 1000, x: 100, type: 'shooter', vx: 2, vy: 2},
        {time: 1000, x: canvasWidth - 100, type: 'shooter', vx: -2, vy: 2},
        {time: 1100, x: canvasWidth/2, type: 'chaser', vy: 3.5},
        {time: 1150, x: canvasWidth/2, type: 'chaser', vy: 3.5},
        {time: 1200, x: 40, type: 'crosser', vx: 4, vy: 4},
        {time: 1200, x: canvasWidth - 40, type: 'crosser', vx: -4, vy: 4},
        {time: 1300, x: canvasWidth/2 - 100, type: 'shooter', vx: 4, vy: 1},
        {time: 1300, x: canvasWidth/2 + 100, type: 'shooter', vx: -4, vy: 1},
        {time: 1400, x: 100, type: 'chaser', vy: 3},
        {time: 1400, x: canvasWidth - 100, type: 'chaser', vy: 3}
    ],
    // ステージ3
    [
        {time: 80, x: canvasWidth/2, type: 'chaser', vy: 3.5},
        {time: 150, x: 60, type: 'shooter', vx: 3, vy: 2},
        {time: 150, x: canvasWidth - 60, type: 'shooter', vx: -3, vy: 2},
        {time: 250, x: 30, type: 'crosser', vx: 5, vy: 3},
        {time: 270, x: 30, type: 'crosser', vx: 5, vy: 3},
        {time: 350, x: canvasWidth - 30, type: 'crosser', vx: -5, vy: 3},
        {time: 370, x: canvasWidth - 30, type: 'crosser', vx: -5, vy: 3},
        {time: 450, x: 100, type: 'chaser', vy: 3},
        {time: 450, x: canvasWidth - 100, type: 'chaser', vy: 3},
        {time: 480, x: canvasWidth/2, type: 'chaser', vy: 4},
        {time: 550, x: 100, type: 'shooter', vx: -2, vy: 2},
        {time: 550, x: canvasWidth - 100, type: 'shooter', vx: 2, vy: 2},
        {time: 650, x: canvasWidth/2 - 150, type: 'chaser', vy: 3.5},
        {time: 650, x: canvasWidth/2, type: 'chaser', vy: 3.5},
        {time: 650, x: canvasWidth/2 + 150, type: 'chaser', vy: 3.5},
        {time: 750, x: 50, type: 'shooter', vx: 4, vy: 1},
        {time: 750, x: canvasWidth - 50, type: 'shooter', vx: -4, vy: 1},
        {time: 850, x: 20, type: 'crosser', vx: 6, vy: 2},
        {time: 860, x: 20, type: 'crosser', vx: 6, vy: 2},
        {time: 870, x: 20, type: 'crosser', vx: 6, vy: 2},
        {time: 880, x: 20, type: 'crosser', vx: 6, vy: 2},
        {time: 950, x: canvasWidth - 20, type: 'crosser', vx: -6, vy: 2},
        {time: 960, x: canvasWidth - 20, type: 'crosser', vx: -6, vy: 2},
        {time: 970, x: canvasWidth - 20, type: 'crosser', vx: -6, vy: 2},
        {time: 980, x: canvasWidth - 20, type: 'crosser', vx: -6, vy: 2},
        {time: 1100, x: canvasWidth/2 - 100, type: 'shooter', vx: 0, vy: 3},
        {time: 1100, x: canvasWidth/2 + 100, type: 'shooter', vx: 0, vy: 3},
        {time: 1200, x: canvasWidth/2, type: 'chaser', vy: 4.5},
        {time: 1250, x: 100, type: 'chaser', vy: 4},
        {time: 1250, x: canvasWidth - 100, type: 'chaser', vy: 4},
        {time: 1350, x: canvasWidth/2, type: 'shooter', vx: 5, vy: 2},
        {time: 1380, x: canvasWidth/2, type: 'shooter', vx: -5, vy: 2}
    ]
];