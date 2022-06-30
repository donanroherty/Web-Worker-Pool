import { expensiveOp } from "./lib.js"

/**
 * Message handler called in a Worker thread in response to a message posted from the main thread
 */
onmessage = function onMessage(event) {
  try {
    const res = expensiveOp(event.data)
    postMessage(res)
  } catch (err) {
    throw err
  }
}
