function createQueue() {
  const items = {}
  let head = 0
  let tail = 0

  function enqueue(item) {
    items[tail] = item
    tail++
  }

  function dequeue() {
    const item = items[head]
    delete items[head]
    head++
    return item
  }

  function length() {
    return tail - head
  }

  function isEmpty() {
    return length() === 0
  }

  return {
    enqueue,
    dequeue,
    length,
    isEmpty,
  }
}

export { createQueue }
