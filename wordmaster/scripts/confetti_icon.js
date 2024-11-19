const confetti_icon = document.querySelector('.confetti_icon')

popmotion.animate({
  from: '22px',
  to: '100px',
  repeat: 1,
  repeatType: 'mirror',
  type: 'spring',
  onUpdate(update) {
    confetti_icon.style.top = update
  },
})
