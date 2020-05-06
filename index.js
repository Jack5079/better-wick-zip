/* eslint-env browser */

const worker = new Worker('./worker.js')

worker.addEventListener('message', ({data: {blob, name}}) => {
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = name + '.zip'
  link.style.display = 'none'
  document.body.appendChild(link)
  link.click()
  URL.revokeObjectURL(link.href)
})

document.getElementById('upload').addEventListener('change', event => {
  for (const file of event.target.files) {
    worker.postMessage(file)
    console.log(file)
  }
})
