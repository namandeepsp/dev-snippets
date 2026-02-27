import { useCallback, useEffect, useRef, useState } from 'react'

export function useThrottle<T>(value: T, delay = 300): T {
	const [throttledValue, setThrottledValue] = useState(value)
	const lastRunRef = useRef(Date.now())

	useEffect(() => {
		const now = Date.now()
		const timeSinceLastRun = now - lastRunRef.current
		const remaining = delay - timeSinceLastRun

		if (remaining <= 0) {
			lastRunRef.current = now
			setThrottledValue(value)
			return
		}

		const timeoutId = setTimeout(() => {
			lastRunRef.current = Date.now()
			setThrottledValue(value)
		}, remaining)

		return () => clearTimeout(timeoutId)
	}, [value, delay])

	return throttledValue
}

export function useThrottledCallback<T extends (...args: any[]) => void>(
	callback: T,
	delay = 300,
) {
	const callbackRef = useRef(callback)
	const lastRunRef = useRef(0)
	const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

	useEffect(() => {
		callbackRef.current = callback
	}, [callback])

	useEffect(() => {
		return () => {
			if (timeoutRef.current) {
				clearTimeout(timeoutRef.current)
			}
		}
	}, [])

	return useCallback(
		(...args: Parameters<T>) => {
			const now = Date.now()
			const remaining = delay - (now - lastRunRef.current)

			if (remaining <= 0) {
				lastRunRef.current = now
				callbackRef.current(...args)
				return
			}

			if (!timeoutRef.current) {
				timeoutRef.current = setTimeout(() => {
					lastRunRef.current = Date.now()
					timeoutRef.current = null
					callbackRef.current(...args)
				}, remaining)
			}
		},
		[delay],
	)
}
