
// memerygame.js
import { db } from "./firebase.js";
import { collection, addDoc, getDocs, query, orderBy, limit } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-firestore.js";
import { getAuth, signInAnonymously } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-auth.js";

const auth = getAuth();

function initializeGame() {
  const game = document.getElementById("game");
  const scoreDisplay = document.getElementById("score");
  const timerDisplay = document.getElementById("timer");
  const leaderboardBody = document.getElementById("leaderboard-body");
  const winMessage = document.getElementById("win-message");
  const finalScore = document.getElementById("final-score");
  const playerNameInput = document.getElementById("player-name");
  const playAgainBtn = document.getElementById("play-again");

  let score = 0;
  let time = 0;
  let flippedCards = [];
  let lockBoard = false;
  let timerInterval;
  let matchedCount = 0;

  const frontImage = "images/halloween.gif";
  
  const allImageUrls = [
    "images/1.gif",
    "images/2.gif",
    "images/24k.gif",
    "images/ambassador.gif",
    "images/btc.gif",
    "images/darth.gif",
    "images/deadpool.gif",
    "images/fallout.gif",
    "images/homer.gif",
    "images/hunter.gif",
    "images/lambo.gif",
    "images/loadedlion.gif",
    "images/mario.gif",
    "images/merinem.gif",
    "images/mrT.gif",
    "images/pepe.gif",
    "images/poppin.gif",
    "images/potter.gif",
    "images/superman.gif",
    "images/sonic.gif",
    "images/trump.gif"
  ];
  
  let imageUrls = [];

  function chooseRandomImages() {
    const shuffled = allImageUrls.sort(() => 0.5 - Math.random());
    imageUrls = shuffled.slice(0, 8);
  }


  function startGame() {
    chooseRandomImages();
    score = 0;
    time = 0;
    matchedCount = 0;
    scoreDisplay.textContent = score;
    timerDisplay.textContent = time;
    game.innerHTML = "";
    flippedCards = [];
    lockBoard = false;

    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
      time++;
      document.getElementById("timer").textContent = time;
    }, 1000);

    const cards = [...imageUrls, ...imageUrls].sort(() => 0.7 - Math.random());

    cards.forEach(url => {
      const card = document.createElement("div");
      card.classList.add("card");
      card.dataset.image = url;

      const front = document.createElement("div");
      front.classList.add("front");
      const frontImg = document.createElement("img");
      frontImg.src = frontImage;
      front.appendChild(frontImg);

      const back = document.createElement("div");
      back.classList.add("back");
      const backImg = document.createElement("img");
      backImg.src = url;
      back.appendChild(backImg);

      card.appendChild(front);
      card.appendChild(back);
      card.addEventListener("click", () => flipCard(card));
      game.appendChild(card);
    });
  }

  function flipCard(card) {
    if (lockBoard || card.classList.contains("flipped")) return;
    card.classList.add("flipped");
    playFlipSound(https://www.epidemicsound.com/sound-effects/tracks/71ec634b-df48-43f6-a80f-ebf2f5fa6d27/);
    flippedCards.push(card);

    if (flippedCards.length === 2) {
      lockBoard = true;
      setTimeout(checkMatch, 500);
    }
  }

  function checkMatch() {
    const [first, second] = flippedCards;
    if (first.dataset.image === second.dataset.image) {
      matchedCount++;
      score += 5;
      document.getElementById("score").textContent = score;
      if (matchedCount === imageUrls.length) {
        showWinMessage();
      }
    } else {
      score -= 1;
      document.getElementById("score").textContent = score;
      first.classList.remove("flipped");
      second.classList.remove("flipped");
    }
    flippedCards = [];
    lockBoard = false;
  }

  function showWinMessage() {
    clearInterval(timerInterval);
    finalScore.textContent = `Score: ${score}, Time: ${time}s`;
    winMessage.classList.add("show");
  }

  playAgainBtn.addEventListener("click", () => {
    const name = playerNameInput.value.trim();
    if (name) {
        saveScore(name, score, time);
        winMessage.classList.remove("show");
        // Reset for next game
        playerNameInput.value = "";
        playerNameInput.disabled = false;
        startGame();
    } else {
        alert("Please enter your name to save your score!");
    }
  });

  async function saveScore(player, scoreVal, timeVal) {
    try {
      const user = auth.currentUser;
      if (user) {
        await addDoc(collection(db, "memeryLeaderboard"), {
            player,
            score: Number(scoreVal),
            time: Number(timeVal),
            date: new Date(),
            userId: user.uid
        });
        loadLeaderboard();
      }
    } catch (e) {
      console.error("Error saving score:", e);
      alert("Could not save score — check console.");
    }
  }

  async function loadLeaderboard() {
    const q = query(collection(db, "memeryLeaderboard"), orderBy("score", "desc"), orderBy("time", "asc"), limit(10));
    const querySnapshot = await getDocs(q);
    leaderboardBody.innerHTML = "";
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      const row = `<tr>
        <td>${data.player}</td>
        <td>${data.score}</td>
        <td>${data.time}</td>
      </tr>`;
      leaderboardBody.innerHTML += row;
    });
  }

  startGame();
  loadLeaderboard();
}

// Wait for the DOM to be fully loaded before doing anything
document.addEventListener("DOMContentLoaded", () => {
  signInAnonymously(auth)
    .then(() => {
      // User is signed in, and the DOM is ready. Now we can start the game.
      initializeGame();
    })
    .catch((error) => {
      console.error("Anonymous sign-in failed:", error);
      // Even if sign-in fails, we can still try to start the game,
      // but score saving will not work.
      initializeGame();
    });
});
