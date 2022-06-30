/**
 * A deliberatly slow operation to test performance between blocking and non-blocking execution
 * @param {number} initialVal
 * @returns {number}
 */
function expensiveOp(initialVal) {
  let i = initialVal
  let sqRt = 0

  while (i < 10000000) {
    sqRt = Math.sqrt(i)
    i++
  }

  return sqRt
}

export { expensiveOp }
