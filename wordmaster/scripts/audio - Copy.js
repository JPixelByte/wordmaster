//Music Functionality
/* jshint esversion: 6 */
let bgmusic = false
let buttonClick = new Audio()
buttonClick.src = './sounds/button_click.mp3'

function buttonFX() {
  buttonClick.play()
}

let halFX = new Audio()
halFX.src = './sounds/hal.mp3'

let slideIn = new Audio()
slideIn.src = './sounds/slidein.mp3'

let slideIn2 = new Audio()
slideIn2.src = './sounds/slidein2.mp3'

let slideIn3 = new Audio()
slideIn3.src = './sounds/slidein3.mp3'

let slideIn4 = new Audio()
slideIn4.src = './sounds/slidein4.mp3'

function hal() {
  halFX.play()
}

function slideInMenu() {
  slideIn.play()
}

function slideInMenu2() {
  slideIn2.play()
}

function slideInMenu3() {
  slideIn3.play()
}

function slideInMenu4() {
  console.log('works')
  slideIn4.play()
}

function toggleMusic() {
  drone_fx.play()
  bgmusic = !bgmusic
  space.play()
  if (!bgmusic) {
    space.pause()
  }
}
