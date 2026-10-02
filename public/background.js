chrome.action.onClicked.addListener(async (tab) => {
  const url =
    chrome.runtime.getURL('index.html') +
    (tab?.id ? `?tabId=${tab.id}` : '')

  let width = 1920
  let height = 1080

  try {
    const [display] = await chrome.system.display.getInfo()
    if (display?.workArea) {
      width = display.workArea.width
      height = display.workArea.height
    }
  } catch (err) {
    console.warn('Could not read display info, using fallback size', err)
  }

  chrome.windows.create({
    url,
    type: 'popup',
    width,
    height,
    left: 0,
    top: 0,
    focused: true
  })
})