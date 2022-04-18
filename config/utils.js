const shuffleArray = array => {
  array.forEach((elem, i) => {
    const j = Math.floor(Math.random() * (i+ 1))
    const temp = array[i]
    array[i] = array[j]
    array[j] = temp;
  })
}

module.exports = shuffleArray