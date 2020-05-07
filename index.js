/* global JSZip, Promise */
const indexTemplate = fetch('./template/index.html').then(res=>res.text()).then(txt=>new DOMParser().parseFromString(txt, 'text/html'))
const gameTemplate = fetch('./template/game.html').then(res=>res.text())
const pageProm = Promise.all([
  'game.css',
  'noscript.html',
  'style.css'
].map(async url=>[url, await fetch(`./template/${url}`).then(res=>res.blob())]))
async function addProject (proj) {
  console.log('Unzipping...')
  const project = await new JSZip().loadAsync(await proj.arrayBuffer())
  console.log('Importing...')
  const indexDocument = await indexTemplate
  const {project: {width, height, name}} = JSON.parse(await project.files['project.json'].async('string'))
  indexDocument.getElementById('game').width = width
  indexDocument.getElementById('game').height = height
  indexDocument.querySelector('title').innerText = name
  console.log('Zip created.')
  const zip = new JSZip()
  zip.file('index.html', indexDocument.documentElement.outerHTML)
  zip.file('game.html', ( await gameTemplate).replace('{{TITLE}}', name))
  zip.file('project.wick', proj)
  zip.file('wickengine.js', fetch('https://raw.githubusercontent.com/Wicklets/wick-editor/master/engine/dist/wickengine.js').then(res=>res.blob()))
  const pages = await pageProm
  pages.forEach( arr => zip.file(...arr))
  return {
    name,
    blob: await zip.generateAsync({type: 'blob'})
  }
}

document.getElementById('upload').addEventListener('change', event => {
  const [file] = [...event.target.files]
  addProject(file).then(({name, blob})=>{
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = name + '.zip'
    link.style.display = 'none'
    document.body.appendChild(link)
    link.click()
    URL.revokeObjectURL(link.href)
  })
})
