interface Document {
	startViewTransition?: (callback: () => any) => {
		finished: Promise<void>
		ready: Promise<void>
		updateCallbackDone: Promise<void>
		skipTransition: () => void
	}
}
