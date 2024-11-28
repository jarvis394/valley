// source: http://stackoverflow.com/questions/95727/how-to-convert-floats-to-human-readable-fractions
const dec2frac = (d: number) => {
  let df = 1
  let top = 1
  let bot = 1

  while (df !== d) {
    if (df < d) {
      top += 1
    } else {
      bot += 1
      top = Number.parseInt((d * bot).toString())
    }
    df = top / bot
  }
  return top + '/' + bot
}

export default dec2frac
