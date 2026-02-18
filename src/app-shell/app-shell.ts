import '@material/mwc-top-app-bar'
import {withController} from '@snar/lit'
import {html, type PropertyValues} from 'lit'
import {withStyles} from 'lit-with-styles'
import {customElement} from 'lit/decorators.js'
import {unsafeSVG} from 'lit/directives/unsafe-svg.js'
import {MaterialShellChild} from 'material-shell/MaterialShellChild'
import {SVG_LOGO} from '../assets/assets.js'
import {availablePages} from '../constants.js'
import {openSettingsDialog} from '../imports.js'
import {store} from '../store.js'
import styles from './app-shell.css?inline'
import {getLocalFormattedDate} from '../utils.js'

declare global {
	interface Window {
		app: AppShell
	}
	interface HTMLElementTagNameMap {
		'app-shell': AppShell
	}
}

@customElement('app-shell')
@withStyles(styles)
@withController(store)
export class AppShell extends MaterialShellChild {
	render() {
		const currentDir = store.getCurrentDir()
		const path = currentDir ? store.getPathById(currentDir.id) : null
		const previous = path?.at(-2)
		return html`<!-- -->
			<mwc-top-app-bar
				?dense=${false}
				style="--mdc-theme-primary:var(---md-sys-color-surface-container, transparent);--mdc-theme-on-primary:var(--md-sys-color-on-surface)"
			>
				<md-list-item
					slot="title"
					class="--ml-[-20px] ml-2"
					slot="navigationIcon"
				>
					<md-icon-button
						slot="start"
						style="---md-icon-button-icon-size:32px;"
						href="${previous ? `#id=${previous.id}` : undefined}"
					>
						${previous
							? html`<!-- -->
									<md-icon>arrow_back</md-icon>
									<!-- -->`
							: html`<!-- -->
									<md-icon>${unsafeSVG(SVG_LOGO)}</md-icon>
									<!-- -->`}
					</md-icon-button>
					<span>${currentDir?.name ?? 'site-dex2'}</span>
				</md-list-item>

				<div slot="actionItems" class="flex items-center gap-3">
					<div class="text-xs text-(--md-sys-color-outline)">
						${getLocalFormattedDate()}
					</div>
					<!-- <md-icon-button -->
					<!-- 	toggle -->
					<!-- 	@click=${store.toggleAudio} -->
					<!-- 	?selected=${store.audio} -->
					<!-- > -->
					<!-- 	<md-icon>volume_off</md-icon> -->
					<!-- 	<md-icon slot="selected">volume_up</md-icon> -->
					<!-- </md-icon-button> -->
					<!-- <md-icon-button slot="actionItems" @click=${() =>
						this._logout()}> -->
					<!-- 	<md-icon>logout</md-icon> -->
					<!-- </md-icon-button> -->
					<md-icon-button @click=${openSettingsDialog}>
						<md-icon>settings</md-icon>
					</md-icon-button>
				</div>
				<div>
					<page-main ?active=${store.page === 'main'}></page-main>
					<page-404 ?active=${!availablePages.includes(store.page)}></page-404>
				</div>
			</mwc-top-app-bar>
			<!-- -->`
	}

	protected firstUpdated(_changedProperties: PropertyValues): void {
		const topAppBar = this.renderRoot.querySelector('mwc-top-app-bar')!
		// fix scroll disappearance issue.
		setTimeout(() => (topAppBar as any)?.handleResize(), 1)
		// styles for PWA
		const css = new CSSStyleSheet()
		css.replaceSync(`
			.mdc-top-app-bar__section {
				/* padding-left: 0; */
			}
			.mdc-top-app-bar__title {
				padding-left: 0;
			}
			.mdc-top-app-bar {
				-webkit-app-region: drag;
				app-region: drag;
				background-color: color-mix(in srgb, var(--md-sys-color-surface-container) 30%, transparent);
				backdrop-filter: blur(4px); /* the blur */
				-webkit-backdrop-filter: blur(4px); /* safari */

			}
			#actions ::slotted(*), #navigation ::slotted(*) {
				-webkit-app-region: no-drag;
				app-region: no-drag;
			}
		`)
		topAppBar?.shadowRoot?.adoptedStyleSheets.push(css)
		if ('windowControlsOverlay' in navigator) {
			// Listen for changes in overlay visibility
			;(<any>navigator.windowControlsOverlay).addEventListener(
				'geometrychange',
				(event: any) => {
					const buttons = this.renderRoot.querySelector<HTMLElement>(
						'[slot="actionItems"]',
					)
					if (!buttons) return
					if (event.visible) {
						buttons.style.paddingTop = `${event.titlebarAreaRect.height}px`
						buttons.style.transform = 'scale(0.8)'
					} else {
						buttons.style.paddingTop = '0'
						buttons.style.transform = 'initial'
					}
				},
			)
		}
	}

	// @confirm({headline: 'Logout', content: 'Are you sure you want to logout?'})
	// private _logout() {
	// 	authManager.logout()
	// }
}

export const app = (window.app = new AppShell())
