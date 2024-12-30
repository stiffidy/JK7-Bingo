document.addEventListener('DOMContentLoaded', () => {
    const bingoCard = document.getElementById('bingo-card');
    const seedDisplay = document.getElementById('seed-display');
    const timerDisplay = document.getElementById('timer');
    const popup = document.getElementById('popup');
    const overlay = document.getElementById('overlay');
    const generateButton = document.getElementById('generate-button');
    const clickSound = document.getElementById('click-sound');
    const timeSpentDisplay = document.getElementById('time-spent');

    let elapsedSeconds = 0;
    let timerInterval;
    let timerStarted = false;
    let gameWon = false;

    async function fetchBingoItems() {
        const response = await fetch('bingo_items.json');
        return await response.json();
    }

    function generateSeed() {
        return Math.random().toString(36).substring(2, 10);
    }

    function resetTimer() {
        clearInterval(timerInterval);
        elapsedSeconds = 0;
        timerStarted = false;
        timerDisplay.textContent = 'Time: Click any card to start the timer!';
    }

    function startTimer() {
        if (timerStarted) return;
        timerStarted = true;
        timerInterval = setInterval(() => {
            elapsedSeconds++;
            timerDisplay.textContent = `Time: ${formatTime(elapsedSeconds)}`;
        }, 1000);
    }

    function formatTime(seconds) {
        const hrs = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;

        let formattedTime = '';
        if (hrs > 0) {
            formattedTime += `${hrs}h `;
        }
        if (mins > 0 || hrs > 0) {
            formattedTime += `${mins}m `;
        }
        formattedTime += `${secs}s`;

        return formattedTime;
    }

    function seededRandom(seed) {
        const x = Math.sin(seed++) * 10000;
        return x - Math.floor(x);
    }

    function shuffleArray(array, seed) {
        let currentIndex = array.length, temporaryValue, randomIndex;

        while (0 !== currentIndex) {
            randomIndex = Math.floor(seededRandom(seed) * currentIndex);
            currentIndex -= 1;

            temporaryValue = array[currentIndex];
            array[currentIndex] = array[randomIndex];
            array[randomIndex] = temporaryValue;

            
            seed++;
        }

        return array;
    }

    async function generateCard() {
        const bingoItems = await fetchBingoItems();
        const seed = generateSeed();
        seedDisplay.textContent = seed;
        bingoCard.innerHTML = '';
        resetTimer();
        gameWon = false;

        
        const shuffledItems = shuffleArray(bingoItems.slice(), parseInt(seed, 36));

        
        for (let i = 0; i < 25; i++) {
            const cell = document.createElement('div');
            cell.classList.add('bingo-cell');
            if (i === 12) {
                cell.classList.add('free');
                cell.innerHTML = '<span class="overlay-text">FREE</span>';
            } else {
                cell.textContent = shuffledItems[i % shuffledItems.length];
                cell.addEventListener('click', () => {
                    if (gameWon) return;
                    cell.classList.toggle('marked');
                    startTimer();
                    clickSound.play();
                    checkWin();
                });
            }
            bingoCard.appendChild(cell);
        }
    }

    function checkWin() {
        const cells = Array.from(bingoCard.children);
        const isMarked = (index) => cells[index].classList.contains('marked') || cells[index].classList.contains('free');

        for (let i = 0; i < 5; i++) {
            if ([0, 1, 2, 3, 4].map(j => i * 5 + j).every(isMarked)) return showPopup();
            if ([0, 1, 2, 3, 4].map(j => i + j * 5).every(isMarked)) return showPopup();
        }

        if ([0, 6, 12, 18, 24].every(isMarked) || [4, 8, 12, 16, 20].every(isMarked)) {
            showPopup();
        }
    }

    function disableScrolling() {
        document.body.style.overflow = 'hidden';
    }

    function enableScrolling() {
        document.body.style.overflow = 'auto';
    }

    function showPopup() {
        gameWon = true;
        clearInterval(timerInterval);
        timeSpentDisplay.textContent = `Time: ${formatTime(elapsedSeconds)}`;
        popup.style.display = 'block';
        overlay.style.display = 'block';
        disableScrolling();
    }

    function closePopup() {
        popup.style.display = 'none';
        overlay.style.display = 'none';
        enableScrolling();
    }

    generateButton.addEventListener('click', generateCard);
    document.querySelector('button[onclick="closePopup()"]').addEventListener('click', closePopup);

    
    generateCard();
});