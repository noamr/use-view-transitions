interface Document {
	startViewTransition?: (callback: () => never) => {
		finished: Promise<void>
		ready: Promise<void>
		updateCallbackDone: Promise<void>
		skipTransition: () => void
	}
}
