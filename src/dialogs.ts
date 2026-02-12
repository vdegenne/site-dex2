import {bindInput} from '@vdegenne/forms/bindInput.js'
import '@material/web/textfield/filled-text-field.js'
// import '@material/web/textfield/outlined-text-field.js';
import {type MdDialog} from '@material/web/dialog/dialog.js'
import '@material/web/iconbutton/icon-button.js'
import {ReactiveController, state} from '@snar/lit'
import {FormBuilder} from '@vdegenne/forms/FormBuilder.js'
import {customElement} from 'custom-element-decorator'
import {LitElement, TemplateResult, html} from 'lit'
import {withStyles} from 'lit-with-styles'
import {query} from 'lit/decorators.js'
import {StyleInfo, styleMap} from 'lit/directives/style-map.js'
import toast from 'toastit'

interface DialogOptions {
	/**
	 * @default false
	 */
	quick: boolean
	/**
	 * Controller used to refresh the content when a value changes.
	 */
	ctrl: ReactiveController | ReactiveController[] | undefined

	/**
	 * Width in px
	 *
	 * @default 280
	 */
	width: number | undefined

	height: number | undefined

	/**
	 * @default {}
	 */
	style: StyleInfo

	/**
	 * @default Close
	 */
	closeButton: string | undefined

	/**
	 * @default undefined
	 */
	confirmButton:
		| Partial<{
				/**
				 * @default "Confirm"
				 */
				label: string | TemplateResult
				/**
				 * @default undefined
				 */
				onClick: ((dialog: Dialog) => void) | undefined

				/**
				 * @default false
				 */
				error: boolean
		  }>
		| undefined

	onOpen: ((dialog: Dialog) => void) | undefined
	onClose: ((dialog: Dialog) => void) | undefined

	actions: ((dialog: Dialog) => TemplateResult) | undefined
}

@customElement({name: 'content-dialog', inject: true})
@withStyles()
export class Dialog extends LitElement {
	@state() open = true
	#options: DialogOptions

	@query('dialog') dialogElement!: MdDialog

	constructor(
		public headline?: string | TemplateResult,
		public content?: string | TemplateResult | (() => string | TemplateResult),
		// public actions?: string | TemplateResult | (() => string | TemplateResult),
		options?: Partial<DialogOptions>,
	) {
		super()
		this.#options = {
			quick: false,
			ctrl: undefined,
			width: undefined,
			height: undefined,
			style: {},
			closeButton: 'Close',
			confirmButton: undefined,
			onOpen: undefined,
			onClose: undefined,
			actions: undefined,
			...options,
		}

		if (this.#options.width) {
			this.#options.style.maxWidth = `min(calc(100vw - 12px), ${
				this.#options.width
			}px)`
			this.#options.style.width = `100%`
		}
		if (this.#options.height) {
			this.#options.style.maxHeight = `min(calc(100vh - 12px), ${
				this.#options.height
			}px)`
			this.#options.style.height = `100%`
		}

		if (this.#options.confirmButton) {
			this.#options.confirmButton.label ??= 'Confirm'
			this.#options.confirmButton.error ??= false
		}

		if (this.#options.ctrl) {
			let ctrls = this.#options.ctrl
			if (!Array.isArray(ctrls)) {
				ctrls = [ctrls]
			}
			ctrls.forEach((ctrl) => ctrl.bind(this))
		}
	}

	get shouldRenderActions() {
		return (
			this.#options.actions !== undefined ||
			this.#options.closeButton !== undefined ||
			this.#options.confirmButton !== undefined
		)
	}

	render() {
		return html`<!-- -->
			<md-dialog
				?quick=${this.#options.quick}
				?open=${this.open}
				@opened=${this.#onOpened}
				@closed=${this.#onClosed}
				style=${styleMap(this.#options.style)}
			>
				${this.headline
					? typeof this.headline === 'object'
						? this.headline
						: html`<div slot="headline">${this.headline}</div>`
					: null}

				<div slot="content" class="overflow-hidden">
					${typeof this.content === 'function'
						? this.content?.()
						: this.content}
				</div>

				${this.shouldRenderActions
					? html`
							<div slot="actions" @click=${this.#onActionsClick}>
								${this.#options.actions
									? html` ${this.#options.actions?.(this)} `
									: html`<!-- -->
											${this.#options.closeButton
												? html`<!-- -->
														<md-text-button @click=${() => this.close()}
															>${this.#options.closeButton}</md-text-button
														>
														<!-- -->`
												: null}
											${this.#options.confirmButton
												? html`<!-- -->
														<md-filled-tonal-button
															@click=${() => {
																this.#options.confirmButton?.onClick?.(this)
															}}
															?error=${this.#options.confirmButton.error}
															>${this.#options.confirmButton
																.label}</md-filled-tonal-button
														>
														<!-- -->`
												: null}

											<!-- -->`}
							</div>
						`
					: null}
			</md-dialog>
			<!-- -->`
	}

	#onActionsClick(event: PointerEvent) {
		const target = event.target as HTMLDivElement
		if (target.hasAttribute('close')) {
			this.close()
		}
	}

	#onOpened = () => {
		this.renderRoot.querySelector<HTMLElement>('[autofocus]')?.focus()
		this.#options.onOpen?.(this)
	}
	#onClosed = () => {
		this.remove()
		this.open = false
		this.#options.onClose?.(this)
	}

	show() {
		this.open = true
	}
	close() {
		this.open = false
	}

	$<K extends keyof HTMLElementTagNameMap>(selector: K) {
		return this.renderRoot.querySelector(selector)
	}

	scrollToBottom() {
		// @ts-ignore
		const scroller = this.dialogElement.scroller
		scroller.scrollTop = scroller.scrollHeight
	}
}

export function directoryDialog(directory?: dex.Directory) {
	// const allDirs = store.getAllDirectories()
	class Ctrl extends ReactiveController {
		@state() name = directory?.name ?? ''

		F = new FormBuilder(this)
	}
	const ctrl = new Ctrl()
	const type = directory ? 'Edit' : 'Create'
	return new Promise<string>((resolve) => {
		new Dialog(
			`${type} directory`,
			() => {
				return html`<!-- -->
					${ctrl.F.TEXTFIELD('Name', 'name', {
						autofocus: true,
						style: {width: '100%'},
					})}
					<!-- -->`
			},
			{
				ctrl,
				actions(dialog) {
					return html`<!-- -->
						<md-text-button close>Cancel</md-text-button>
						<md-filled-button
							?disabled=${!ctrl.name}
							@click=${() => {
								resolve(ctrl.name)
								dialog.close()
							}}
							>${type}</md-filled-button
						>
						<!-- -->`
				},
			},
		)
	})
}
export function linkDialog(link?: dex.Link) {
	// const allDirs = store.getAllDirectories()
	class Ctrl extends ReactiveController {
		@state() name = link?.name ?? ''
		@state() url = link?.url ?? ''
		F = new FormBuilder(this)
	}
	const ctrl = new Ctrl()
	const type = link ? 'Edit' : 'Create'
	return new Promise<Ctrl>((resolve) => {
		new Dialog(
			`${type} link`,
			() => {
				return html`<!-- -->
					<form class="flex flex-col gap-5">
						${ctrl.F.TEXTFIELD('Name', 'name', {})}
						${ctrl.F.TEXTFIELD('URL', 'url', {
							autofocus: true,
							type: 'url',
						})}
					</form>
					<!-- -->`
			},
			{
				ctrl,
				actions(dialog) {
					return html`<!-- -->
						<md-text-button close>Cancel</md-text-button>
						<md-filled-button
							?disabled=${!ctrl.url}
							@click=${() => {
								const form = dialog.$('form')!
								if (form.checkValidity()) {
									resolve(ctrl.toJSON())
									dialog.close()
								} else {
								}
							}}
							>${type}</md-filled-button
						>
						<!-- -->`
				},
			},
		)
	})
}
