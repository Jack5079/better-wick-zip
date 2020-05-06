/* eslint-env worker */
/* global JSZip */
importScripts('./jszip.min.js')
const indexTemplate = fetch('./template/index.html').then(res=>res.text())
const gameTemplate = fetch('./template/game.html').then(res=>res.text())
const pageProm = Promise.all([
  'game.css',
  'noscript.html',
  'style.css'
].map(async url=>[url, await fetch(`./template/${url}`).then(res=>res.blob())]))
async function addProject ({data: proj}) {
  const project = await new JSZip().loadAsync(await proj.arrayBuffer())
  const {project: {width, height, name}} = JSON.parse(await project.files['project.json'].async('string'))
  const zip = new JSZip()
  zip.file('index.html', (await indexTemplate)
    .replace('{{TITLE}}', name)
    .replace('{{WIDTH}}', width)
    .replace('{{HEIGHT}}', height))
  zip.file('game.html', ( await gameTemplate).replace('{{TITLE}}', name))
  zip.file('project.wick', proj)
  zip.file('wickengine.js', fetch('https://raw.githubusercontent.com/Wicklets/wick-editor/master/engine/dist/wickengine.js').then(res=>res.blob()))
  const pages = await pageProm
  pages.forEach( arr => zip.file(...arr))
  self.postMessage({
    name,
    blob: await zip.generateAsync({type: 'blob'})
  })
}
self.addEventListener('message', addProject)
// It should fetch wickengine
// Other files from the template folder
// Remember, .wick files are .zip files
// use jszip
