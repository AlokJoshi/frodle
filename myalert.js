const myalert = {}

myalert.show = function (alertheading, alerttext) {
  const template = document.querySelector('[data-template]')
  const myalert = template.content.cloneNode(true).children[2]
  myalert.querySelector('[alertok]').addEventListener('click', (event) => {
    myalert.classList.add('hidden')
  })
  myalert.querySelector('[alertheading]').innerText = alertheading
  myalert.querySelector('[alerttext]').innerText = alerttext
  myalert.classList.remove('hidden')
  myalert.classList.add('alert')
  document.body.append(myalert)
}
export {
  myalert
}