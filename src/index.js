import { expensiveOp } from "./lib.js"
import { createWorkerPool } from "./workerPool.js"

document.getElementById("runBlocking").onclick = runBlocking
document.getElementById("runWorkers").onclick = runWorkers

function runBlocking() {
  const t = benchmark()
  for (let i = 0; i < 200; i++) {
    expensiveOp(8) // Operations is executed one at a time, blocking the main thread
  }
  document.getElementById(`runBlocking-result`).innerHTML += `runtime: ${t.end() * 0.001}sec<br>`
}

async function runWorkers() {
  const t = benchmark()

  const numWorkers = navigator.hardwareConcurrency || 4 // number of available threads, defaults to 4
  const workerPool = createWorkerPool(numWorkers, "src/worker.js") // create a worker pool to run "worker.js"
  const promises = []

  // Provision jobs to the queue
  for (let i = 0; i < 200; i++) {
    promises.push(workerPool.addJob(8))
  }

  // wait for all jobs to complete
  await Promise.all(promises)

  document.getElementById(`runWorkers-result`).innerHTML += `runtime: ${t.end() * 0.001}sec<br>`
}

function benchmark() {
  const start = performance.now()
  return { end: () => performance.now() - start }
}
