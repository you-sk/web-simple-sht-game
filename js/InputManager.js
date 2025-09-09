/**
 * 入力管理クラス
 */
class InputManager {
    constructor() {
        this.keys = {
            ArrowUp: false,
            ArrowDown: false,
            ArrowLeft: false,
            ArrowRight: false,
            ' ': false,
            Enter: false
        };
        
        this.gamepadIndex = null;
        this.cooldown = 0;
        
        // キーボードイベントの設定
        this.setupKeyboardEvents();
    }

    /**
     * キーボードイベントの設定
     */
    setupKeyboardEvents() {
        document.addEventListener('keydown', (e) => {
            if (e.key in this.keys) {
                e.preventDefault();
                this.keys[e.key] = true;
            }
        });

        document.addEventListener('keyup', (e) => {
            if (e.key in this.keys) {
                e.preventDefault();
                this.keys[e.key] = false;
            }
        });
    }

    /**
     * 入力状態を取得
     */
    getInput() {
        const input = {
            up: false,
            down: false,
            left: false,
            right: false,
            shoot: false,
            action: false
        };

        // クールダウン処理
        if (this.cooldown > 0) {
            this.cooldown--;
        }

        // キーボード入力
        input.up = this.keys.ArrowUp;
        input.down = this.keys.ArrowDown;
        input.left = this.keys.ArrowLeft;
        input.right = this.keys.ArrowRight;
        input.shoot = this.keys[' '];
        
        if (this.keys.Enter && this.cooldown <= 0) {
            input.action = true;
            this.cooldown = 30;
        }

        // ゲームパッド入力
        const gamepad = this.getGamepad();
        if (gamepad) {
            const deadZone = 0.2;
            
            // 左スティック
            if (Math.abs(gamepad.axes[0]) > deadZone) {
                if (gamepad.axes[0] < 0) input.left = true;
                if (gamepad.axes[0] > 0) input.right = true;
            }
            if (Math.abs(gamepad.axes[1]) > deadZone) {
                if (gamepad.axes[1] < 0) input.up = true;
                if (gamepad.axes[1] > 0) input.down = true;
            }

            // 十字キー
            if (gamepad.buttons[12].pressed) input.up = true;
            if (gamepad.buttons[13].pressed) input.down = true;
            if (gamepad.buttons[14].pressed) input.left = true;
            if (gamepad.buttons[15].pressed) input.right = true;

            // ボタン
            if (gamepad.buttons[0].pressed) input.shoot = true;
            
            if ((gamepad.buttons[0].pressed || gamepad.buttons[9].pressed) && this.cooldown <= 0) {
                input.action = true;
                this.cooldown = 30;
            }
        }

        return input;
    }

    /**
     * ゲームパッドを取得
     */
    getGamepad() {
        const gamepads = navigator.getGamepads();
        
        // 既知のゲームパッドを優先
        if (this.gamepadIndex !== null && gamepads[this.gamepadIndex]) {
            return gamepads[this.gamepadIndex];
        }

        // 新しいゲームパッドを探す
        for (let i = 0; i < gamepads.length; i++) {
            if (gamepads[i]) {
                this.gamepadIndex = i;
                return gamepads[i];
            }
        }

        return null;
    }

    /**
     * 入力をリセット
     */
    reset() {
        for (let key in this.keys) {
            this.keys[key] = false;
        }
        this.cooldown = 0;
    }
}

export default InputManager;