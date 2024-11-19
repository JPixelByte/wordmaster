const ANSWER_LENGTH = 5
const ROUNDS = 6
const letters = document.querySelectorAll('.scoreboard-letter')
const loadingDiv = document.querySelector('.info-bar')
let game_win = false
let confetti = document.querySelector('.confetti')

let error = new Audio()
error.src = './sounds/error.mp3'

let correct = new Audio()
correct.src = './sounds/correct.mp3'

//Sound for winning the game
let win = new Audio()
win.src = './sounds/youwin.mp3'

//Sound for losing the game
let lose = new Audio()
lose.src = './sounds/youlose.mp3'

let balloon = new Audio()
balloon.src = './sounds/waterballoon_event.mp3'

// I like to do an init function so I can use "await"
async function init() {
  // the state for the app
  let currentRow = 0
  let currentGuess = ''
  let done = false
  let isLoading = true

  // nab the word of the day
  const res = await fetch('https://words.dev-apis.com/word-of-the-day')
  const { word: wordRes } = await res.json()
  const word = wordRes.toUpperCase()
  const wordParts = word.split('')
  isLoading = false
  setLoading(isLoading)

  // user adds a letter to the current guess
  function addLetter(letter) {
    if (currentGuess.length < ANSWER_LENGTH) {
      currentGuess += letter
    } else {
      current = currentGuess.substring(0, currentGuess.length - 1) + letter
    }

    letters[currentRow * ANSWER_LENGTH + currentGuess.length - 1].innerText =
      letter
  }

  // use tries to enter a guess
  async function commit() {
    if (currentGuess.length !== ANSWER_LENGTH) {
      // do nothing
      return
    }

    // check the API to see if it's a valid word
    // skip this step if you're not checking for valid words
    isLoading = true
    setLoading(isLoading)
    const res = await fetch('https://words.dev-apis.com/validate-word', {
      method: 'POST',
      body: JSON.stringify({ word: currentGuess }),
    })
    const { validWord } = await res.json()
    isLoading = false
    setLoading(isLoading)

    // not valid, mark the word as invalid and return
    if (!validWord) {
      markInvalidWord()
      return
    }

    const guessParts = currentGuess.split('')
    const map = makeMap(wordParts)
    let allRight = true

    // first pass just finds correct letters so we can mark those as
    // correct first
    for (let i = 0; i < ANSWER_LENGTH; i++) {
      if (guessParts[i] === wordParts[i]) {
        // mark as correct and play sound
        correct.play()
        letters[currentRow * ANSWER_LENGTH + i].classList.add('correct')
        map[guessParts[i]]--
      }
    }
    // second pass finds close and wrong letters
    // we use the map to make sure we mark the correct amount of
    // close letters
    for (let i = 0; i < ANSWER_LENGTH; i++) {
      if (guessParts[i] === wordParts[i]) {
        // do nothing
      } else if (map[guessParts[i]] && map[guessParts[i]] > 0) {
        // mark as close
        allRight = false
        letters[currentRow * ANSWER_LENGTH + i].classList.add('close')
        map[guessParts[i]]--
      } else {
        // wrong
        allRight = false
        error.play()
        letters[currentRow * ANSWER_LENGTH + i].classList.add('wrong')
      }
    }

    currentRow++
    currentGuess = ''
    if (allRight) {
      game_win = true
      win.play()
      // win
      Swal.fire({
        title: 'Congratulations, you won!',
        icon: 'success',
        imageUrl: './images/youwin.jpg',
        imageWidth: 248,
        imageHeight: 300,
        imageAlt: 'Custom image',
        // footer:
        //   '<a href="wordmaster.htm" target="_self" rel="noopener noreferrer"></a>',
        showClass: {
          popup: `
      animate__animated
      animate__fadeInUp
      animate__faster
    `,
        },
        hideClass: {
          popup: `
      animate__animated
      animate__fadeOutDown
      animate__faster
    `,
        },
      })
      // alert('you win')
      startConfetti()
      document.querySelector('.brand').classList.add('winner')
      done = true
    } else if (currentRow === ROUNDS) {
      lose.play()
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: `You lose! The word was ${word}!`,
        imageUrl: './images/youlose.jpg',
        imageWidth: 400,
        imageHeight: 247,
        imageAlt: 'Custom image',
      }).then(() => {
        showWaterBalloon()
      })
      done = true
      balloon.play()
    }
  }

  // user hits backspace, if the the length of the string is 0 then do
  // nothing
  function backspace() {
    currentGuess = currentGuess.substring(0, currentGuess.length - 1)
    letters[currentRow * ANSWER_LENGTH + currentGuess.length].innerText = ''
  }

  // let the user know that their guess wasn't a real word
  // skip this if you're not doing guess validation
  function markInvalidWord() {
    for (let i = 0; i < ANSWER_LENGTH; i++) {
      letters[currentRow * ANSWER_LENGTH + i].classList.remove('invalid')

      // long enough for the browser to repaint without the "invalid class" so we can then add it again
      setTimeout(
        () => letters[currentRow * ANSWER_LENGTH + i].classList.add('invalid'),
        10
      )
    }
  }

  document.addEventListener('mousedown', stopConfetti)

  // listening for event keys and routing to the right function
  // we listen on keydown so we can catch Enter and Backspace
  document.addEventListener('keydown', function handleKeyPress(event) {
    if (done || isLoading) {
      // do nothing;
      return
    }

    const action = event.key

    if (action === 'Enter') {
      commit()
    } else if (action === 'Backspace') {
      backspace()
    } else if (isLetter(action)) {
      addLetter(action.toUpperCase())
    } else {
      // do nothing
    }
  })
}

// a little function to check to see if a character is alphabet letter
// this uses regex (the /[a-zA-Z]/ part) but don't worry about it
// you can learn that later and don't need it too frequently
function isLetter(letter) {
  return /^[a-zA-Z]$/.test(letter)
}

// show the loading spinner when needed
function setLoading(isLoading) {
  loadingDiv.classList.toggle('hidden', !isLoading)
}

// takes an array of letters (like ['E', 'L', 'I', 'T', 'E']) and creates
// an object out of it (like {E: 2, L: 1, T: 1}) so we can use that to
// make sure we get the correct amount of letters marked close instead
// of just wrong or correct
function makeMap(array) {
  const obj = {}
  for (let i = 0; i < array.length; i++) {
    if (obj[array[i]]) {
      obj[array[i]]++
    } else {
      obj[array[i]] = 1
    }
  }
  return obj
}

// Function to handle water balloon animation
function showWaterBalloon() {
  const canvas = document.getElementById('gameCanvas')
  if (!canvas) return // Safety check

  // Reset any existing state
  if (typeof stopAnimation === 'function') {
    stopAnimation()
  }

  // Make sure canvas is visible and positioned correctly
  canvas.style.display = 'block'
  canvas.style.position = 'fixed'
  canvas.style.top = '50%'
  canvas.style.left = '50%'
  canvas.style.transform = 'translate(-50%, -50%)'
  canvas.style.zIndex = '1'
  canvas.style.pointerEvents = 'none'
  canvas.style.opacity = '1'

  // Ensure canvas is properly sized
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight

  // Start the animation if the function exists
  if (typeof startAnimation === 'function') {
    setTimeout(() => {
      startAnimation()
    }, 100) // Small delay to ensure everything is ready
  }

  // Hide the balloon after animation
  setTimeout(() => {
    if (typeof stopAnimation === 'function') {
      stopAnimation()
    }
    canvas.style.transition = 'opacity 1s'
    canvas.style.opacity = '0'

    // After fade out, hide the canvas completely
    setTimeout(() => {
      canvas.style.display = 'none'
    }, 1000)
  }, 3000)
}

init()
