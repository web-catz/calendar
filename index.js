const contextmenu = document.getElementById("contextmenu");
oncontextmenu = () => {return false};

class CalendarEvent extends HTMLElement {
  name = "";
  day;
  tag;

  label;
  constructor(day, color = options.defaultTag) {
    super();
    this.day = day, this.tag = color, this.className = color, this.ondblclick = this.openUI, this.oncontextmenu = openContextMenu;
    this.append(
      create("div", {class: "event-resize"}),
      create("div", {class: "event-color"}),
      this.label = create("input", {
        class: "event-label", type: "text", placeholder: "event name...",
        onkeydown: blurOnEnter, onfocus: this.onFocus, onblur: this.onBlur, oninput: this.onNameInput,
      }),
      create("div", {class: "event-resize"})
    );
  }

  focus() {this.label.focus()}
  blur() {this.label.blur()}
  onFocus() {if (options.openEventOnFocus) this.parentElement.openUI()}
  onBlur() {
    if (this.parentElement.name) this.scrollTo(0, 0);
    else this.parentElement.remove();
  }
  onNameInput(e) {this.parentElement.name = e.target.value}
  
  remove() {
    this.animate({opacity: "0", scale: "0.75"}, 25).finished.then(() => super.remove());
    this.day.events.splice(this.day.events.indexOf(this), 1);
  }

  openUI() {
    if (!this.name) return;
    this.blur();
    openModal([
      create("input", {class: "modal-title", type: "text", placeholder: "event name...", value: this.name, oninput: e => {this.name = e.target.value, this.label.value = e.target.value}}),
      create("dl", {children: [
        create("dt", {text: "date:"}),
        create("dd", {text: this.day.date.getDate() + " " + new Intl.DateTimeFormat("en-US", {month: "long"}).format(this.day.date) + ", " + this.day.date.getFullYear()}),
        create("dt", {text: "tag:"}),
        create("dd", {children: [new TagSelect(this.tag, this)]})
      ]})
    ]);
  }
}

class CalendarDay extends HTMLElement {
  date = new Date;
  events = [];
  constructor(events) {
    super();
    this.onclick = this.onClick, this.oncontextmenu = openContextMenu;
    if (events) {
      this.events = events;
      for (const event of events) this.appendChild(event);
    }
  }

  addEvent() {
    var el = this.appendChild(new CalendarEvent(this));
    this.events.push(el);
    el.focus();
  }
  onClick(e) {if (this == e.target) this.addEvent()}
  remove() {
    super.remove();
    delete data[date];
  }
}

class CalendarMonth extends HTMLElement {
  days = [];
  constructor(idx = 0, days) {
    super();
    if (days) this.append(...days);
    else for (let i = 0; i < 31; i++) this.appendChild(new CalendarDay);
    document.getElementById("calendar").appendChild(this);
  }
}

class TagSelect extends HTMLElement {
  constructor(tag = options.defaultTag, target) {
    super();
    this.className = tag;
    var options = [];
    for (const color of ["red", "orange", "yellow", "green", "blue", "purple", "brown"]) options.push(create("option", {text: color, selected: tag == color}));
    var select = this.appendChild(create("select", {children: options, onchange: this.onChange}));
    if (target) select.addEventListener("change", () => target.tag = this.value);
  }
  onChange() {this.parentElement.className = this.value}
}

window.customElements.define("c-event", CalendarEvent);
window.customElements.define("c-day", CalendarDay);
window.customElements.define("c-month", CalendarMonth);
window.customElements.define("tag-select", TagSelect);

new CalendarMonth;


function create(tag, options = {}) {
  let el = document.createElement(tag);
  // tag-specific
  if (tag == "input") el.onkeydown = blurOnEnter;
  // properties
  if (options.text) el.textContent = getAndDelete(options.text);
  if (options.class) el.className = getAndDelete(options.class);
  if (options.children) for (const child of getAndDelete(options.children)) el.appendChild(child);
  for (const property in options) el[property] = options[property];
  return el;

  function getAndDelete(property) {var value = property; delete property; return value}
}

function blurOnEnter(e) {if (e.key == "Enter") e.target.blur()}

var modal;
function openModal(children) {
  modal = document.body.appendChild(create("div", {
    class: "modal-wrapper",
    onclick: closeModal,
    children: [create("div", {
      class: "modal",
      onclick: e => e.stopPropagation(),
      children: children,
    })]
  }));
  return modal;
}
function closeModal() {
  modal.animate({opacity: "0"}, 50).finished.then(() => {
    modal.remove();
    modal = null;
  });
}


function openDialog(el) {
  el.classList.remove("hidden");
  if (el == contextmenu) addEventListener("click", closeContextMenu, {once: true});
  else addEventListener("click", () => el.classList.add("hidden"), {once: true});
}

function openContextMenu(e) {
  e.stopPropagation();
  contextmenu.style.left = e.x + "px", contextmenu.style.top = e.y + "px";
  // options
  contextmenu.textContent = "";
  for (let el = e.currentTarget; el != document.body; el = el.parentElement) switch (el.tagName) {
    case "C-EVENT": addContextMenuOption("remove event", () => el.remove()); break;
    case "C-DAY": addContextMenuOption("add event", () => el.addEvent()); break;
  }
  // opening
  openDialog(contextmenu);
  return false;
}
function closeContextMenu() {
  if (!contextmenu.classList.contains("hidden")) {
    contextmenu.animate({scale: "0.75", opacity: "0"}, 50).finished.then(() => contextmenu.classList.add("hidden"));
  }
}
function addContextMenuOption(text, onclick) {
  contextmenu.appendChild(create("button", {text: text, onclick: onclick}));
}


document.getElementById("default-tag").firstChild.addEventListener("change", e => options.defaultTag = e.target.value);
document.getElementById("save").onclick = saveToCookie;
document.getElementById("delete").onclick = () => {
  openModal([
    create("div", {text: "Are you sure you want to delete all your data?"}),
    create("button", {text: "Yes", onclick: () => {closeModal(); deleteCookies()}}),
    create("button", {text: "No", onclick: closeModal})
  ]).firstElementChild.classList.add("confirmation");
};