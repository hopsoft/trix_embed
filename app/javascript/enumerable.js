const random = cap => Math.floor(Math.random() * cap)

export const sample = (object, count = null) => {
  const array = [...object]
  if (count === 'all') count = array.length
  const cap = array.length
  const result = []
  const indexes = new Set()
  while (result.length < count) {
    let i = random(cap)
    while (indexes.has(i)) i = random(cap)
    indexes.add(i)
    result.push(array[i])
  }

  return typeof count === 'number' ? result : result[0]
}

export const shuffle = object => sample(object, 'all')
