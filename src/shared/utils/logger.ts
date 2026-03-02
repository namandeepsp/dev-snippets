type LoggerMode = 'development' | 'production' | 'test'
type LogType = 'error' | 'warn' | 'info' | 'suggestion'

class Logger {
	private readonly mode: LoggerMode

	constructor(
		private readonly scope: string,
		mode = process.env.NODE_ENV as LoggerMode | undefined,
	) {
		this.mode = mode ?? 'development'
	}

	log(type: LogType, message: string, details?: unknown) {
		if (!this.shouldLog(type)) return

		const scopedMessage = `[${this.scope}] ${message}`
		switch (type) {
			case 'error':
				console.error(scopedMessage, details)
				return
			case 'warn':
				console.warn(scopedMessage, details)
				return
			case 'info':
			case 'suggestion':
				console.info(scopedMessage, details)
				return
		}
	}

	error(message: string, details?: unknown) {
		this.log('error', message, details)
	}

	warn(message: string, details?: unknown) {
		this.log('warn', message, details)
	}

	info(message: string, details?: unknown) {
		this.log('info', message, details)
	}

	suggestion(message: string, details?: unknown) {
		this.log('suggestion', message, details)
	}

	private shouldLog(type: LogType) {
		// Errors are noisy in production - keep them only for local debugging.
		if (type === 'error') {
			return this.mode === 'development'
		}

		// Warnings/info/suggestions can remain visible across environments.
		return true
	}
}

export const logger = new Logger('App')
export const createLogger = (scope: string) => new Logger(scope)
