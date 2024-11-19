console.log('Mobile input script loaded!')

// Mobile Input Handler
const virtualKeyboard = document.getElementById('virtualKeyboard')
const keyboardToggle = document.getElementById('keyboardToggle')
let isVirtualKeyboardVisible = false

// Keyboard Layout
const keyboardLayout = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
  ['Z', 'X', 'C', 'V', 'B', 'N', 'M', '⌫'],
]

// Create Virtual Keyboard
function createVirtualKeyboard() {
  keyboardLayout.forEach((row, rowIndex) => {
    const rowDiv = document.createElement('div')
    rowDiv.className = 'keyboard-row'

    row.forEach((key) => {
      const button = document.createElement('button')
      button.className = 'virtual-key'
      button.textContent = key
      button.setAttribute('data-key', key)
      button.addEventListener('click', () => {
        if (key === '⌫') {
          document.dispatchEvent(
            new KeyboardEvent('keydown', {
              key: 'Backspace',
              code: 'Backspace',
              keyCode: 8,
              which: 8,
              bubbles: true,
              cancelable: true,
            })
          )
        } else {
          document.dispatchEvent(
            new KeyboardEvent('keydown', {
              key: key.toLowerCase(),
              code: 'Key' + key.toUpperCase(),
              keyCode: key.charCodeAt(0),
              which: key.charCodeAt(0),
              bubbles: true,
              cancelable: true,
            })
          )
        }
      })
      rowDiv.appendChild(button)
    })

    virtualKeyboard.appendChild(rowDiv)
  })
}

// Toggle Virtual Keyboard
function toggleVirtualKeyboard() {
  isVirtualKeyboardVisible = !isVirtualKeyboardVisible
  virtualKeyboard.style.display = isVirtualKeyboardVisible ? 'block' : 'none'
}

// Add click handler to keyboard toggle button
if (keyboardToggle) {
  keyboardToggle.addEventListener('click', toggleVirtualKeyboard)
}

// Initialize virtual keyboard
createVirtualKeyboard()

// Hide virtual keyboard by default
virtualKeyboard.style.display = 'none'

// Add balloon sound to balloon event
const balloonSound = new Audio('./sounds/waterballoon_event.mp3')

// Save original functions
const originalToggleInlineBalloon = window.toggleInlineBalloon

// Override balloon toggle with sound
window.toggleInlineBalloon = function () {
  balloonSound.currentTime = 0
  balloonSound.play()
  if (typeof originalToggleInlineBalloon === 'function') {
    originalToggleInlineBalloon()
  }
}

// Add sound to lose screen by overriding init function
const originalInit = window.init
if (typeof originalInit === 'function') {
  window.init = async function () {
    const result = await originalInit()

    // After init completes, modify the lose condition to include balloon sound
    const originalCommit = window.commit
    if (typeof originalCommit === 'function') {
      window.commit = async function () {
        const result = await originalCommit()
        if (!game_win && currentRow === ROUNDS) {
          // Play balloon sound when game is lost
          balloonSound.currentTime = 0
          balloonSound.play()
          // Show water balloon animation
          showWaterBalloon()
        }
        return result
      }
    }

    return result
  }
}
