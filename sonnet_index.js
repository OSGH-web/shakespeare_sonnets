const static = {
  sonnets: sonnets,
  elements: {
    sonnetNumberHeaderElement: document.getElementById("sonnet-number-header"),
    poemBodyContainerElement: document.getElementById("poem-body"),
    poemBodyTemplate: document.getElementById("poem-body-template"),
    poem99BodyTemplate: document.getElementById("poem-body-template-99"),
    decrementControl: document.getElementById("decrement-control"),
    incrementControl: document.getElementById("increment-control"),
  },
};

let state = {
  index: 0,
};

function initialize() {
  // Parse the sonnet number from the URL on page load
  const urlParams = new URLSearchParams(window.location.search);
  const sonnetNumberFromUrl = urlParams.get("sonnet");

  if (sonnetNumberFromUrl) {
    const sonnetIndex = parseInt(sonnetNumberFromUrl) - 1;
    if (sonnetIndex >= 0 && sonnetIndex < sonnets.length) {
      state.index = sonnetIndex;
    }
  }

  // add event listeners to static elements
  static.elements.decrementControl.addEventListener("click", () => {
    updateIndex(state.index - 1);
  });

  static.elements.incrementControl.addEventListener("click", () => {
    updateIndex(state.index + 1);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft") {
      updateIndex(state.index - 1);
    } else if (event.key === "ArrowRight") {
      updateIndex(state.index + 1);
    }
  });
}

function updateIndex(idx) {
  state.index = idx;
  if (state.index === -1) {
    state.index = sonnets.length - 1;
  }
  if (state.index === sonnets.length) {
    state.index = 0;
  }
  renderSonnet();
}

function renderSonnet() {
  const currentSonnet = sonnets[state.index];

  static.elements.sonnetNumberHeaderElement.innerText = `${state.index + 1}`;

  let poemBodyElement =
    static.elements.poemBodyTemplate.content.cloneNode(true);
  if (state.index === 98) {
    poemBodyElement =
      static.elements.poem99BodyTemplate.content.cloneNode(true);
  }

  static.elements.poemBodyContainerElement.innerHTML = null;
  static.elements.poemBodyContainerElement.appendChild(poemBodyElement);

  for (i = 0; i < currentSonnet.length; i++) {
    const line = currentSonnet[i];
    const rowElement = document.querySelector(`[data-role=row-${i}]`);
    rowElement.innerText = line;
  }

  // Update the address bar with the current sonnet number
  const newUrl = `${window.location.pathname}?sonnet=${state.index + 1}`;
  history.pushState({ sonnet: state.index + 1 }, "", newUrl);
}

initialize();
renderSonnet();
