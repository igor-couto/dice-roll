const audio = new Audio('./sounds/dice-throw.ogg');
const diceElement = document.getElementById('dice');
const buttonElement = document.querySelector("#roll-button > button");
const buttonElementText = buttonElement.textContent;

const MIN_SPIN_DURATION = 1000;
const ROLL_TICK_INTERVAL = 150;

const getNow = () =>
    typeof performance !== 'undefined' && typeof performance.now === 'function'
        ? performance.now()
        : Date.now();

const scheduleFrame = typeof window !== 'undefined' && typeof window.requestAnimationFrame === 'function'
    ? window.requestAnimationFrame.bind(window)
    : (callback) => setTimeout(callback, 0);

let currentFace = 1;
let confirmedFace = 1;
let rollingIntervalId = null;
let finalizeTimeoutId = null;
let spinStartTime = 0;

audio.volume = 0.5;
buttonElement.onclick = rollDice;

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
    clearRollingInterval();
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
        clearRollingInterval();
        diceElement.classList.remove('rolling');
        scheduleFrame(() => setDiceFace(confirmedFace));
        buttonElement.textContent = buttonElementText;
        buttonElement.disabled = false;
    }
}

function startRollingAnimation() {
    diceElement.classList.add('rolling');
    setDiceFace(getRandomFaceExcluding(currentFace));

    rollingIntervalId = setInterval(() => {
        setDiceFace(getRandomFaceExcluding(currentFace));
    }, ROLL_TICK_INTERVAL);
}

function finishRollingAnimation(resultFace) {
    clearRollingInterval();
    diceElement.classList.remove('rolling');

    scheduleFrame(() => {
        setDiceFace(resultFace);
        confirmedFace = resultFace;
    });
}

function clearRollingInterval() {
    if (rollingIntervalId !== null) {
        clearInterval(rollingIntervalId);
        rollingIntervalId = null;
    }
}

function clearFinalizeTimeout() {
    if (finalizeTimeoutId !== null) {
        clearTimeout(finalizeTimeoutId);
        finalizeTimeoutId = null;
    }
}

function getRandomFaceExcluding(exclude) {
    const nextFace = Math.floor(Math.random() * 6) + 1;
    if (nextFace === exclude) {
        return (nextFace % 6) + 1;
    }
    return nextFace;
}

function setDiceFace(face) {
    const normalizedFace = Number(face);
    if (!Number.isInteger(normalizedFace) || normalizedFace < 1 || normalizedFace > 6) {
        return;
    }

    for (let i = 1; i <= 6; i++) {
        diceElement.classList.remove('show-' + i);
    }

    void diceElement.offsetWidth;
    diceElement.classList.add('show-' + normalizedFace);
    currentFace = normalizedFace;
}
