
document.addEventListener("DOMContentLoaded", function() {

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

    hideElement(document.getElementById("aiRollOutput"));
    hideElement(document.getElementById("aiTotalOutput"));

    function hideElement(element) {
      if(element && element.style) element.style.display = "none";
    }

    function showAiTotalOutputElement(aiTotal = 0, aiRolls = []) {
      const aiTotalElem = document.getElementById("aiTotalOutput"); 
        aiTotalElem.textContent = `Total: ${aiTotal}`;
        aiTotalElem.style.display = "block";
      
      const aiRollElem = document.getElementById("aiRollOutput");
      if (aiRollElem && aiRolls.length > 0) {  
        aiRollElem.textContent = `Rolls: ${aiRolls.join(", ")}`;
        aiRollElem.style.display = "block";
      }
      console.debug("[Debug] showAiTotalOutputElement -> aiTotal:", aiTotal, "aiRolls:", aiRolls);
    }

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
      const item = nextTriviaItem();
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

    let pigPlaying = false;

    function playPig() {
      if (pigPlaying) {
        endPig();
        return;
      }


      pigPlaying = true;
      document.getElementById("pigBtn").textContent = "Stop Pig";
      showAiTotalOutputElement(0, []);
      let total = 0;
      let rolls = [];
      const maxRolls = 10;
      let finished = false;
      async function pigTurn() {
        for (let i = 0; i < maxRolls; ++i) {
          if (!pigPlaying) {
            showAiTotalOutputElement(0, []);
            return;
          }

          const roll = rand(1, 6);

          rolls.push(roll);

          if (roll === 1) {
            total = 0;
            showAiTotalOutputElement(0, rolls);
            finished = true;
            console.debug("[Debug] playPig rolled a 1 -> bust/reset");
            break;
          } else {
            total += roll;
            showAiTotalOutputElement(total, rolls);
          }

          if (total >= 100) {
            finished = true;
            break;
          }

          await new Promise(res => setTimeout(res, 450));
        }
        if (!finished) {
          showAiTotalOutputElement(total, rolls);
        }
        if (pigPlaying) {
          pigPlaying = false;
          document.getElementById("pigBtn").textContent = "Play Pig";
        }
      }
pigTurn();
    }

    function endPig() {
      pigPlaying = false;
      document.getElementById("pigBtn").textContent = "Play Pig";
      hideElement(document.getElementById("aiRollOutput"));
      hideElement(document.getElementById("aiTotalOutput"));
      console.debug("[Debug] endPig -> reset displays");
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
        "Neo", "Pixel", "Shadow", "Turbo", "Lucky", "Nova", "Frost", "Solar", "Echo", "Blaze", "Toilet", "Strong", "Substantial", "Slime"
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
      const firstNames = ["John", "Jane", "Jim", "Jill", "Jack", "Amauri", "Michael", "Isaac", "Isabella", "James", "Vlad", "Jonesey", "Kanye", "Tyler", "Drake", "Kendrick", "Jermaine", "Kanye", "Tyler", "Drake", "Kendrick", "Cole", "Jose", "Peter", "John", "Jane", "Jim", "Jill", "Jack", "Amauri", "Michael", "Isaac", "Isabella", "James", "Vlad", "Jonesey", "Kanye", "Tyler", "Drake", "Kendrick", "Jermaine", "Kanye", "Tyler", "Drake", "Kendrick", "Cole", "Jose", "Peter", "Juan", "Fudge"];
      const lastNames = ["Smith", "Johnson", "Williams", "Cole", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez", "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson", "Thomas", "Taylor", "Moore", "Jackson", "Martin", "Lee", "Perez", "Thompson", "White", "Harris", "Sanchez", "Clark", "Ramirez", "Lewis", "Robinson", "Walker", "Young", "Allen", "King", "Wright", "Scott", "Torres", "Nguyen", "Hill", "Flores", "Green", "Adams", "Nelson", "Baker", "Hall", "Rivera", "Campbell", "Mitchell", "Carter", "Roberts", "McLaughlin", "Hermann", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez", "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson", "Thomas", "Taylor", "Moore", "Jackson", "Martin", "Lee", "Perez", "Thompson", "White", "Harris", "Sanchez", "Clark", "Ramirez", "Lewis", "Robinson", "Walker", "Young", "Allen", "King", "Wright", "Scott", "Torres", "Nguyen", "Hill", "Flores", "Green", "Adams", "Nelson", "Baker", "Hall", "Rivera", "Campbell", "Mitchell", "Carter", "Roberts", "McLaughlin", "Hermann", "Palmer", "Davis", "Rodriguez", "Martinez", "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson", "Thomas", "Taylor", "Moore", "Jackson", "Martin", "Lee", "Perez", "Thompson", "White", "Harris", "Sanchez", "Clark", "Ramirez", "Lewis", "Robinson", "Walker", "Young", "Allen", "King", "Wright", "Scott", "Torres", "Nguyen", "Hill", "Flores", "Green", "Adams", "Nelson", "Baker", "Hall", "Rivera", "Campbell", "Mitchell", "Carter", "Roberts", "McLaughlin", "Hermann", "Palmer", "DeRooy", "Harris", "Cabrera", "Walkington III"];
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
        console.debug("[Debug] randomScreenBtn picked:", key);
        if (key === "trivia") nextTriviaQuestion();
      });
    } else {
      console.warn("[Debug] randomScreenBtn not found");
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
    ];


    eventBindings.forEach(([id, evt, fn]) => {
      const el = document.getElementById(id);
      if(el) {
        el.addEventListener(evt, function(ev) {
          console.debug(`[Debug] Button #${id} event:`, evt, ev);
          fn(ev);
        });
      } else {
        console.warn(`[Debug] eventBindings: Element with id '${id}' not found`);
      }
    });

    randomizeTitle();
    showScreen("home");
    generateSport();
    generateIcons();
    console.debug("[Debug] Initial UI setup complete.");
  });
