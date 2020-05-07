const indexTemplate = fetch('./template/index.html').then(res=>res.text()).then(txt=>new DOMParser().parseFromString(txt, 'text/html'))
const gameTemplate = fetch('./template/game.html').then(res=>res.text())
const pageProm = Promise.all([
  'game.css',
  'noscript.html',
  'style.css'
].map(async url=>[url, await fetch(`./template/${url}`).then(res=>res.blob())]))
document.getElementById('addkey').addEventListener('click', () => {
  const kdb = document.createElement('kbd')
  const span = document.createElement('span')
  const keybind = document.createElement('div')
  kdb.contentEditable = true
  kdb.innerText = 'A'
  span.contentEditable = true
  span.innerText = 'example'
  keybind.appendChild(kdb)
  keybind.appendChild(span)
  keybind.addEventListener('dblclick', ()=>{
    keybind.remove()
  })
  document.getElementById('controls').appendChild(keybind)
})
document.getElementById('upload').addEventListener('change', async event => {
  const [proj] = [...event.target.files]
  console.log('Unzipping...')
  const project = await new JSZip().loadAsync(await proj.arrayBuffer())
  console.log('Importing...')
  const indexDocument = await indexTemplate
  const {project: {width, height, name}} = JSON.parse(await project.files['project.json'].async('string'))
  indexDocument.getElementById('game').width = width
  indexDocument.getElementById('game').height = height
  indexDocument.querySelector('title').innerText = name
  if (!document.querySelectorAll('#controls *').length) {
    indexDocument.getElementById('controlsect').remove()
  } else {

    document.querySelectorAll('#controls span, #controls kbd').forEach(ele=>ele.contentEditable = false)
    indexDocument.getElementById('controls').innerHTML = document.getElementById('controls').innerHTML
  }
  console.log('Zip created.')
  const zip = new JSZip()
  zip.file('index.html', indexDocument.documentElement.outerHTML)
  zip.file('game.html', ( await gameTemplate).replace('{{TITLE}}', name))
  zip.file('project.wick', proj)
  zip.file('wickengine.js', fetch('https://raw.githubusercontent.com/Wicklets/wick-editor/master/engine/dist/wickengine.js').then(res=>res.blob()))
  const pages = await pageProm
  pages.forEach( arr => zip.file(...arr))
  const link = document.createElement('a')
  link.href = URL.createObjectURL(await zip.generateAsync({type: 'blob'}))
  link.download = name + '.zip'
  link.style.display = 'none'
  document.body.appendChild(link)
  link.click()
  URL.revokeObjectURL(link.href)
  location.reload()
})
