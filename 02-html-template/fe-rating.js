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

  async getFileText(path) {
    const response = await fetch(path);
    const template = await response.text();
    return template;
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

  buildRange(numberOfElements) {
    const template = document.querySelector("#icon-template");

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
    this.addEventListener("mousemove", function highlightHoveredItems(event) {
      const hoveredRange = this.getRangeFromEvent(event);
      this.highlight(hoveredRange);
    });

    this.addEventListener("mouseout", function resetHighlight() {
      this.highlight(this.rating);
    });
  }

  setClickBehaviour() {
    this.addEventListener("click", function updateRating(event) {
      updateRange.call(this, event);
      dispatchRateEvent.call(this, event);
    });

    function updateRange(event) {
      const range = this.getRangeFromEvent(event);
      this.rating = range;
    }

    function dispatchRateEvent(event) {
      const rating = this.getRangeFromEvent(event);
      const rateEvent = new CustomEvent("rate", { detail: rating });
      this.dispatchEvent(rateEvent);
    }
  }

  getRangeFromEvent(event) {
    const box = this.getBoundingClientRect();
    const hoveredRange = Math.floor(
      ((event.pageX - box.left) / box.width) * this.emojiList.length
    );
    return hoveredRange + 1;
  }
}

customElements.define("fe-rating", FeRating);
