import { createQueue } from "./queue.js"

/**
 * Defines a job type where data is passed to a worker with callbacks for success and failure
 * @typedef {{data: any, onComplete: (res:any)=>void, onFailure:()=>void}} Job
 */

/**
 * @param {number} poolSize The number of Worker threads to create
 * @param {string} url Path to the Worker script
 * @returns
 */
function createWorkerPool(poolSize, url) {
  const pool = new Array(poolSize).fill(undefined).map((_) => createWorker(url, onJobComplete))
  const queue = createQueue()

  /**
   * Add a new job to the queue
   * @param {any} data Any data relevant for completing a job
   * @returns {Promise<any>} A promise which is resolved when the job is complete
   */
  async function addJob(data) {
    return new Promise((resolve, reject) => {
      const job = {
        data,
        onComplete: resolve,
        onFailure: reject,
      }
      queue.enqueue(job)
      startNextJob()
    })
  }

  // create a new Web Worker and set up message handling
  function createWorker(url, onJobComplete) {
    const worker = new Worker(url, { type: "module" }) // type: 'module' runs script as a module, enabling imports
    let busy = false

    /**
     * Executes a job
     * @param {Job} job
     */
    function doWork(job) {
      busy = true
      // handle success
      worker.onmessage = function onWorkerMessage(event) {
        busy = false
        onJobComplete(job, event.data)
      }

      // handle errors
      worker.onerror = function onWorkerError(err) {
        busy = false
        onJobComplete(job, {}, err)
      }

      worker.postMessage(job.data) // send data message to worker
    }

    function isBusy() {
      return busy
    }

    return { worker, isBusy, doWork }
  }

  /**
   * Called on job completion. Resolves finished job and queues up next job.
   * @param {Job} job The completed job
   * @param {any} result The result of the completed job
   * @param {any} err Any error the worker may have produced
   */
  function onJobComplete(job, result, err = undefined) {
    if (err) job.onFailure(err)
    else job.onComplete(result)

    startNextJob()
  }

  /**
   * Start the next job if a worker is available
   */
  function startNextJob() {
    if (!queue.isEmpty()) {
      const worker = pool.find((worker) => !worker.isBusy())
      if (worker) worker.doWork(queue.dequeue())
    }
  }

  /**
   * Destroys all worker threads, even currently active ones
   */
  function terminatePool() {
    pool.forEach((p) => p.worker.terminate())
  }

  return { addJob, terminatePool }
}

export { createWorkerPool }
