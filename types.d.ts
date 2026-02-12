declare global {
	namespace dex {
		interface ItemBase {
			/**
			 * This can also be used as the creation date,
			 * since the id is created using Date.now() upon creation.
			 */
			id: number
			updated?: number
			type: 'link' | 'directory'
			name?: string
			weight: number
		}

		interface Link extends ItemBase {
			type: 'link'
			url: string
			name?: string
		}

		interface Directory extends ItemBase {
			type: 'directory'
			children: Item[]
			name: string
		}

		type Item = Link | Directory
	}
}

export {}
