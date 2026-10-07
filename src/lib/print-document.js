export function printHtmlDocument(html) {
  const iframe = document.createElement('iframe')
  iframe.setAttribute('aria-hidden', 'true')
  iframe.style.position = 'fixed'
  iframe.style.width = '0'
  iframe.style.height = '0'
  iframe.style.border = '0'
  document.body.appendChild(iframe)

  const frameWindow = iframe.contentWindow
  const frameDocument = frameWindow.document

  frameDocument.open()
  frameDocument.write(html)
  frameDocument.close()

  const cleanup = () => {
    iframe.remove()
  }

  frameWindow.addEventListener('afterprint', cleanup)
  window.setTimeout(() => {
    frameWindow.focus()
    frameWindow.print()
  }, 50)
}
