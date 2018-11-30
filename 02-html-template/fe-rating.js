class FeRating extends HTMLElement {
  constructor() {
    super();

    this.emojiList = [];
    this.container = null;
  }

  async connectedCallback() {
    await this.setMarkUp();
    this.container = document.querySelector("#rating");

    await this.setTemplate();

    await this.setStyles();

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

    if (!this.container) {
      return;
    }

    while (this.container.hasChildNodes()) {
      this.container.removeChild(this.container.firstChild);
    }

    this.setStyles();

    this.highlight(this.rating);

    this.emojiList.forEach(emoji => this.container.appendChild(emoji));
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

  async setMarkUp() {
    this.innerHTML = await this.getFileText("fe-rating.markup.html");
  }

  async setTemplate() {
    const template = await this.getFileText("fe-rating.template.html");
    this.container.innerHTML += template;
  }

  async setStyles() {
    const styles = document.createElement("style");
    styles.innerHTML = await this.getFileText("fe-rating.css");
    this.appendChild(styles);
  }

  async getFileText(path) {
    const response = await fetch(path);
    const template = await response.text();
    return template;
  }

  buildRange(numberOfElements) {
    const template = document.querySelector("#icon-template");

    if (!template) {
      return;
    }

    this.emojiList = [];

    for (let i = 0; i < numberOfElements; i++) {
      const clone = template.content.cloneNode(true);
      const element = clone.querySelector("i");

      this.container.appendChild(element);

      this.emojiList = [...this.emojiList, element];
    }
  }

  highlight(rating) {
    this.emojiList.forEach((emoji, index) => {
      emoji.classList.toggle("active", index < rating);
    });
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
