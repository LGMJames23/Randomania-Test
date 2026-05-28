
document.addEventListener("DOMContentLoaded", function() {
    const API_BASE_URL = window.RANDOMANIA_API_BASE_URL || "http://localhost:5000";
    const SESSION_STORAGE_KEY = "randomaniaSessionId";

    const screens = {
      home: document.getElementById("homeScreen"),
      account: document.getElementById("accountScreen"),
      games: document.getElementById("gamesScreen"),
      credits: document.getElementById("creditsScreen"),
      trivia: document.getElementById("triviaScreen"),
      sports: document.getElementById("sportsScreen"),
      screen: document.getElementById("screenScreen"),
      quote: document.getElementById("quoteScreen"),
      number: document.getElementById("numberScreen"),
      dice: document.getElementById("diceScreen"),
      username: document.getElementById("usernameScreen"),
      coinflip: document.getElementById("coinflipScreen"),
      suggestions: document.getElementById("suggestionsScreen"),
      cards: document.getElementById("cardsScreen")
    };
    console.debug("[Debug] Screens initialized:", screens);

    const PIG_GOAL = 100;
    const PIG_DURATION_MS = 60 * 1000;
    const SUGGESTION_EMAIL_TO = "143994@mtsd.org";
    const SUGGESTION_EMAIL_CC = "thaguy10113519@outlook.com";
    const pigPanel = document.getElementById("pigPanel");
    const pigTimerLabel = document.getElementById("pigTimerLabel");
    const pigTotalLabel = document.getElementById("pigTotalLabel");
    const pigTurnLabel = document.getElementById("pigTurnLabel");
    const pigStatusLabel = document.getElementById("pigStatusLabel");
    const pigRollBtn = document.getElementById("pigRollBtn");
    const pigHoldBtn = document.getElementById("pigHoldBtn");
    const pigProgress = document.getElementById("pigProgress");
    const pigBtn = document.getElementById("pigBtn");
    const pigTimeStat = document.querySelector(".pig-stat--time");
    const pigTurnsLabel = document.getElementById("pigTurnsLabel");
    const pigTurnLimitToggle = document.getElementById("pigTurnLimitToggle");
    const pigTurnLimitInput = document.getElementById("pigTurnLimitInput");
    let pigPlaying = false;
    let pigTimerId = null;
    let pigEndsAt = 0;
    let pigBanked = 0;
    let pigTurn = 0;
    let pigDisplayMsLeft = PIG_DURATION_MS;
    let pigTurnsUsed = 0;
    let pigMaxTurns = null;

    const triviaData = [
    ];
    let remainingTriviaIndices = [];

    const sportsData = [

    ];

    const iconSymbols = ["★", "♥", "●", "◆", "✦", "✪", "⬢", "⬡", "✿", "✺"];
    const fallbackSportImage =
      "https://upload.wikimedia.org/wikipedia/commons/3/3f/Placeholder_view_vector.svg";
    const fallbackTriviaImage =
      "https://upload.wikimedia.org/wikipedia/commons/6/65/No-Image-Placeholder.svg";
    const randomGameLinks = [
      "http://www.dougmcinnes.com/html-5-asteroids",
      "https://cykod.github.io/AlienInvasion/",
      "https://duckhuntjs.com/",
      "https://cyberzhg.github.io/2048/",
      "https://gdc.momentolabs.io/",
      "https://git-hub-games.github.io/play/football-masters",
      "https://learn-duck.firebaseapp.com/class/american-touchdown",
      "https://commongroundpuzzle.com/",
      "https://mohdriyaan.github.io/snake-game/",
      "https://dhruv35m.github.io/hole-and-mole-game/",
      "https://landgreen.github.io/n-gon/",
      "https://scratch.mit.edu/projects/157221/",
      "https://scratch.mit.edu/projects/389735464/"
    ];
    let selectedGameUrl = "";

    function rand(min, max) {
      const value = Math.floor(Math.random() * (max - min + 1)) + min;
      console.debug("[Debug] rand(", min, ",", max, ") ->", value);
      return value;
    }

    function pick(list) {
      if (!list || list.length === 0) return undefined;
      const value = list[rand(0, list.length - 1)];
      console.debug("[Debug] pick from:", list, "->", value);
      return value;
    }

    function shuffled(list) {
      const copy = [...list];
      for (let i = copy.length - 1; i > 0; i -= 1) {
        const j = rand(0, i);
        [copy[i], copy[j]] = [copy[j], copy[i]];
      }
      console.debug("[Debug] shuffled:", copy);
      return copy;
    }

    function nextTriviaItem() {
      if (remainingTriviaIndices.length === 0) {
        remainingTriviaIndices = triviaData.map((_, idx) => idx);
        remainingTriviaIndices = shuffled(remainingTriviaIndices);
        console.debug("[Debug] Trivia indices refilled:", remainingTriviaIndices);
      }
      const nextIndex = remainingTriviaIndices.pop();
      console.debug("[Debug] nextTriviaItem index:", nextIndex, "item:", triviaData[nextIndex]);
      return triviaData[nextIndex];
    }

    function showScreen(key) {
      Object.values(screens).forEach((el) => {
        if(el && el.classList) el.classList.remove("active");
      });
      if(screens[key] && screens[key].classList) {
        screens[key].classList.add("active");
        console.debug("[Debug] showScreen -> now active:", key);
      } else {
        console.error("[Debug] showScreen: No such screen:", key);
      }
    }

    function getSessionId() {
      let sessionId = localStorage.getItem(SESSION_STORAGE_KEY);
      if (!sessionId) {
        if (window.crypto?.randomUUID) {
          sessionId = window.crypto.randomUUID();
        } else {
          sessionId = `session-${Date.now()}-${Math.floor(Math.random() * 100000)}`;
        }
        localStorage.setItem(SESSION_STORAGE_KEY, sessionId);
      }
      return sessionId;
    }

    async function trackInteraction(action) {
      try {
        const response = await fetch(`${API_BASE_URL}/api/interactions`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            session_id: getSessionId(),
            action: action || "unknown"
          })
        });
        if (!response.ok) return;
        const data = await response.json();
        console.debug("[Debug] interaction tracked:", action, data);
      } catch (_err) {
        // Backend tracking is optional for UI behavior.
      }
    }

    function randomizeTitle() {
      const fonts = [
        "Arial",
        "Georgia",
        "Palatino",
        "Arial Black",
        "Times New Roman",
        "Courier New",
        "Tahoma",
        "Trebuchet MS",
        "Verdana"
      ];
      const title = document.getElementById("title");
      if(!title) {
        console.warn("[Debug] randomizeTitle: No title element found");
        return;
      }
      title.style.color = `rgb(${rand(15, 225)},${rand(15, 225)},${rand(15, 225)})`;
      title.style.fontFamily = pick(fonts);
      title.style.fontSize = `${rand(32, 52)}px`;
      console.debug("[Debug] randomizeTitle updated", title.style);
    }

    function nextTriviaQuestion() {
      if (!triviaData.length) {
        document.getElementById("triviaCategory").textContent = "No trivia questions loaded yet.";
        document.getElementById("triviaResult").textContent = "";
        setImageWithFallback(document.getElementById("triviaImage"), "", fallbackTriviaImage);
        [...document.querySelectorAll(".answer-btn")].forEach((btn) => {
          btn.disabled = true;
          btn.textContent = "-";
          btn.onclick = null;
        });
        return;
      }
      const item = nextTriviaItem();
      if (!item) return;
      const options = shuffled(item.options);
      document.getElementById("triviaCategory").textContent = `${item.category}: ${item.question}`;
      setImageWithFallback(document.getElementById("triviaImage"), item.image, fallbackTriviaImage);
      document.getElementById("triviaResult").textContent = "";
      const buttons = [...document.querySelectorAll(".answer-btn")];
      buttons.forEach((btn, idx) => {
        btn.disabled = false;
        btn.textContent = options[idx];
        btn.onclick = () => {
          const correct = btn.textContent === item.answer;
          document.getElementById("triviaResult").textContent = correct ? "CORRECT!" : "TRY AGAIN!";
          buttons.forEach((b) => (b.disabled = true));
          console.debug("[Debug] Trivia answer selected:", btn.textContent, "correct:", correct);
        };
      });
      console.debug("[Debug] nextTriviaQuestion set:", item, options);
    }

    function generateSport() {
      const item = pick(sportsData);
      if (!item) {
        document.getElementById("sportName").textContent = "No sports data loaded yet.";
        document.getElementById("sportFact").textContent = "";
        setImageWithFallback(document.getElementById("sportImage"), "", fallbackSportImage);
        const sportVideoLink = document.getElementById("sportVideoLink");
        if (sportVideoLink) {
          sportVideoLink.href = "#";
          sportVideoLink.textContent = "Watch highlights";
        }
        return;
      }
      document.getElementById("sportName").textContent = item.sport;
      setImageWithFallback(
        document.getElementById("sportImage"),
        item.image,
        sportLabelImage(item.sport)
      );
      document.getElementById("sportFact").textContent = `Random fact: ${item.fact}`;
      const query = encodeURIComponent(`${item.sport} sport highlights`);
      document.getElementById("sportVideoLink").href = `https://www.youtube.com/results?search_query=${query}`;
      console.debug("[Debug] generateSport ->", item);
    }

    function sportLabelImage(sportName) {
      const svg = `data:image/svg+xml;utf8,${encodeURIComponent(
        `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 640 360'>
          <defs>
            <linearGradient id='g' x1='0' y1='0' x2='1' y2='1'>
              <stop offset='0%' stop-color='#1d4ed8'/>
              <stop offset='100%' stop-color='#9333ea'/>
            </linearGradient>
          </defs>
          <rect width='640' height='360' fill='url(#g)'/>
          <text x='320' y='190' text-anchor='middle' font-size='38' font-family='Arial' fill='white'>${sportName}</text>
        </svg>`
      )}`;
      console.debug("[Debug] sportLabelImage created for:", sportName, svg);
      return svg;
    }

    function setImageWithFallback(imgEl, primarySrc, fallbackSrc) {
      if(!imgEl) {
        console.warn("[Debug] setImageWithFallback: No imgEl");
        return;
      }
      if (!primarySrc) {
        imgEl.src = fallbackSrc;
        return;
      }
      imgEl.onerror = () => {
        imgEl.onerror = null;
        imgEl.src = fallbackSrc;
        console.warn("[Debug] Image failed loading, using fallback:", fallbackSrc);
      };
      imgEl.src = primarySrc;
      console.debug("[Debug] setImageWithFallback src set to:", primarySrc);
    }

    function generateIcons() {
      const box = document.getElementById("iconCanvas");
      if (!box) {
        console.warn("[Debug] generateIcons: iconCanvas missing");
        return;
      }
      box.innerHTML = "";
      box.style.background = `rgb(${rand(3, 252)},${rand(3, 252)},${rand(3, 252)})`;
      if (!document.getElementById("iconsToggle").checked) return;

      const width = box.clientWidth;
      const height = box.clientHeight;
      for (let i = 0; i < 25; i += 1) {
        const icon = document.createElement("span");
        icon.className = "icon";
        icon.textContent = pick(iconSymbols);
        icon.style.left = `${rand(10, Math.max(15, width - 30))}px`;
        icon.style.top = `${rand(10, Math.max(15, height - 30))}px`;
        icon.style.fontSize = `${rand(14, 42)}px`;
        icon.style.color = `rgba(${rand(1, 255)},${rand(1, 255)},${rand(1, 255)},${Math.random().toFixed(2)})`;
        box.appendChild(icon);
      }
      console.debug("[Debug] generateIcons finished:", box.children.length, "icons.");
    }

    function generateQuote() {
      const name = (document.getElementById("nameInput").value || "Friend").trim();
      const quoteType = document.getElementById("quoteType").value;
      let result = "";

      if (quoteType === "Motivational") {
        const firstWordList = ["You ", "They ", "You ", "You "];
        const secondWordList = ["Will ", "Should ", "Can "];
        const thirdWord = "Do ";
        const fourthWordList = ["Great ", "Good ", "Strong ", "Important ", "Smart "];
        const fifthWordList = ["Items!", "Things!", "Objects!", "Stuff!"];
        result = `${name},\n${pick(firstWordList)}${pick(secondWordList)}${thirdWord}${pick(fourthWordList)}${pick(fifthWordList)}`;
      } else if (quoteType === "Insult") {
        const firstWord = "You ";
        const secondWordList = ["Are ", "Smell Like ", "Look Like ", "Act Like ", "Can Be "];
        const thirdWordList = ["A Real ", "The ", "A "];
        const fourthWordList = ["Trash ", "Dumb ", "Stinky ", "Smelly ", "Crabby ", "Stupid "];
        const fifthWordList = ["Can!", "Person!", "Fish!", "Chud!", "Dork!"];
        result = `${name},\n${firstWord}${pick(secondWordList)}${pick(thirdWordList)}${pick(fourthWordList)}${pick(fifthWordList)}`;
      } else {
        const firstWordList = [
          "The World ",
          "The Government ",
          "The Human Race ",
          "Human Nature ",
          "Life ",
          "The Meaning Of Life ",
          "Our Future ",
          "Our Society ",
          "The Universe ",
          "Everything "
        ];
        const secondWordList = ["Is ", "Is Like ", "Is Destined To Be ", "will be ", "Is "];
        const thirdWordList = [
          "67",
          "A Simulation",
          "An Infinite Loop",
          "Mike Tyson",
          "The Fortnite Battlepass",
          "A Box Of Chocolates",
          "History",
          "You",
          "42",
          "Happiness",
          "Emptiness",
        ];
        result = `${pick(firstWordList)}${pick(secondWordList)}${pick(thirdWordList)}, ${name}!`;
      }
      document.getElementById("quoteOutput").textContent = result;
      console.debug("[Debug] generateQuote result:", result);
    }

    function generateNumber() {
      let low = Number(document.getElementById("lowInput").value);
      let high = Number(document.getElementById("highInput").value);
      if (!Number.isFinite(low)) low = 1;
      if (!Number.isFinite(high)) high = 100;
      if (low > high) [low, high] = [high, low];
      const result = rand(low, high);
      document.getElementById("numberOutput").textContent = String(result);
      console.debug("[Debug] generateNumber ->", result, "from", low, high);
    }

    function rollDice() {
      let count = Number(document.getElementById("diceCountInput").value);
      if (!Number.isFinite(count)) count = 1;
      count = Math.max(1, Math.min(10, Math.floor(count)));
      document.getElementById("diceCountInput").value = String(count);
      const rolls = [];
      for (let i = 0; i < count; i += 1) {
        rolls.push(rand(1, 6));
      }
      const total = rolls.reduce((sum, n) => sum + n, 0);
      document.getElementById("diceOutput").textContent = `Rolls: ${rolls.join(", ")} | Total: ${total}`;
      renderDice(rolls);
      console.debug("[Debug] rollDice:", rolls, "total:", total);
    }

    function formatPigTime(msLeft) {
      const totalSec = Math.max(0, Math.ceil(msLeft / 1000));
      const min = Math.floor(totalSec / 60);
      const sec = totalSec % 60;
      return `${min}:${String(sec).padStart(2, "0")}`;
    }

    function syncPigPanelChrome() {
      if (pigPanel) pigPanel.classList.toggle("pig-panel--playing", pigPlaying);
      if (pigBtn) pigBtn.classList.toggle("pig-btn--stop", pigPlaying);
      if (pigProgress) pigProgress.value = Math.min(PIG_GOAL, pigBanked);
    }

    function getPigTurnLimit() {
      const limitEnabled = Boolean(pigTurnLimitToggle && pigTurnLimitToggle.checked);
      if (!limitEnabled) return null;
      const parsed = Number(pigTurnLimitInput?.value);
      if (!Number.isFinite(parsed)) return 12;
      const clamped = Math.max(3, Math.min(50, Math.floor(parsed)));
      if (pigTurnLimitInput) pigTurnLimitInput.value = String(clamped);
      return clamped;
    }

    function setPigSetupEnabled(enabled) {
      if (pigTurnLimitToggle) pigTurnLimitToggle.disabled = !enabled;
      if (pigTurnLimitInput) pigTurnLimitInput.disabled = !enabled || !(pigTurnLimitToggle?.checked);
    }

    if (pigTurnLimitToggle) {
      pigTurnLimitToggle.addEventListener("change", () => {
        setPigSetupEnabled(!pigPlaying);
        updatePigHud();
      });
    }

    function updatePigHud() {
      const msLeft = pigPlaying
        ? Math.max(0, pigEndsAt - Date.now())
        : pigDisplayMsLeft;
      if (pigTimerLabel) pigTimerLabel.textContent = formatPigTime(msLeft);
      if (pigTotalLabel) pigTotalLabel.textContent = `${pigBanked} / ${PIG_GOAL}`;
      if (pigTurnLabel) pigTurnLabel.textContent = String(pigTurn);
      if (pigTurnsLabel) {
        pigTurnsLabel.textContent = pigMaxTurns
          ? `${pigTurnsUsed} / ${pigMaxTurns}`
          : `${pigTurnsUsed} / Unlimited`;
      }
      if (pigTimeStat) pigTimeStat.classList.toggle("pig-stat--urgent", pigPlaying && msLeft <= 30000);
      syncPigPanelChrome();
    }

    function setPigControlsEnabled(enabled) {
      if (pigRollBtn) pigRollBtn.disabled = !enabled;
      if (pigHoldBtn) pigHoldBtn.disabled = !enabled;
    }

    function finishPig(outcome, message) {
      if (pigTimerId) {
        clearInterval(pigTimerId);
        pigTimerId = null;
      }
      pigDisplayMsLeft = Math.max(0, pigEndsAt - Date.now());
      pigPlaying = false;
      setPigControlsEnabled(false);
      setPigSetupEnabled(true);
      if (pigBtn) pigBtn.textContent = "Play Pig";
      updatePigHud();
      if (pigStatusLabel) {
        pigStatusLabel.textContent = message;
        pigStatusLabel.dataset.outcome = outcome;
      }
      console.debug("[Debug] finishPig:", outcome, message, "banked:", pigBanked);
    }

    function checkPigWin() {
      if (pigBanked >= PIG_GOAL) {
        finishPig("win", `You win! Reached ${pigBanked} before time ran out.`);
        return true;
      }
      return false;
    }

    function tickPigTimer() {
      if (!pigPlaying) return;
      updatePigHud();
      if (Date.now() >= pigEndsAt) {
        if (pigBanked >= PIG_GOAL) {
          finishPig("win", `You win! Reached ${pigBanked} before time ran out.`);
        } else {
          finishPig("lose", `Time's up at ${pigBanked}. Need ${PIG_GOAL} to win.`);
        }
      }
    }

    function consumePigTurn(reason) {
      pigTurnsUsed += 1;
      updatePigHud();
      if (pigMaxTurns && pigTurnsUsed >= pigMaxTurns && pigBanked < PIG_GOAL) {
        finishPig(
          "lose",
          `Turn limit reached (${pigTurnsUsed}/${pigMaxTurns}) at ${pigBanked}. Need ${PIG_GOAL} to win.`
        );
        return true;
      }
      if (pigStatusLabel && reason === "bust") {
        pigStatusLabel.textContent = "Rolled 1 - turn lost. Next turn started.";
      }
      return false;
    }

    function startPig() {
      pigBanked = 0;
      pigTurn = 0;
      pigTurnsUsed = 0;
      pigMaxTurns = getPigTurnLimit();
      pigDisplayMsLeft = PIG_DURATION_MS;
      pigPlaying = true;
      pigEndsAt = Date.now() + PIG_DURATION_MS;
      if (pigBtn) pigBtn.textContent = "Stop Pig";
      setPigControlsEnabled(true);
      setPigSetupEnabled(false);
      if (pigStatusLabel) {
        pigStatusLabel.textContent = "Roll to build a turn. Hold to bank. A 1 ends your turn with no points.";
        delete pigStatusLabel.dataset.outcome;
      }
      updatePigHud();
      syncPigPanelChrome();
      if (pigTimerId) clearInterval(pigTimerId);
      pigTimerId = setInterval(tickPigTimer, 250);
      console.debug("[Debug] startPig");
    }

    function endPig(manualStop) {
      if (!pigPlaying) return;
      const outcome = manualStop ? "stopped" : "stopped";
      finishPig(
        outcome,
        manualStop
          ? `Stopped at ${pigBanked} / ${PIG_GOAL}.`
          : `Stopped at ${pigBanked} / ${PIG_GOAL}.`
      );
    }

    function rollPig() {
      if (!pigPlaying || Date.now() >= pigEndsAt) return;
      const roll = rand(1, 6);
      renderDice([roll]);
      if (roll === 1) {
        pigTurn = 0;
        if (consumePigTurn("bust")) return;
        if (pigStatusLabel) pigStatusLabel.textContent = "Rolled 1 - turn lost. Roll for your next turn.";
        updatePigHud();
        console.debug("[Debug] rollPig bust on 1");
        return;
      }
      pigTurn += roll;
      if (pigStatusLabel) {
        pigStatusLabel.textContent = `Rolled ${roll}. Turn is ${pigTurn}. Hold to bank or keep rolling.`;
      }
      updatePigHud();
      if (pigBanked + pigTurn >= PIG_GOAL) {
        pigBanked += pigTurn;
        pigTurn = 0;
        checkPigWin();
      }
      console.debug("[Debug] rollPig:", roll, "banked:", pigBanked, "turn:", pigTurn);
    }

    function holdPig() {
      if (!pigPlaying || Date.now() >= pigEndsAt) return;
      if (pigTurn <= 0) {
        if (pigStatusLabel) pigStatusLabel.textContent = "Nothing to hold — roll first.";
        return;
      }
      pigBanked += pigTurn;
      pigTurn = 0;
      if (consumePigTurn("hold")) return;
      updatePigHud();
      if (checkPigWin()) return;
      if (pigStatusLabel) {
        pigStatusLabel.textContent = `Held! Total is ${pigBanked}. Roll for your next turn.`;
      }
      console.debug("[Debug] holdPig banked:", pigBanked);
    }

    function playPig() {
      if (pigPlaying) {
        endPig(true);
        return;
      }
      startPig();
    }

    function dieFaceSvg(value) {
      const pipMap = {
        1: [[50, 50]],
        2: [[28, 28], [72, 72]],
        3: [[28, 28], [50, 50], [72, 72]],
        4: [[28, 28], [72, 28], [28, 72], [72, 72]],
        5: [[28, 28], [72, 28], [50, 50], [28, 72], [72, 72]],
        6: [[28, 28], [72, 28], [28, 50], [72, 50], [28, 72], [72, 72]]
      };
      const circles = pipMap[value]
        .map(([cx, cy]) => `<circle cx="${cx}" cy="${cy}" r="7" fill="#111827"/>`)
        .join("");
      const svg = `data:image/svg+xml;utf8,${encodeURIComponent(
        `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'>
          <rect x='4' y='4' width='92' height='92' rx='14' fill='white' stroke='#cbd5e1' stroke-width='4'/>
          ${circles}
        </svg>`
      )}`;
      return svg;
    }

    function renderDice(rolls) {
      const wrap = document.getElementById("diceVisuals");
      if (!wrap) { 
        console.warn("[Debug] renderDice: container missing");
        return;
      }
      wrap.innerHTML = "";
      rolls.forEach((value) => {
        const img = document.createElement("img");
        img.className = "die-img";
        img.alt = `Die showing ${value}`;
        img.src = dieFaceSvg(value);
        wrap.appendChild(img);
      });
      console.debug("[Debug] renderDice for rolls:", rolls);
    }

    function coinFaceSvg(side) {
      const isHeads = side === "Heads";
      const label = isHeads ? "H" : "T";
      const fill = isHeads ? "#f59e0b" : "#94a3b8";
      const svg = `data:image/svg+xml;utf8,${encodeURIComponent(
        `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'>
          <circle cx='50' cy='50' r='46' fill='${fill}' stroke='#334155' stroke-width='4'/>
          <circle cx='50' cy='50' r='36' fill='none' stroke='#e2e8f0' stroke-width='3'/>
          <text x='50' y='62' text-anchor='middle' font-size='38' font-family='Arial' fill='#0f172a'>${label}</text>
        </svg>`
      )}`;
      return svg;
    }

    function renderCoinFlips(results) {
      const wrap = document.getElementById("coinflipVisuals");
      if (!wrap) {
        console.warn("[Debug] renderCoinFlips: container missing");
        return;
      }
      wrap.innerHTML = "";
      results.forEach((side) => {
        const img = document.createElement("img");
        img.className = "coin-img";
        img.alt = `Coin flip result: ${side}`;
        img.src = coinFaceSvg(side);
        wrap.appendChild(img);
      });
      console.debug("[Debug] renderCoinFlips for:", results);
    }

    function generateUsername() {
      const firstParts = [
        "Neo", "Pixel", "Shadow", "Turbo", "Lucky", "Nova", "Frost", "Solar", "Echo", "Blaze", "Toilet", "Strong"
      ];
      const secondParts = [
        "Rider", "Panda", "Ninja", "Falcon", "Wizard", "Comet", "Otter", "Drift", "Glitch", "Knight", "Panda", "Eagle", "Licker", "Crab", "Rat", "Snake", "Fox", "Wolf", "Bear", "Lion", "Tiger", "Leopard", "Cheetah", "Jaguar", "Panther"
      ];
      const digitsCount = Number(document.getElementById("usernameDigitsSelect").value);
      let digits = "";
      for (let i = 0; i < digitsCount; i += 1) {
        digits += String(rand(0, 9));
      }
      const username = `${pick(firstParts)}${pick(secondParts)}${digits}`;
      document.getElementById("usernameOutput").textContent = username;
      console.debug("[Debug] generateUsername:", username);
    }

    function generateName(){
      const firstNames = ["John", "Jane", "Jim", "Jill", "Jack", "Amauri", "Michael", "Isaac", "Isabella", "James", "Vlad", "Jonesey", "Kanye", "Tyler", "Drake", "Kendrick", "Jermaine", "Kanye", "Tyler", "Drake", "Kendrick", "Cole", "Jose", "Peter", "John", "Jane", "Jim", "Jill", "Jack", "Amauri", "Michael", "Isaac", "Isabella", "James", "Vlad", "Jonesey", "Kanye", "Tyler", "Drake", "Kendrick", "Jermaine", "Kanye", "Tyler", "Drake", "Kendrick", "Cole", "Jose", "Peter"];
      const lastNames = ["Smith", "Johnson", "Williams", "Cole", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez", "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson", "Thomas", "Taylor", "Moore", "Jackson", "Martin", "Lee", "Perez", "Thompson", "White", "Harris", "Sanchez", "Clark", "Ramirez", "Lewis", "Robinson", "Walker", "Young", "Allen", "King", "Wright", "Scott", "Torres", "Nguyen", "Hill", "Flores", "Green", "Adams", "Nelson", "Baker", "Hall", "Rivera", "Campbell", "Mitchell", "Carter", "Roberts", "McLaughlin", "Hermann", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez", "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson", "Thomas", "Taylor", "Moore", "Jackson", "Martin", "Lee", "Perez", "Thompson", "White", "Harris", "Sanchez", "Clark", "Ramirez", "Lewis", "Robinson", "Walker", "Young", "Allen", "King", "Wright", "Scott", "Torres", "Nguyen", "Hill", "Flores", "Green", "Adams", "Nelson", "Baker", "Hall", "Rivera", "Campbell", "Mitchell", "Carter", "Roberts", "McLaughlin", "Hermann", "Palmer", "Davis", "Rodriguez", "Martinez", "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson", "Thomas", "Taylor", "Moore", "Jackson", "Martin", "Lee", "Perez", "Thompson", "White", "Harris", "Sanchez", "Clark", "Ramirez", "Lewis", "Robinson", "Walker", "Young", "Allen", "King", "Wright", "Scott", "Torres", "Nguyen", "Hill", "Flores", "Green", "Adams", "Nelson", "Baker", "Hall", "Rivera", "Campbell", "Mitchell", "Carter", "Roberts", "McLaughlin", "Hermann", "Palmer", "DeRooy", "Harris"];
      const name = `${pick(firstNames)} ${pick(lastNames)}`;
      document.getElementById("nameOutput").textContent = name;
      console.debug("[Debug] generateName:", name);
    }

    function flipCoin() {
      let count = Number(document.getElementById("coinflipCountInput").value);
      if (!Number.isFinite(count)) count = 1;
      count = Math.max(1, Math.min(10, Math.floor(count)));
      document.getElementById("coinflipCountInput").value = String(count);

      const results = [];
      for (let i = 0; i < count; i += 1) {
        results.push(rand(0, 1) === 0 ? "Heads" : "Tails");
      }
      const heads = results.filter((side) => side === "Heads").length;
      const tails = results.length - heads;
      document.getElementById("coinflipOutput").textContent =
        `Results: ${results.join(", ")} | Heads: ${heads} | Tails: ${tails}`;
      renderCoinFlips(results);
      console.debug("[Debug] flipCoin results:", results);
    }

    function openRandomGame() {
      const status = document.getElementById("randomGameStatus");
      if (!randomGameLinks.length) {
        status.textContent = "No game links yet. Add your links in script.js -> randomGameLinks.";
        console.warn("[Debug] openRandomGame: No links in randomGameLinks");
        return;
      }
      selectedGameUrl = pick(randomGameLinks);
      status.textContent = `Selected: ${selectedGameUrl}`;
      console.debug("[Debug] openRandomGame picked:", selectedGameUrl);
    }

    function openSelectedGame() {
      const status = document.getElementById("randomGameStatus");
      if (!selectedGameUrl) {
        status.textContent = "Pick a random game first.";
        console.warn("[Debug] openSelectedGame: No selectedGameUrl");
        return;
      }
      const newTab = window.open(selectedGameUrl, "_blank", "noopener,noreferrer");
      if (newTab) {
        status.textContent = `Opened in new tab: ${selectedGameUrl}`;
        console.debug("[Debug] openSelectedGame window opened:", selectedGameUrl);
      } else {
        status.textContent = "Pop-up blocked";
        console.error("[Debug] openSelectedGame pop-up blocked for:", selectedGameUrl);
      }
    }

    document.querySelectorAll("[data-screen]").forEach((btn) => {
      btn.addEventListener("click", () => {
        console.debug("[Debug] Screen button clicked:", btn.dataset.screen);
        showScreen(btn.dataset.screen);
        randomizeTitle();
        trackInteraction(`open_screen_${btn.dataset.screen}`);
        if (btn.dataset.screen === "trivia") nextTriviaQuestion();
      });
    });

    const randomScreenBtn = document.getElementById("randomScreenBtn");
    if(randomScreenBtn) {
      randomScreenBtn.addEventListener("click", () => {
        const keys = ["account", "games", "trivia", "sports", "screen", "quote", "number", "dice", "username", "coinflip"];
        const key = pick(keys);
        showScreen(key);
        randomizeTitle();
        trackInteraction("random_screen");
        console.debug("[Debug] randomScreenBtn picked:", key);
        if (key === "trivia") nextTriviaQuestion();
      });
    } else {
      console.warn("[Debug] randomScreenBtn not found");
    }

    function openSuggestionEmailDraft(text, submittedBy) {
      const body = encodeURIComponent(
        `Randomania Suggestion\n\nSubmitted by: ${submittedBy}\n\n${text}`
      );
      const subject = encodeURIComponent("Randomania Suggestion");
      const mailto = `mailto:${SUGGESTION_EMAIL_TO}?cc=${encodeURIComponent(SUGGESTION_EMAIL_CC)}&subject=${subject}&body=${body}`;
      const popup = window.open(mailto, "_blank");
      if (!popup) {
        window.location.href = mailto;
      }
    }

    function getStoredSuggestions() {
      try {
        const raw = localStorage.getItem("Randomania Suggestions");
        const parsed = raw ? JSON.parse(raw) : [];
        return Array.isArray(parsed) ? parsed : [];
      } catch (_err) {
        return [];
      }
    }

    function saveStoredSuggestions(list) {
      localStorage.setItem("Randomania Suggestions", JSON.stringify(list));
    }

    async function addSuggestion() {
      const textInput = document.getElementById("suggestionTextInput");
      const text = textInput?.value || "";
      if (!text.trim()) return;
      const trimmed = text.trim();
      const submittedBy = localStorage.getItem("randomaniaActiveAccount") || "Guest";
      const suggestions = getStoredSuggestions();
      suggestions.push(trimmed);
      saveStoredSuggestions(suggestions);
      const label = document.getElementById("suggestionsInput");

      let emailStatus = "";
      try {
        const response = await fetch(`${API_BASE_URL}/api/suggestions`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text: trimmed,
            submitted_by: submittedBy
          })
        });
        if (response.ok) {
          const result = await response.json();
          emailStatus = result.email_sent
            ? " | Backend email sent."
            : ` | Backend email failed: ${result.email_error || "Unknown error"}`;
        } else {
          emailStatus = ` | Server error (${response.status})`;
        }
      } catch (_err) {
        emailStatus = " | Backend not reachable; opened email draft instead.";
      }

      if (label) {
        label.textContent = `Saved ${suggestions.length} suggestion(s). Latest: ${trimmed}${emailStatus}`;
      }
      if (textInput) textInput.value = "";
      openSuggestionEmailDraft(trimmed, submittedBy);
      renderSuggestionSummary();
      trackInteraction("submit_suggestion");
    }

    function renderSuggestionSummary() {
      const label = document.getElementById("suggestionsInput");
      const listEl = document.getElementById("suggestionsList");
      if (!label) return;
      const suggestions = getStoredSuggestions();
      if (!suggestions.length) {
        label.textContent = "No saved suggestions yet. Click Add Suggestion to submit one.";
        if (listEl) listEl.innerHTML = "";
        return;
      }
      const latest = suggestions[suggestions.length - 1];
      label.textContent = `Saved ${suggestions.length} suggestion(s). Latest: ${latest}`;
      if (!listEl) return;
      const recent = suggestions.slice(-10).reverse();
      listEl.innerHTML = recent
        .map((item) => `<li class="suggestion-item">${item}</li>`)
        .join("");
    }

    function emailLatestSuggestion() {
      const suggestions = getStoredSuggestions();
      const latest = suggestions[suggestions.length - 1];
      if (!latest) {
        const label = document.getElementById("suggestionsInput");
        if (label) label.textContent = "Add a suggestion first, then email it.";
        return;
      }
      const submittedBy = localStorage.getItem("randomaniaActiveAccount") || "Guest";
      openSuggestionEmailDraft(latest, submittedBy);
    }

    function clearSuggestions() {
      localStorage.removeItem("Randomania Suggestions");
      renderSuggestionSummary();
    }

    function cardFaceSvg(rank, suit) {
      const isRed = suit === "Hearts" || suit === "Diamonds";
      const color = isRed ? "#dc2626" : "#111827";
      const suitSymbolMap = {
        Hearts: "♥",
        Diamonds: "♦",
        Clubs: "♣",
        Spades: "♠"
      };
      const suitSymbol = suitSymbolMap[suit] || "?";
      return `data:image/svg+xml;utf8,${encodeURIComponent(
        `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 120 180'>
          <rect x='4' y='4' width='112' height='172' rx='12' fill='white' stroke='#94a3b8' stroke-width='3'/>
          <text x='18' y='28' font-size='20' font-family='Arial' font-weight='700' fill='${color}'>${rank}</text>
          <text x='18' y='50' font-size='20' font-family='Arial' fill='${color}'>${suitSymbol}</text>
          <text x='60' y='103' text-anchor='middle' font-size='48' font-family='Arial' fill='${color}'>${suitSymbol}</text>
          <g transform='rotate(180 60 90)'>
            <text x='18' y='28' font-size='20' font-family='Arial' font-weight='700' fill='${color}'>${rank}</text>
            <text x='18' y='50' font-size='20' font-family='Arial' fill='${color}'>${suitSymbol}</text>
          </g>
        </svg>`
      )}`;
    }

    const PROVIDED_CARD_IMAGE_MAP = {
      "2_of_diamonds": "file:///C:/Users/143994/.cursor/projects/c-Users-143994-Downloads-Randomania/assets/c__Users_143994_AppData_Roaming_Cursor_User_workspaceStorage_empty-window_images_2_of_diamonds-c80a4a8a-e656-4e4b-84be-732cb37ce022.png",
      "2_of_hearts": "file:///C:/Users/143994/.cursor/projects/c-Users-143994-Downloads-Randomania/assets/c__Users_143994_AppData_Roaming_Cursor_User_workspaceStorage_empty-window_images_2_of_hearts-c414398c-341a-427d-bafd-4cc434e610f0.png",
      "2_of_spades": "file:///C:/Users/143994/.cursor/projects/c-Users-143994-Downloads-Randomania/assets/c__Users_143994_AppData_Roaming_Cursor_User_workspaceStorage_empty-window_images_2_of_spades-2d0cf571-641a-4cc2-a1ba-006e3e29554d.png",
      "2_of_clubs": "file:///C:/Users/143994/.cursor/projects/c-Users-143994-Downloads-Randomania/assets/c__Users_143994_AppData_Roaming_Cursor_User_workspaceStorage_empty-window_images_2_of_BBclubs-9c454d92-1abb-4cd2-83be-29dda527374e.png",
      "3_of_diamonds": "file:///C:/Users/143994/.cursor/projects/c-Users-143994-Downloads-Randomania/assets/c__Users_143994_AppData_Roaming_Cursor_User_workspaceStorage_empty-window_images_3_of_diamonds-d47b7f41-9877-44b6-9c84-81ad846537bc.png",
      "3_of_hearts": "file:///C:/Users/143994/.cursor/projects/c-Users-143994-Downloads-Randomania/assets/c__Users_143994_AppData_Roaming_Cursor_User_workspaceStorage_empty-window_images_3_of_hearts-f43d0200-ffb0-4c0c-9bbc-e378f36c345d.png",
      "3_of_spades": "file:///C:/Users/143994/.cursor/projects/c-Users-143994-Downloads-Randomania/assets/c__Users_143994_AppData_Roaming_Cursor_User_workspaceStorage_empty-window_images_3_of_spades-21d3f255-b7e5-443f-9872-596925f731b8.png",
      "3_of_clubs": "file:///C:/Users/143994/.cursor/projects/c-Users-143994-Downloads-Randomania/assets/c__Users_143994_AppData_Roaming_Cursor_User_workspaceStorage_empty-window_images_3_of_clubs-04e0509f-f9c8-4b4c-8df1-d65fb991d28f.png",
      "4_of_diamonds": "file:///C:/Users/143994/.cursor/projects/c-Users-143994-Downloads-Randomania/assets/c__Users_143994_AppData_Roaming_Cursor_User_workspaceStorage_empty-window_images_4_of_diamonds-4aec72b6-d4e5-4a4c-abf6-163ed32fdbc3.png",
      "4_of_hearts": "file:///C:/Users/143994/.cursor/projects/c-Users-143994-Downloads-Randomania/assets/c__Users_143994_AppData_Roaming_Cursor_User_workspaceStorage_empty-window_images_4_of_hearts-029c5ac8-575b-4564-bfeb-b1df56bc00d8.png",
      "4_of_spades": "file:///C:/Users/143994/.cursor/projects/c-Users-143994-Downloads-Randomania/assets/c__Users_143994_AppData_Roaming_Cursor_User_workspaceStorage_empty-window_images_4_of_spades-5b2aa605-7f72-4d4c-ba08-9c948817634b.png",
      "4_of_clubs": "file:///C:/Users/143994/.cursor/projects/c-Users-143994-Downloads-Randomania/assets/c__Users_143994_AppData_Roaming_Cursor_User_workspaceStorage_empty-window_images_4_of_clubs-5eec58d5-795c-45bd-ba27-764aeb7802b7.png",
      "5_of_diamonds": "file:///C:/Users/143994/.cursor/projects/c-Users-143994-Downloads-Randomania/assets/c__Users_143994_AppData_Roaming_Cursor_User_workspaceStorage_empty-window_images_5_of_diamonds-ac424fb3-adc2-439a-a254-04a1ddaee3b8.png",
      "5_of_hearts": "file:///C:/Users/143994/.cursor/projects/c-Users-143994-Downloads-Randomania/assets/c__Users_143994_AppData_Roaming_Cursor_User_workspaceStorage_empty-window_images_5_of_hearts-2d0a9ad4-18bc-4e50-aefd-379ac6836a48.png",
      "5_of_spades": "file:///C:/Users/143994/.cursor/projects/c-Users-143994-Downloads-Randomania/assets/c__Users_143994_AppData_Roaming_Cursor_User_workspaceStorage_empty-window_images_5_of_spades-418a6424-d450-4b17-8e1a-61cce5d5afcd.png",
      "5_of_clubs": "file:///C:/Users/143994/.cursor/projects/c-Users-143994-Downloads-Randomania/assets/c__Users_143994_AppData_Roaming_Cursor_User_workspaceStorage_empty-window_images_5_of_clubs-f6029711-eeef-422c-84fd-39b750450106.png",
      "6_of_diamonds": "file:///C:/Users/143994/.cursor/projects/c-Users-143994-Downloads-Randomania/assets/c__Users_143994_AppData_Roaming_Cursor_User_workspaceStorage_empty-window_images_6_of_diamonds-9fc10dcc-b0f3-445a-8e76-1bf45ae25d44.png",
      "6_of_hearts": "file:///C:/Users/143994/.cursor/projects/c-Users-143994-Downloads-Randomania/assets/c__Users_143994_AppData_Roaming_Cursor_User_workspaceStorage_empty-window_images_6_of_hearts-458a5f40-7a01-46ba-88f0-a0c5253df050.png",
      "6_of_spades": "file:///C:/Users/143994/.cursor/projects/c-Users-143994-Downloads-Randomania/assets/c__Users_143994_AppData_Roaming_Cursor_User_workspaceStorage_empty-window_images_6_of_spades-c1c7abd9-9a8c-41bf-bf7c-644d93bbc62d.png",
      "6_of_clubs": "file:///C:/Users/143994/.cursor/projects/c-Users-143994-Downloads-Randomania/assets/c__Users_143994_AppData_Roaming_Cursor_User_workspaceStorage_empty-window_images_6_of_clubs-ff09c5ff-b50e-4eb9-a4bd-3e7f5c2c40e2.png",
      "7_of_diamonds": "file:///C:/Users/143994/.cursor/projects/c-Users-143994-Downloads-Randomania/assets/c__Users_143994_AppData_Roaming_Cursor_User_workspaceStorage_empty-window_images_7_of_diamonds-71e590ed-1d9b-4572-ae81-7f0cb317d684.png",
      "7_of_hearts": "file:///C:/Users/143994/.cursor/projects/c-Users-143994-Downloads-Randomania/assets/c__Users_143994_AppData_Roaming_Cursor_User_workspaceStorage_empty-window_images_7_of_hearts-225bf1c2-105e-426c-8f9c-108096701619.png",
      "7_of_spades": "file:///C:/Users/143994/.cursor/projects/c-Users-143994-Downloads-Randomania/assets/c__Users_143994_AppData_Roaming_Cursor_User_workspaceStorage_empty-window_images_7_of_spades-fdb96472-48c0-418b-94a5-367dd8e22d1c.png",
      "7_of_clubs": "file:///C:/Users/143994/.cursor/projects/c-Users-143994-Downloads-Randomania/assets/c__Users_143994_AppData_Roaming_Cursor_User_workspaceStorage_empty-window_images_7_of_clubs-e4145da6-4360-4fe8-be7c-f8b72d230bf4.png",
      "8_of_diamonds": "file:///C:/Users/143994/.cursor/projects/c-Users-143994-Downloads-Randomania/assets/c__Users_143994_AppData_Roaming_Cursor_User_workspaceStorage_empty-window_images_8_of_diamonds-22aa74f5-f43e-44f1-9af4-8a62bbf7cd25.png",
      "8_of_hearts": "file:///C:/Users/143994/.cursor/projects/c-Users-143994-Downloads-Randomania/assets/c__Users_143994_AppData_Roaming_Cursor_User_workspaceStorage_empty-window_images_8_of_hearts-bdbdeaa3-e7af-4970-b82d-99890aea0627.png",
      "8_of_spades": "file:///C:/Users/143994/.cursor/projects/c-Users-143994-Downloads-Randomania/assets/c__Users_143994_AppData_Roaming_Cursor_User_workspaceStorage_empty-window_images_8_of_spades-8bcb48bf-5aba-4524-8e14-1bd694404b6d.png",
      "8_of_clubs": "file:///C:/Users/143994/.cursor/projects/c-Users-143994-Downloads-Randomania/assets/c__Users_143994_AppData_Roaming_Cursor_User_workspaceStorage_empty-window_images_8_of_clubs-f67d14d5-94fc-4fc7-9bb8-e2c5f6586ca2.png",
      "9_of_diamonds": "file:///C:/Users/143994/.cursor/projects/c-Users-143994-Downloads-Randomania/assets/c__Users_143994_AppData_Roaming_Cursor_User_workspaceStorage_empty-window_images_9_of_diamonds-1cee1e2d-99a1-41fa-ad67-c36f77d23f6d.png",
      "9_of_hearts": "file:///C:/Users/143994/.cursor/projects/c-Users-143994-Downloads-Randomania/assets/c__Users_143994_AppData_Roaming_Cursor_User_workspaceStorage_empty-window_images_9_of_hearts-14dc661e-52b0-4428-9f2d-2d5053e34bc6.png",
      "9_of_spades": "file:///C:/Users/143994/.cursor/projects/c-Users-143994-Downloads-Randomania/assets/c__Users_143994_AppData_Roaming_Cursor_User_workspaceStorage_empty-window_images_9_of_spades-9597dc4f-23c5-4d67-8de1-c596392ab51f.png",
      "9_of_clubs": "file:///C:/Users/143994/.cursor/projects/c-Users-143994-Downloads-Randomania/assets/c__Users_143994_AppData_Roaming_Cursor_User_workspaceStorage_empty-window_images_9_of_clubs-0697ef0a-6b62-46c3-8167-d225f920f134.png",
      "10_of_diamonds": "file:///C:/Users/143994/.cursor/projects/c-Users-143994-Downloads-Randomania/assets/c__Users_143994_AppData_Roaming_Cursor_User_workspaceStorage_empty-window_images_10_of_diamonds-e3c2a2dd-e4fd-405c-bdd6-956dbaba9bac.png",
      "10_of_hearts": "file:///C:/Users/143994/.cursor/projects/c-Users-143994-Downloads-Randomania/assets/c__Users_143994_AppData_Roaming_Cursor_User_workspaceStorage_empty-window_images_10_of_hearts-8acba744-cae8-4419-847c-46cbd1019ce2.png",
      "10_of_spades": "file:///C:/Users/143994/.cursor/projects/c-Users-143994-Downloads-Randomania/assets/c__Users_143994_AppData_Roaming_Cursor_User_workspaceStorage_empty-window_images_10_of_spades-6ed1a7d1-1bee-4b4d-978e-7b12107d6b08.png",
      "10_of_clubs": "file:///C:/Users/143994/.cursor/projects/c-Users-143994-Downloads-Randomania/assets/c__Users_143994_AppData_Roaming_Cursor_User_workspaceStorage_empty-window_images_10_of_clubs-c6cfb615-f2f0-431e-9077-2c22da26eba1.png",
      "J_of_diamonds": "file:///C:/Users/143994/.cursor/projects/c-Users-143994-Downloads-Randomania/assets/c__Users_143994_AppData_Roaming_Cursor_User_workspaceStorage_empty-window_images_jack_of_diamonds-144aac6d-1f9c-465e-923c-463a393eccfc.png",
      "J_of_hearts": "file:///C:/Users/143994/.cursor/projects/c-Users-143994-Downloads-Randomania/assets/c__Users_143994_AppData_Roaming_Cursor_User_workspaceStorage_empty-window_images_jack_of_hearts-a7cba045-5448-4d53-849b-6879a0aefdb0.png",
      "J_of_spades": "file:///C:/Users/143994/.cursor/projects/c-Users-143994-Downloads-Randomania/assets/c__Users_143994_AppData_Roaming_Cursor_User_workspaceStorage_empty-window_images_jack_of_spades-384c22a7-8926-4adf-8de0-83fccfd022ea.png",
      "J_of_clubs": "file:///C:/Users/143994/.cursor/projects/c-Users-143994-Downloads-Randomania/assets/c__Users_143994_AppData_Roaming_Cursor_User_workspaceStorage_empty-window_images_jack_of_clubs-a3823f9f-784d-46e1-8db8-0cf79256920b.png",
      "Q_of_diamonds": "file:///C:/Users/143994/.cursor/projects/c-Users-143994-Downloads-Randomania/assets/c__Users_143994_AppData_Roaming_Cursor_User_workspaceStorage_empty-window_images_queen_of_diamonds-e8c88ca7-c616-4e79-b278-906ca15d8b51.png",
      "Q_of_hearts": "file:///C:/Users/143994/.cursor/projects/c-Users-143994-Downloads-Randomania/assets/c__Users_143994_AppData_Roaming_Cursor_User_workspaceStorage_empty-window_images_queen_of_hearts-5d27afff-976b-4bb2-830a-8c746bf8e868.png",
      "Q_of_spades": "file:///C:/Users/143994/.cursor/projects/c-Users-143994-Downloads-Randomania/assets/c__Users_143994_AppData_Roaming_Cursor_User_workspaceStorage_empty-window_images_queen_of_spades-04075fe7-4ae1-478d-9079-633eeaa14011.png",
      "Q_of_clubs": "file:///C:/Users/143994/.cursor/projects/c-Users-143994-Downloads-Randomania/assets/c__Users_143994_AppData_Roaming_Cursor_User_workspaceStorage_empty-window_images_queen_of_clubs-35cb88ef-1999-4656-8399-478d1bcf6518.png",
      "K_of_diamonds": "file:///C:/Users/143994/.cursor/projects/c-Users-143994-Downloads-Randomania/assets/c__Users_143994_AppData_Roaming_Cursor_User_workspaceStorage_empty-window_images_king_of_diamonds-ff569dc4-09d6-47d3-9c16-cc4f988bb031.png",
      "K_of_hearts": "file:///C:/Users/143994/.cursor/projects/c-Users-143994-Downloads-Randomania/assets/c__Users_143994_AppData_Roaming_Cursor_User_workspaceStorage_empty-window_images_king_of_hearts-bfa0170b-5371-4852-96fe-1ba170859aeb.png",
      "K_of_spades": "file:///C:/Users/143994/.cursor/projects/c-Users-143994-Downloads-Randomania/assets/c__Users_143994_AppData_Roaming_Cursor_User_workspaceStorage_empty-window_images_king_of_spades-5b122842-498f-4951-aea5-8cddc5a569c9.png",
      "K_of_clubs": "file:///C:/Users/143994/.cursor/projects/c-Users-143994-Downloads-Randomania/assets/c__Users_143994_AppData_Roaming_Cursor_User_workspaceStorage_empty-window_images_king_of_clubs-f18208c8-0172-48c5-8cdb-c4f844500326.png",
      "A_of_diamonds": "file:///C:/Users/143994/.cursor/projects/c-Users-143994-Downloads-Randomania/assets/c__Users_143994_AppData_Roaming_Cursor_User_workspaceStorage_empty-window_images_ace_of_diamonds-ccd99ce6-0cab-44fe-8052-bc9f3836cb1e.png",
      "A_of_hearts": "file:///C:/Users/143994/.cursor/projects/c-Users-143994-Downloads-Randomania/assets/c__Users_143994_AppData_Roaming_Cursor_User_workspaceStorage_empty-window_images_ace_of_hearts-4cd2cc9e-0706-45e0-958a-0e3cfadfabce.png",
      "A_of_spades": "file:///C:/Users/143994/.cursor/projects/c-Users-143994-Downloads-Randomania/assets/c__Users_143994_AppData_Roaming_Cursor_User_workspaceStorage_empty-window_images_ace_of_spades-988e6891-fec2-473d-a611-2746f52b3b5c.png",
      "A_of_clubs": "file:///C:/Users/143994/.cursor/projects/c-Users-143994-Downloads-Randomania/assets/c__Users_143994_AppData_Roaming_Cursor_User_workspaceStorage_empty-window_images_ace_of_clubs-434a3c92-129a-4e21-aade-5b949dd65d2e.png"
    };

    function cardImageSrc(rank, suit) {
      const key = `${rank}_of_${String(suit).toLowerCase()}`;
      return PROVIDED_CARD_IMAGE_MAP[key] || cardFaceSvg(rank, suit);
    }

    function renderCards(cards) {
      const wrap = document.getElementById("cardsVisuals");
      if (!wrap) return;
      wrap.innerHTML = "";
      cards.forEach((card) => {
        const img = document.createElement("img");
        img.className = "card-img";
        img.alt = `${card.rank} of ${card.suit}`;
        img.src = cardImageSrc(card.rank, card.suit);
        img.onerror = () => {
          img.onerror = null;
          img.src = cardFaceSvg(card.rank, card.suit);
        };
        wrap.appendChild(img);
      });
    }

    function generateCards() {
      const suits = ["Hearts", "Diamonds", "Clubs", "Spades"];
      const ranks = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];
      let count = Number(document.getElementById("cardsCountInput")?.value);
      if (!Number.isFinite(count)) count = 1;
      count = Math.max(1, Math.min(10, Math.floor(count)));
      const countInput = document.getElementById("cardsCountInput");
      if (countInput) countInput.value = String(count);
      const cards = [];
      for (let i = 0; i < count; i += 1) {
        cards.push({ rank: pick(ranks), suit: pick(suits) });
      }
      const output = document.getElementById("cardsOutput");
      if (output) {
        output.textContent = cards.map((card) => `${card.rank} of ${card.suit}`).join(", ");
      }
      renderCards(cards);
    }

    const eventBindings = [
      ["nextTriviaBtn", "click", nextTriviaQuestion],
      ["sportBtn", "click", generateSport],
      ["genIconsBtn", "click", generateIcons],
      ["iconsToggle", "change", generateIcons],
      ["quoteBtn", "click", generateQuote],
      ["numberBtn", "click", generateNumber],
      ["diceBtn", "click", rollDice],
      ["usernameBtn", "click", generateUsername],
      ["nameBtn", "click", generateName],
      ["coinflipBtn", "click", flipCoin],
      ["randomGameBtn", "click", openRandomGame],
      ["openGameBtn", "click", openSelectedGame],
      ["pigBtn", "click", playPig],
      ["pigRollBtn", "click", rollPig],
      ["pigHoldBtn", "click", holdPig],
      ["suggestionsBtn", "click", addSuggestion],
      ["suggestionsEmailBtn", "click", emailLatestSuggestion],
      ["suggestionsClearBtn", "click", clearSuggestions],
      ["cardsBtn", "click", generateCards]
    ];

    eventBindings.forEach(([id, evt, fn]) => {
      const el = document.getElementById(id);
      if(el) {
        el.addEventListener(evt, function(ev) {
          console.debug(`[Debug] Button #${id} event:`, evt, ev);
          const result = fn(ev);
          if (result && typeof result.catch === "function") {
            result.catch((err) => console.error(`[Debug] Async handler failed for ${id}:`, err));
          }
          trackInteraction(`event_${id}_${evt}`);
        });
      } else {
        console.warn(`[Debug] eventBindings: Element with id '${id}' not found`);
      }
    });


    setPigSetupEnabled(true);
    syncPigPanelChrome();
    renderSuggestionSummary();
    randomizeTitle();
    showScreen("home");
    generateSport();
    generateIcons();
    console.debug("[Debug] Initial UI setup complete.");
  });
