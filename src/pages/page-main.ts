import {type MdListItem} from '@material/web/list/list-item.js'
import {withController} from '@snar/lit'
import {css, html} from 'lit'
import {withStyles} from 'lit-with-styles'
import {customElement, query} from 'lit/decorators.js'
import {repeat} from 'lit/directives/repeat.js'
import 'wavy-text-element'
import {directoryDialog, linkDialog} from '../dialogs.js'
import {store} from '../store.js'
import {PageElement} from './PageElement.js'
import {sortByWeightDesc} from '../utils.js'

declare global {
	interface HTMLElementTagNameMap {
		'page-main': PageMain
	}
}

@customElement('page-main')
@withController(store)
@withStyles(css`
	:host {
	}
	md-list-item[selected] {
		background-color: var(--md-sys-color-surface-container-high);
	}
`)
export class PageMain extends PageElement {
	@query('md-list-item[selected]') selectedItem?: MdListItem

	render() {
		const current = store.getCurrentDir()
		return html`<!---->
			${current && current.children.length > 0
				? html`<!-- -->
						<md-list>
							${repeat(
								sortByWeightDesc(current.children),
								(c) => c.id,
								(item, i) => {
									return html`<!-- -->
										<md-list-item
											@click=${() => store.incrementWeight(item)}
											href="${item.type === 'directory'
												? `#id=${item.id}`
												: item.url}"
											target="${item.type === 'link' ? '_blank' : undefined}"
											?selected=${i === store.selectedIndex}
										>
											${item.type === 'directory'
												? html`<md-icon slot="start">folder</md-icon>`
												: html`<md-icon slot="start">link</md-icon>`}
											<div slot="headline">
												${item.name ||
												(item.type === 'link' ? item.url : 'undefined')}
											</div>
											<div slot="trailing-supporting-text">${item.weight}</div>
										</md-list-item>
										<!-- -->`
								},
							)}
							${current.children.map((child) => {
								return null
								return html`<!-- -->
									<md-list-item
										href="${child.type === 'directory'
											? `#id=${child.id}`
											: child.url}"
										target="${child.type === 'link' ? '_blank' : undefined}"
									>
										${child.type === 'directory'
											? html`<md-icon slot="start">folder</md-icon>`
											: html`<md-icon slot="start">link</md-icon>`}
										<div slot="headline">
											${child.name ||
											(child.type === 'link' ? child.url : 'undefined')}
										</div>
									</md-list-item>
									<!-- -->`
							})}
						</md-list>
						<!-- -->`
				: html`<wavy-text class="text-center p-12">No items yet</wavy-text>`}
			<div class="flex items-center justify-center gap-3">
				<md-filled-button
					@click=${async () => {
						try {
							const link = await linkDialog()
							if (link) {
								store.newLink(link.url, link.name)
							}
						} catch {}
					}}
				>
					<md-icon slot="icon">link</md-icon>
					Create link
				</md-filled-button>
				<md-filled-tonal-button
					@click="${async () => {
						try {
							const name = await directoryDialog()
							if (name) {
								store.newDirectory(name)
							}
						} catch {}
					}}"
				>
					<md-icon slot="icon">folder</md-icon>
					Create directory
				</md-filled-tonal-button>
			</div>
			<!----> `
	}
}

// export const pageMain = new PageMain();
