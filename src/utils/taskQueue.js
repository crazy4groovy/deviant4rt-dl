
module.exports = function constructor(maxOutstanding = 10) {
  const queue = []
  let outstanding = 0

  async function scheduleWork() {
    if ((outstanding >= maxOutstanding) || queue.length === 0) return

    const { func, args, resolve, reject } = queue.shift()

    try {
      outstanding++
      console.log('[Q] WORK STARTED:', outstanding, queue.length)
      const data = await func(...args)
      resolve(data)
    } catch (err) {
      console.log('[Q] !! WORK ERROR:', err.message, func.name)
      reject(err)
    }
    outstanding--
    console.log('[Q] WORK ENDED:  ', outstanding, queue.length)

    scheduleWork() // schedule next func
  }

  return (func) => (...args) => {
    return new Promise((resolve, reject) => {
      queue.push({ func, args, resolve, reject })
      scheduleWork() // schedule next func
    })
  }
}
