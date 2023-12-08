var options = {
  defaultTag: "blue",
  openEventOnFocus: false,
}, data = {};

if (document.cookie) {
  var cookies = {};
  for (const pair of document.cookie.split("; ")) cookies[pair.substring(0, pair.indexOf("="))] = pair.substring(pair.indexOf("=") + 1);
  for (const key in options) if (cookies[key]) options[key] = cookies[key];
}

function saveToCookie() {
  for (const key in options) document.cookie = key + "=" + options[key];
  for (const event in events) {

  }
}
function deleteCookie(name) {document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:01 GMT"}
function deleteCookies() {for (const pair of document.cookie.split("; ")) deleteCookie(pair.substring(0, pair.indexOf("=")))}

function saveToFile() {
  var file = new Blob([JSON.stringify(data)], {type: "text/plain"});
  url = URL.createObjectURL(file);
  let a = create("a", {href: url, download: "calendar.json"});
  document.body.appendChild(a).click();
  setTimeout(() => {a.remove(); window.URL.revokeObjectURL(url)}, 0);
}