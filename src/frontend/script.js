const audio = new Audio('./sounds/dice-throw.ogg');
const diceElement = document.getElementById('dice');
const buttonElement = document.querySelector("#roll-button > button");
const buttonElementText = buttonElement.textContent;
let diceRollResult = 1;

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

    try {
        const response = await fetch('roll');
        if (!response.ok)
            throw new Error('Network response was not ok');
        
        diceRollResult = await response.text();
        
        for (let i = 1; i <= 6; i++) {
            diceElement.classList.remove('show-' + i);
        }
        void diceElement.offsetWidth;
        diceElement.classList.add('show-' + diceRollResult);
    } catch (error) {
        console.error('Error fetching dice roll result:', error);
        buttonElement.textContent = buttonElementText;
        buttonElement.disabled = false;
    }
}
