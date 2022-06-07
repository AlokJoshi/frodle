const myalert = {}

myalert.show = function (alertheading, alerttext) {
  const template = document.querySelector('[myalert]')
  const myalert = template.content.cloneNode(true).children(2)
  myalert.querySelector('[alertok]').addEventListener('click', (event) => {
    this.parent.classList.add('hidden')
  })
  myalert.querySelector['alertheading'].innerText = alertheading
  myalert.querySelector['alerttext'].innerText = alerttext
  myalert.classList.remove('hidden')
  myalert.classList.add('alert')
}
export {
  myalert
}