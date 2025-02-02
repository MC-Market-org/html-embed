import { Client } from '@widgetbot/embed-api'

import { API } from './types'
import { applyStyles, generateUUID, Shadow } from './util'

class Embed {
  id = generateUUID()
  iframe = document.createElement('iframe') as API

  constructor(readonly root: API) {
    const { id, iframe } = this
    if (this.injected) return

    iframe.setAttribute('title', 'WidgetBot Discord chat embed')

    const api = new Client({ id, iframe })

    const shadow = Shadow(root as any)
    shadow.appendChild(iframe)

    const { server, channel, url, ...styles } = this.parseAttributes(root)
    iframe.setAttribute('src', url)

    this.setAPI(root, {
      on: (e, c) => api.on(e, c),
      emit: (e, d) => api.emit(e, d),
      contentWindow: iframe.contentWindow,
      contentDocument: iframe.contentDocument
    })

    applyStyles(root, {
      display: 'inline-block',
      overflow: 'hidden',
      backgroundColor: '#36393E',
      borderRadius: '7px',
      verticalAlign: 'top',
      ...styles
    })
    applyStyles(iframe, {
      border: 'none',
      width: '100%',
      height: '100%'
    })
  }

  get injected() {
    return 'emit' in this.root && 'on' in this.root
  }

  private parseAttributes(node: Element) {
    const server = node.getAttribute('server') || '299881420891881473'
    const channel = node.getAttribute('channel')
    let shard = node.getAttribute('shard') || 'https://e.widgetbot.io'
    const username = node.getAttribute('username')
    const avatar = node.getAttribute('avatar')
    const contentHash = node.getAttribute('content-hash')
    const theme = node.getAttribute('theme')

    if (!shard.startsWith('http')) shard = `https://${shard}`
    if (shard.endsWith('/')) shard = shard.substring(0, shard.length-1)

    const url = `${shard}/channels/${server}${
      channel ? `/${channel}` : ''
    }/?api=${this.id}${
      username ? `&username=${username}` : ''
    }${
      avatar ? `&avatar=${avatar}` : ''
    }${
      contentHash ? `&contentHash=${contentHash}` : ''
    }${
      theme ? `&theme=${theme}` : ''
    }`

    const width = node.getAttribute('width')
    const height = node.getAttribute('height')

    return {
      ...(width && { width: +width ? `${width}px` : width }),
      ...(height && { height: +height ? `${height}px` : height }),
      server,
      channel,
      url
    }
  }

  private setAPI(element: Element, api) {
    Object.keys(api).forEach(key => (element[key] = api[key]))
  }
}

export default Embed
