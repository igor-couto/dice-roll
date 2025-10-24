const audio = new Audio('./sounds/dice-throw.ogg');
const diceElement = document.getElementById('dice');
const buttonElement = document.querySelector("#roll-button > button");
const buttonElementText = buttonElement.textContent;

const MIN_SPIN_DURATION = 10;
const MIN_SPIN_DELAY = 700; // Lower values make the die start swapping faces faster; higher values make the initial spin slower
const MAX_SPIN_DELAY = 280; // Raising it lets the spin slow down more before settling; lowering it keeps the spin brisk all the way through.
const SPIN_DELAY_STEP = 35; // Larger steps decelerate the spin sooner; smaller steps give a more gradual slowdown.
const SETTLE_TRANSITION = 'transform 1.9s cubic-bezier(0.23, 1, 0.32, 1)';

const FACE_ROTATIONS = {
    1: { x: 0, y: 0 },
    2: { x: 0, y: 180 },
    3: { x: 0, y: 90 },
    4: { x: 270, y: 0 },
    5: { x: 90, y: 0 },
    6: { x: 0, y: 270 }
};

const getNow = () =>
    typeof performance !== 'undefined' && typeof performance.now === 'function'
        ? performance.now()
        : Date.now();

const scheduleFrame = typeof window !== 'undefined' && typeof window.requestAnimationFrame === 'function'
    ? window.requestAnimationFrame.bind(window)
    : (callback) => setTimeout(callback, 0);

let confirmedFace = 1;
let rollingTimeoutId = null;
let finalizeTimeoutId = null;
let spinStartTime = 0;
let spinDelay = MIN_SPIN_DELAY;
let currentRotation = { ...FACE_ROTATIONS[1] };

audio.volume = 0.5;
buttonElement.onclick = rollDice;
applyRotation(currentRotation);

async function rollDice() {
    buttonElement.disabled = true;
    buttonElement.textContent = 'Rolling...';

    setTimeout(() => { 
        buttonElement.textContent = buttonElementText;
        buttonElement.disabled = false;
    }, 2000);

    audio.currentTime = 0;
    audio.play();

    clearFinalizeTimeout();
    clearRollingTimer();
    diceElement.classList.remove('rolling');

    spinStartTime = getNow();
    startRollingAnimation();

    try {
        const response = await fetch('roll');
        if (!response.ok)
            throw new Error('Network response was not ok');
        
        const resultText = await response.text();
        const rolledFace = parseInt(resultText, 10);

        if (!Number.isInteger(rolledFace) || rolledFace < 1 || rolledFace > 6) {
            throw new Error('Invalid dice value received');
        }

        const elapsed = getNow() - spinStartTime;
        const remaining = Math.max(MIN_SPIN_DURATION - elapsed, 0);

        finalizeTimeoutId = setTimeout(() => {
            finalizeTimeoutId = null;
            finishRollingAnimation(rolledFace);
        }, remaining);
    } catch (error) {
        console.error('Error fetching dice roll result:', error);
        clearFinalizeTimeout();
        clearRollingTimer();
        diceElement.classList.remove('rolling');
        stopRollingAnimation(confirmedFace);
        buttonElement.textContent = buttonElementText;
        buttonElement.disabled = false;
    }
}

function startRollingAnimation() {
    diceElement.classList.add('rolling');
    clearRollingTimer();
    spinDelay = MIN_SPIN_DELAY;
    setTransition(getSpinTransition(spinDelay));
    queueSpinTick();
    scheduleNextSpinTick();
}

function finishRollingAnimation(resultFace) {
    clearRollingTimer();
    diceElement.classList.remove('rolling');
    setTransition(SETTLE_TRANSITION);

    const extraSpins = 1 + Math.floor(Math.random() * 2);

    scheduleFrame(() => {
        const targetRotation = computeTargetRotation(resultFace, extraSpins);
        applyRotation(targetRotation);
        currentRotation = targetRotation;
        confirmedFace = resultFace;
    });
}

function scheduleNextSpinTick() {
    rollingTimeoutId = setTimeout(() => {
        queueSpinTick();
        spinDelay = Math.min(spinDelay + SPIN_DELAY_STEP, MAX_SPIN_DELAY);
        setTransition(getSpinTransition(spinDelay));
        scheduleNextSpinTick();
    }, spinDelay);
}

function clearRollingTimer() {
    if (rollingTimeoutId !== null) {
        clearTimeout(rollingTimeoutId);
        rollingTimeoutId = null;
    }
}

function clearFinalizeTimeout() {
    if (finalizeTimeoutId !== null) {
        clearTimeout(finalizeTimeoutId);
        finalizeTimeoutId = null;
    }
}

function queueSpinTick() {
    const axis = Math.random() < 0.5 ? 'x' : 'y';
    const baseStep = 90;
    const multiplier = Math.random() < 0.6 ? 1 : 2;
    const increment = baseStep * multiplier;
    const updatedRotation = { ...currentRotation, [axis]: currentRotation[axis] + increment };
    applyRotation(updatedRotation);
    currentRotation = updatedRotation;
}

function stopRollingAnimation(faceToShow) {
    clearRollingTimer();
    setTransition(SETTLE_TRANSITION);
    scheduleFrame(() => {
        const targetRotation = computeTargetRotation(faceToShow, 0);
        applyRotation(targetRotation);
        currentRotation = targetRotation;
    });
}

function computeTargetRotation(face, extraSpins) {
    const normalizedFace = Number(face);
    if (!Number.isInteger(normalizedFace) || normalizedFace < 1 || normalizedFace > 6) {
        return currentRotation;
    }

    const base = FACE_ROTATIONS[normalizedFace];
    const spins = Math.max(0, extraSpins);

    const minX = currentRotation.x + spins * 360;
    const minY = currentRotation.y + spins * 360;

    const target = {
        x: projectRotation(base.x, minX),
        y: projectRotation(base.y, minY)
    };

    return target;
}

function projectRotation(baseAngle, minimum) {
    let angle = baseAngle;
    while (angle < minimum) {
        angle += 360;
    }
    return angle;
}

function getSpinTransition(delayMs) {
    const clamped = Math.max(delayMs, 60);
    return `transform ${clamped / 1000}s linear`;
}

function applyRotation({ x, y }) {
    diceElement.style.transform = `rotateX(${x}deg) rotateY(${y}deg)`;
}

function setTransition(value) {
    diceElement.style.transition = value;
}
