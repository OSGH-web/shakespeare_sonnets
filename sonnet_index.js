const static = {
  sonnets: sonnets,
  elements: {
    poemBodyTemplate: document.getElementById("poem-body-template"),
    poem99BodyTemplate: document.getElementById("poem-body-template-99"),
    poemBodyContainerElement: document.getElementById("poem-body"),
    poemBodyRContainerElement: document.getElementById("poem-body-r"),
    pageTemplate: document.getElementById("page-template"),
    decrementControl: document.getElementById("decrement-control"),
    incrementControl: document.getElementById("increment-control"),
    toggleViewButton: document.getElementById("toggle-view"),
    toggleDarkModeButton: document.getElementById("dark-mode-toggle"),
  },
};

let state = {
  index: 0,
  blogView: false,
  darkMode: false,
  controlsHidden: false,
  secondPageHidden: false,

  scrolled: false,
};

function initialize() {
  // load state from URL params
  function parseBooleanFromUrl(paramValue) {
    if (paramValue === null) {
      return false;
    }
    const lowerCaseValue = paramValue.toLowerCase();
    if (lowerCaseValue === "true" || lowerCaseValue === "1") {
      return true;
    } else {
      return false;
    }
  }

  const urlParams = new URLSearchParams(window.location.search);
  const sonnetNumberFromUrl = urlParams.get("sonnet");

  if (sonnetNumberFromUrl) {
    const sonnetIndex = parseInt(sonnetNumberFromUrl) - 1;
    if (sonnetIndex >= 0 && sonnetIndex < sonnets.length) {
      state.index = sonnetIndex;
    }
  }
  state.blogView = parseBooleanFromUrl(urlParams.get("blogView"));
  state.darkMode = parseBooleanFromUrl(urlParams.get("darkMode"));
  state.controlsHidden = parseBooleanFromUrl(urlParams.get("controlsHidden"));

  // add event listeners to static elements
  static.elements.decrementControl.addEventListener("click", () => {
    // save our position if we're in blog view
    if (state.blogView) {
      updateIndex(getTopHeader());
    }
    updateIndex(state.index - 1);
    scrollToCurrentSonnet();
  });

  static.elements.incrementControl.addEventListener("click", () => {
    // save our position if we're in blog view
    if (state.blogView) {
      updateIndex(getTopHeader());
    }
    updateIndex(state.index + 1);
    scrollToCurrentSonnet();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft" || event.key === "h") {
      // save our position if we're in blog view
      if (state.blogView) {
        updateIndex(getTopHeader());
      }
      updateIndex(state.index - 1);
      scrollToCurrentSonnet();
    } else if (event.key === "ArrowRight" || event.key === "l") {
      // save our position if we're in blog view
      if (state.blogView) {
        updateIndex(getTopHeader());
      }
      updateIndex(state.index + 1);
      scrollToCurrentSonnet();
    }

    if (event.key === "v") {
      toggleBlogView();
    }

    if (event.key === "d") {
      toggleDarkMode();
    }

    if (event.key === "c") {
      toggleControlsHidden();
    }

    if (event.key === "s") {
      toggleSecondPageHidden();
    }
  });

  let previousWindowWidth = window.innerWidth;
  window.addEventListener("resize", () => {
    const boundaryWidths = [
      735, 685, 625, 590, 540, 510, 470, 435, 400, 365, 330,
    ];
    boundaryWidths.forEach((boundaryWidth) => {
      if (
        window.innerWidth <= boundaryWidth &&
        previousWindowWidth > boundaryWidth
      ) {
        scrollToCurrentSonnet();
      } else if (
        window.innerWidth >= boundaryWidth &&
        previousWindowWidth < boundaryWidth
      ) {
        scrollToCurrentSonnet();
      }
    });
    previousWindowWidth = window.innerWidth;
  });

  static.elements.toggleViewButton.addEventListener("click", toggleBlogView);
  static.elements.toggleDarkModeButton.addEventListener(
    "click",
    toggleDarkMode,
  );
}

function getTopHeader() {
  const headers = document.querySelectorAll("[data-role=sonnet-number-header]");
  let topElement = null;
  let minDistance = Infinity;

  headers.forEach((header) => {
    const rect = header.getBoundingClientRect();
    if (rect.bottom <= window.innerHeight && rect.bottom >= 0) {
      const distance = Math.abs(rect.top);
      if (distance < minDistance) {
        minDistance = distance;
        topElement = header;
      }
    }
  });

  return parseInt(topElement.innerText) - 1;
}

function updateIndex(idx) {
  state.index = idx;
  if (state.index === -1) {
    state.index = sonnets.length - 1;
  }
  if (state.index === sonnets.length) {
    state.index = 0;
  }
  render();
}

function toggleBlogView() {
  state.blogView = !state.blogView;

  // save our position if we're leaving blog view
  if (!state.blogView) {
    updateIndex(getTopHeader());
  }

  render();
  scrollToCurrentSonnet();
}

function scrollToCurrentSonnet() {
  if (state.blogView) {
    const sonnets = document.querySelectorAll(".sonnet");
    const newSonnetElement = sonnets[state.index];
    if (newSonnetElement) {
      newSonnetElement.scrollIntoView({ behavior: "instant" });
    }
  }
}

function toggleDarkMode() {
  state.darkMode = !state.darkMode;
  render();
}

function toggleControlsHidden() {
  state.controlsHidden = !state.controlsHidden;
  render();
}

function toggleSecondPageHidden() {
  state.secondPageHidden = !state.secondPageHidden;
  render();
}

function renderBlogView() {
  static.elements.poemBodyContainerElement.innerHTML = "";
  // we don't render to the right side in blog view
  static.elements.poemBodyRContainerElement.innerHTML = null;

  static.sonnets.forEach((sonnet, index) => {
    const isSonnet99 = index === 98 || sonnet.length === 15;
    const template = isSonnet99
      ? static.elements.poem99BodyTemplate
      : static.elements.poemBodyTemplate;
    const poemBodyElement = template.content.cloneNode(true);
    poemBodyElement.id = `sonnet-${index + 1}`;

    headerElement = poemBodyElement.querySelector(
      "[data-role=sonnet-number-header]",
    );
    headerElement.innerText = `${index + 1}`;
    headerElement.addEventListener("click", () => {
      updateIndex(index);
      scrollToCurrentSonnet();
    });

    for (i = 0; i < sonnet.length; i++) {
      const line = sonnet[i];
      const rowElement = poemBodyElement.querySelector(`[data-role=row-${i}]`);
      rowElement.innerText = line;
    }

    static.elements.poemBodyContainerElement.appendChild(poemBodyElement);
  });
}

function renderNormalView(right) {
  let index = state.index;
  if (right) {
    index += 1;
    if (index === static.sonnets.length) {
      static.elements.poemBodyRContainerElement.innerHTML = null;
      return;
    }
  }

  const currentSonnet = sonnets[index];

  const isSonnet99 = index === 98 || currentSonnet.length === 15;
  const template = isSonnet99
    ? static.elements.poem99BodyTemplate
    : static.elements.poemBodyTemplate;
  const poemBodyElement = template.content.cloneNode(true);

  headerElement = poemBodyElement.querySelector(
    "[data-role=sonnet-number-header]",
  );
  headerElement.innerText = `${index + 1}`;

  let poemBodyContainerElement = static.elements.poemBodyContainerElement;
  if (!right) {
    static.elements.poemBodyContainerElement.innerHTML = null;
    static.elements.poemBodyContainerElement.appendChild(poemBodyElement);
  } else {
    static.elements.poemBodyRContainerElement.innerHTML = null;
    static.elements.poemBodyRContainerElement.appendChild(poemBodyElement);

    poemBodyContainerElement = static.elements.poemBodyRContainerElement;
  }

  for (i = 0; i < currentSonnet.length; i++) {
    const line = currentSonnet[i];
    const rowElement = poemBodyContainerElement.querySelector(
      `[data-role=row-${i}]`,
    );
    rowElement.innerText = line;
  }
}

function render() {
  document.body.classList.toggle("blog-view", state.blogView);
  static.elements.toggleViewButton.textContent = state.blogView ? "NV" : "BV";

  document.body.classList.toggle("dark-mode", state.darkMode);
  static.elements.toggleDarkModeButton.textContent = state.darkMode ? "☼" : "☾";

  document.body.classList.toggle("controls-hidden", state.controlsHidden);

  document.body.classList.toggle("second-page-hidden", state.secondPageHidden);

  if (state.blogView) {
    renderBlogView();
  } else {
    renderNormalView();
    if (!state.secondPageHidden) {
      renderNormalView(true);
    }
  }

  // Update URL
  const newUrl = `${window.location.pathname}?sonnet=${state.index + 1}&blogView=${state.blogView}&darkMode=${state.darkMode}&controlsHidden=${state.controlsHidden}`;
  if (newUrl !== window.location.href) {
    history.pushState({ sonnet: state.index + 1 }, "", newUrl);
  }
}

initialize();
render();
scrollToCurrentSonnet();
