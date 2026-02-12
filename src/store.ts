import {PropertyValues, ReactiveController, state} from '@snar/lit'
import {FormBuilder} from '@vdegenne/forms/FormBuilder.js'
import {saveToLocalStorage} from 'snar-save-to-local-storage'
import {availablePages} from './constants.js'
import {getMainPage, Page} from './pages/index.js'

@saveToLocalStorage('site-dex2:store')
export class AppStore extends ReactiveController {
	@state() page: Page = 'main'

	@state() root: dex.Directory = {
		type: 'directory',
		name: '/',
		id: -1,
		updated: Date.now(),
		weight: 0,
		children: [],
	}
	@state() currentDirId: number = -1

	@state() selectedIndex = 0

	F = new FormBuilder(this)

	protected updated(changed: PropertyValues<this>) {
		// const {hash, router} = await import('./router.js')
		if (changed.has('page')) {
			// import('./router.js').then(({router}) => {
			// 	router.hash.$('page', this.page)
			// })
			const page = availablePages.includes(this.page) ? this.page : '404'
			import(`./pages/page-${page}.ts`)
				.then(() => {
					console.log(`Page ${page} loaded.`)
				})
				.catch(() => {})
		}
	}

	flattenItems(items: dex.Item[] = [this.root]) {
		const result: dex.Item[] = []
		function recurse(list: dex.Item[]) {
			for (const item of list) {
				result.push(item)
				if (item.type === 'directory') {
					recurse(item.children)
				}
			}
		}
		recurse(items)
		return result
	}

	getAllDirectories() {
		this.flattenItems().filter((i) => i.type === 'directory')
	}

	getCurrentDir() {
		// if (this.currentDirId === -1) {
		// 	// Root
		// 	return this.root
		// } else {
		return this.flattenItems().find((i) => i.id === this.currentDirId) as
			| dex.Directory
			| undefined
		// }
	}

	newDirectory(name: string) {
		if (name) {
			const directory: dex.Directory = {
				type: 'directory',
				id: Date.now(),
				name,
				children: [],
				weight: 0,
				updated: Date.now(),
			}
			const currentDir = this.getCurrentDir()
			if (currentDir) {
				currentDir.children.push(directory)
				this.requestUpdate()
			}
		}
	}
	newLink(url: string, name?: string) {
		if (url) {
			const link: dex.Link = {
				type: 'link',
				id: Date.now(),
				name,
				weight: 0,
				updated: Date.now(),
				url,
			}
			const currentDir = this.getCurrentDir()
			if (currentDir) {
				currentDir.children.push(link)
				this.requestUpdate()
			}
		}
	}

	getPathById(id = this.currentDirId): dex.Item[] | null {
		function recurse(node: dex.Item, path: dex.Item[]): dex.Item[] | null {
			const newPath = [...path, node]
			if (node.id === id) return newPath
			if (node.type === 'directory') {
				for (const child of node.children) {
					const found = recurse(child, newPath)
					if (found) return found
				}
			}
			return null
		}

		return recurse(this.root, [])
	}

	incrementWeight(item: dex.Item) {
		item.weight++
		this.requestUpdate()
	}

	selectAbove() {
		// TODO: prevent out of bounds
		this.selectedIndex--
	}
	selectBelow() {
		// TODO: prevent out of bounds
		this.selectedIndex++
	}

	clickSelected() {
		getMainPage().selectedItem?.click()
	}
}

export const store = new AppStore()
