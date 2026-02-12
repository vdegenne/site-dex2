import {Hash, Router} from '@vdegenne/router'
// import {Page} from './pages/index.js'
import {store} from './store.js'
import {Logger} from '@vdegenne/debug'
import chalk from 'chalk'
import toast from 'toastit'

export const hash = new Hash<{id: string}>()
const logger = new Logger({
	colors: {
		log: chalk.yellow,
	},
})

export const router = new Router(async ({location, parts}) => {
	logger.log('Location has changed')
	await store.updateComplete
	hash.reflectHashToParams()
	if (window.location.host.endsWith('.github.io')) {
		parts = parts.slice(1)
	}
	// if (parts.length === 0) {
	// 	store.page = 'main'
	// } else {
	// 	store.page = parts[0] as Page
	// }

	if (hash.has('id')) {
		store.currentDirId = Number(hash.$('id'))
	} else {
		store.currentDirId = -1
	}
	store.updateComplete.then(() => {
		const path = store.getPathById(store.currentDirId)
		if (path === null) {
			store.currentDirId = -1
		} else {
			console.log(path)
		}
	})
	// const params = new URLSearchParams(location.search)
})
