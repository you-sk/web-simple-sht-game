export class TouchControls {
    constructor(canvas, inputManager) {
        this.canvas = canvas;
        this.inputManager = inputManager;
        this.touches = new Map();
        this.joystick = null;
        this.fireButton = null;
        this.bombButton = null;
        this.controlsVisible = false;
        this.virtualInput = {
            left: false,
            right: false,
            up: false,
            down: false,
            fire: false,
            bomb: false
        };
        
        this.init();
    }
    
    init() {
        if (!this.isTouchDevice()) return;
        
        this.createControlElements();
        this.setupEventListeners();
        this.controlsVisible = true;
    }
    
    isTouchDevice() {
        return ('ontouchstart' in window) || 
               (navigator.maxTouchPoints > 0) || 
               (navigator.msMaxTouchPoints > 0);
    }
    
    createControlElements() {
        const controlsContainer = document.createElement('div');
        controlsContainer.id = 'touch-controls';
        controlsContainer.style.cssText = `
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            height: 200px;
            pointer-events: none;
            z-index: 1000;
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
            padding: 20px;
        `;
        
        this.createJoystick(controlsContainer);
        this.createButtons(controlsContainer);
        
        document.body.appendChild(controlsContainer);
    }
    
    createJoystick(container) {
        const joystickContainer = document.createElement('div');
        joystickContainer.style.cssText = `
            position: relative;
            width: 150px;
            height: 150px;
            pointer-events: auto;
        `;
        
        const joystickBase = document.createElement('div');
        joystickBase.style.cssText = `
            position: absolute;
            width: 150px;
            height: 150px;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.1);
            border: 2px solid rgba(255, 255, 255, 0.3);
        `;
        
        const joystickKnob = document.createElement('div');
        joystickKnob.style.cssText = `
            position: absolute;
            width: 60px;
            height: 60px;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.3);
            border: 2px solid rgba(255, 255, 255, 0.5);
            left: 50%;
            top: 50%;
            transform: translate(-50%, -50%);
            transition: none;
        `;
        
        joystickContainer.appendChild(joystickBase);
        joystickContainer.appendChild(joystickKnob);
        container.appendChild(joystickContainer);
        
        this.joystick = {
            container: joystickContainer,
            base: joystickBase,
            knob: joystickKnob,
            baseRadius: 75,
            knobRadius: 30,
            centerX: 75,
            centerY: 75,
            active: false
        };
    }
    
    createButtons(container) {
        const buttonsContainer = document.createElement('div');
        buttonsContainer.style.cssText = `
            display: flex;
            flex-direction: column;
            gap: 10px;
            pointer-events: auto;
        `;
        
        this.fireButton = this.createButton('FIRE', 80, 'rgba(255, 100, 100, 0.3)');
        this.bombButton = this.createButton('BOMB', 60, 'rgba(255, 255, 100, 0.3)');
        
        buttonsContainer.appendChild(this.fireButton);
        buttonsContainer.appendChild(this.bombButton);
        container.appendChild(buttonsContainer);
    }
    
    createButton(text, size, color) {
        const button = document.createElement('div');
        button.style.cssText = `
            width: ${size}px;
            height: ${size}px;
            border-radius: 50%;
            background: ${color};
            border: 2px solid rgba(255, 255, 255, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 14px;
            font-weight: bold;
            user-select: none;
            -webkit-user-select: none;
        `;
        button.textContent = text;
        return button;
    }
    
    setupEventListeners() {
        this.joystick.container.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.handleJoystickStart(e.touches[0]);
        });
        
        this.joystick.container.addEventListener('touchmove', (e) => {
            e.preventDefault();
            if (this.joystick.active) {
                this.handleJoystickMove(e.touches[0]);
            }
        });
        
        this.joystick.container.addEventListener('touchend', (e) => {
            e.preventDefault();
            this.handleJoystickEnd();
        });
        
        this.fireButton.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.virtualInput.fire = true;
            this.fireButton.style.transform = 'scale(0.9)';
        });
        
        this.fireButton.addEventListener('touchend', (e) => {
            e.preventDefault();
            this.virtualInput.fire = false;
            this.fireButton.style.transform = 'scale(1)';
        });
        
        this.bombButton.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.virtualInput.bomb = true;
            this.bombButton.style.transform = 'scale(0.9)';
        });
        
        this.bombButton.addEventListener('touchend', (e) => {
            e.preventDefault();
            this.virtualInput.bomb = false;
            this.bombButton.style.transform = 'scale(1)';
        });
        
        document.addEventListener('touchmove', (e) => {
            if (e.target.closest('#touch-controls')) {
                e.preventDefault();
            }
        }, { passive: false });
    }
    
    handleJoystickStart(touch) {
        this.joystick.active = true;
        const rect = this.joystick.container.getBoundingClientRect();
        this.joystick.startX = touch.clientX - rect.left;
        this.joystick.startY = touch.clientY - rect.top;
    }
    
    handleJoystickMove(touch) {
        const rect = this.joystick.container.getBoundingClientRect();
        const x = touch.clientX - rect.left;
        const y = touch.clientY - rect.top;
        
        const deltaX = x - this.joystick.centerX;
        const deltaY = y - this.joystick.centerY;
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        
        let knobX = deltaX;
        let knobY = deltaY;
        
        if (distance > this.joystick.baseRadius - this.joystick.knobRadius) {
            const angle = Math.atan2(deltaY, deltaX);
            const maxDistance = this.joystick.baseRadius - this.joystick.knobRadius;
            knobX = Math.cos(angle) * maxDistance;
            knobY = Math.sin(angle) * maxDistance;
        }
        
        this.joystick.knob.style.left = `${this.joystick.centerX + knobX}px`;
        this.joystick.knob.style.top = `${this.joystick.centerY + knobY}px`;
        this.joystick.knob.style.transform = 'translate(-50%, -50%)';
        
        const normalizedX = knobX / (this.joystick.baseRadius - this.joystick.knobRadius);
        const normalizedY = knobY / (this.joystick.baseRadius - this.joystick.knobRadius);
        
        this.virtualInput.left = normalizedX < -0.3;
        this.virtualInput.right = normalizedX > 0.3;
        this.virtualInput.up = normalizedY < -0.3;
        this.virtualInput.down = normalizedY > 0.3;
    }
    
    handleJoystickEnd() {
        this.joystick.active = false;
        this.joystick.knob.style.left = '50%';
        this.joystick.knob.style.top = '50%';
        this.joystick.knob.style.transform = 'translate(-50%, -50%)';
        
        this.virtualInput.left = false;
        this.virtualInput.right = false;
        this.virtualInput.up = false;
        this.virtualInput.down = false;
    }
    
    update() {
        if (!this.controlsVisible) return;
        
        if (this.virtualInput.left) this.inputManager.keys['ArrowLeft'] = true;
        if (this.virtualInput.right) this.inputManager.keys['ArrowRight'] = true;
        if (this.virtualInput.up) this.inputManager.keys['ArrowUp'] = true;
        if (this.virtualInput.down) this.inputManager.keys['ArrowDown'] = true;
        if (this.virtualInput.fire) this.inputManager.keys[' '] = true;
        if (this.virtualInput.bomb) this.inputManager.keys['b'] = true;
    }
    
    show() {
        const controls = document.getElementById('touch-controls');
        if (controls) {
            controls.style.display = 'flex';
            this.controlsVisible = true;
        }
    }
    
    hide() {
        const controls = document.getElementById('touch-controls');
        if (controls) {
            controls.style.display = 'none';
            this.controlsVisible = false;
        }
    }
}