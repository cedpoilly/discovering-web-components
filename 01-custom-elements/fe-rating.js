class FeRating extends HTMLElement {
  constructor() {
    super();

    this.emojiList = [];
  }

  connectedCallback() {
    this.setStyles();

    this.buildRange(this.max);

    const currentRange = this.getAttribute("rating");
    this.highlight(currentRange);

    this.setHoverBehaviour();
    this.setClickBehaviour();
  }

  static get observedAttributes() {
    return ["rating", "max"];
  }

  attributeChangedCallback(name, oldval, newval) {
    if (oldval === newval) {
      return;
    }

    console.log(`'${name}': ${oldval} -> ${newval}`);

    this.setAttribute(name, newval);

    switch (name) {
      case "max": {
        this.reactToMaxChange();
        break;
      }
      case "rating": {
        this.reactToRatingChange();
        break;
      }
    }
  }

  reactToMaxChange() {
    this.buildRange(this.max);

    while (this.hasChildNodes()) {
      this.removeChild(this.firstChild);
    }

    this.setStyles();

    this.highlight(this.rating);

    this.emojiList.forEach(emoji => this.appendChild(emoji));
  }

  reactToRatingChange() {
    this.highlight(this.rating);
  }

  get rating() {
    return Number(this.getAttribute("rating")) || 0;
  }

  set rating(value) {
    this.setAttribute("rating", value);
  }

  get max() {
    return Number(this.getAttribute("max")) || 5;
  }

  set max(value) {
    this.setAttribute("max", value);
  }

  setStyles() {
    const styles = document.createElement("style");
    styles.innerHTML = `
      i { border-radius: 100%; }

      .active { background: rgb(255, 75, 75); }
      
      .hovered { background: rgb(75, 219, 255); }
    `;
    this.appendChild(styles);
  }

  buildRange(numberOfElements) {
    this.emojiList = [];

    for (let i = 0; i < numberOfElements; i++) {
      const emojiElement = document.createElement("i");
      emojiElement.innerHTML = "⭐";
      this.appendChild(emojiElement);
      this.emojiList = [...this.emojiList, emojiElement];
    }
  }

  highlight(rating) {
    this.emojiList.forEach(toggleActiveClass);

    function toggleActiveClass(emoji, index) {
      emoji.classList.toggle("active", index < rating);
    }
  }

  setHoverBehaviour() {
    this.addEventListener("mousemove", highlightHoveredItems);
    this.addEventListener("mouseout", resetHighlight);

    function highlightHoveredItems(event) {
      const hoveredRange = this.getRatingFromEvent(event);
      this.highlight(hoveredRange);
    }

    function resetHighlight() {
      this.highlight(this.rating);
    }
  }

  setClickBehaviour() {
    this.addEventListener("click", updateRating);

    function updateRating(event) {
      const range = this.getRatingFromEvent(event);
      updateRange.call(this, range);
      dispatchRateEvent.call(this, range);
    }

    function updateRange(rating) {
      this.rating = rating;
    }

    function dispatchRateEvent(rating) {
      const rateEvent = new CustomEvent("rate", { detail: rating });
      this.dispatchEvent(rateEvent);
    }
  }

  getRatingFromEvent(event) {
    const box = this.getBoundingClientRect();
    const hoveredRange = Math.floor(
      ((event.pageX - box.left) / box.width) * this.emojiList.length
    );
    return hoveredRange + 1;
  }
}

customElements.define("fe-rating", FeRating);
