const firebaseConfig = {
  apiKey: "AIzaSyDP-YOO53M447cadmvzX8Q2B-aBTfPgnzE",
  authDomain: "select-plugin.firebaseapp.com",
  databaseURL: "https://select-plugin.firebaseio.com",
  projectId: "select-plugin",
  storageBucket: "select-plugin.appspot.com",
  messagingSenderId: "1076629816261",
  appId: "1:1076629816261:web:e5f79076422da1545d01ac",
  measurementId: "G-HXFNMZH2JR"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

const db = firebase.firestore();

const log = document.getElementById('log');

class Select {
  constructor({ selector, label, url }) {
    this.settings = {
      selector,
      label,
      url
    };

    this.root = document.querySelector(this.settings.selector);
    this.output = document.createElement("div");
    this.outputText = document.createTextNode("");
    this.outputLabel = document.createElement("span");
    this.arrow = document.createElement("div");
    this.listWrapper = document.createElement("div");
    this.list = document.createElement("ul");
    this.loader = document.createElement("div");
    this.selections = [];
    this.selected = null;

    this.closeSelect = e => {
      if (e.target !== this.output) {
        this.close();
      }
    };

    this.openSelect = e => {
      e.stopPropagation();
      this.open();
    };

    this.setSelect = e => {
      this.output.childNodes[1].textContent = e.target.getAttribute(
        "value"
      );
      this.selected = e.target.getAttribute("data-index");
    }

    this.init();
  }

  async init() {
    if ([...this.root.classList].includes('select__wrapper')) throw new Error('This element is already in use!');

    this.root.className = "select__wrapper";
    this.output.className = "select__output";
    this.outputLabel.className = "select__output-label";
    this.listWrapper.className = "select__list-wrapper";
    this.arrow.className = "select__arrow-up";
    this.list.className = "select__list";
    this.loader.className = "select__loader";

    this.outputLabel.innerText = this.settings.label;
    this.listWrapper.appendChild(this.loader);
    this.root.append(this.output, this.listWrapper);
    this.output.append(this.outputLabel, this.outputText, this.arrow);

    document.addEventListener(
      "click",
      this.closeSelect
    );

    this.output.addEventListener(
      "click",
      this.openSelect
    );

    await db
      .collection("selections")
      .get()
      .then(snapshot => {
        snapshot.forEach(doc => this.selections.push(doc.data().name));

        if (this.selections.length) {
          let selectionList = (() => {
            return this.selections.map((selection, index) => {
              let selectionElement = document.createElement("li");
              selectionElement.setAttribute("data-index", `${index}`);
              selectionElement.setAttribute("value", `${selection}`);
              selectionElement.setAttribute("class", "select__list-item");
              selectionElement.innerText = selection;

              return selectionElement;
            });
          })();

          selectionList.forEach(item => this.list.appendChild(item));

          this.loader.remove();
          this.listWrapper.appendChild(this.list);

          this.list.addEventListener(
            "click",
            this.setSelect
          );
        }
      });
  }

  open() {
    this.arrow.classList.add("select__arrow-up--focused");
    this.outputLabel.classList.add("select__output-label--small");
    this.listWrapper.classList.add("select__list-wrapper--show");
  }

  close() {
    if (this.output.childNodes[1].nodeValue === "") {
      this.outputLabel.classList.remove("select__output-label--small");
    } else {
      this.outputLabel.classList.add("select__output-label--selected");
    }

    this.arrow.classList.remove("select__arrow-up--focused");
    this.listWrapper.classList.remove("select__list-wrapper--show");
  }

  setIndex(position) {
    this.selected = position - 1;

    if (this.selections[this.selected] !== undefined) {
      this.outputLabel.classList.add("select__output-label--small");
      this.outputLabel.classList.add("select__output-label--selected");
      this.output.childNodes[1].textContent = this.selections[this.selected];
    }
  }

  getSelected() {
    return {value: this.selections[this.selected]}
  }

  clear() {
    this.selected = null;
    this.output.childNodes[1].textContent = "";
    this.outputLabel.classList.remove("select__output-label--small");
    this.outputLabel.classList.remove("select__output-label--selected");
  }

  destroy() {
    document.removeEventListener("click", this.closeSelect);
    this.output.removeEventListener("click", this.openSelect);
    this.list.removeEventListener("click", this.setSelect);

    this.root.removeAttribute('class');
    this.root.innerText = "";
  }
}

const select = new Select({
  selector: "#select",
  label: "Select technology",
  url: "https://vladilen-dev.firebaseio.com/technologies.json"
});


document.addEventListener("click", function(e) {
  if (e.target === document.querySelector('[data-type="open"]')) {
    select.open();
    log.innerText = "Opened";
  }

  if (e.target === document.querySelector('[data-type="close"]')) {
    select.close();
    log.innerText = "Closed";
  }

  if (e.target === document.querySelector('[data-type="set"]')) {
    select.setIndex(5);
    log.innerText = "Selected index set to 5";
  }
  if (e.target === document.querySelector('[data-type="get"]')) {
    select.getSelected();
    log.innerText = `${select.getSelected().value} is selected`;
  }

  if (e.target === document.querySelector('[data-type="clear"]')) {
    select.clear();
    log.innerText = "Cleared";
  }

  if (e.target === document.querySelector('[data-type="destroy"]')) {
    select.destroy();
    log.innerText = "Destroyed";
  }
});
