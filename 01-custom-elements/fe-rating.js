class FeRating extends HTMLElement {
  constructor() {
    super();

    this.emojiList = [];

    this.setStyles();
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
    this.setAttribute("rating", 3);
    this.setAttribute("role", "range");

    for (let i = 0; i < numberOfElements; i++) {
      const emojiElement = document.createElement("i");
      emojiElement.innerHTML = "⭐";
      this.appendChild(emojiElement);
      this.emojiList = [...this.emojiList, emojiElement];
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
