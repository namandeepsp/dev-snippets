import { logger } from '@/shared/utils/logger'
import { useState } from 'react'

export function useLocalStorage<T>(
	key: string,
	initialValue: T,
): [T, (value: T | ((val: T) => T)) => void] {
	const [storedValue, setStoredValue] = useState<T>(() => {
		if (!globalThis.localStorage) {
			return initialValue
		}
		try {
			const item = globalThis.localStorage.getItem(key)
			return item ? JSON.parse(item) : initialValue
		} catch (error) {
			logger.error(`Error reading localStorage key "${key}"`, error)
			return initialValue
		}
	})

	const setValue = (value: T | ((val: T) => T)) => {
		try {
			const valueToStore =
				value instanceof Function ? value(storedValue) : value
			setStoredValue(valueToStore)
			if (globalThis.localStorage) {
				globalThis.localStorage.setItem(key, JSON.stringify(valueToStore))
			}
		} catch (error) {
			logger.error(`Error setting localStorage key "${key}"`, error)
		}
	}

	return [storedValue, setValue]
}
