/**
 * Error handling utilities for better debugging in Cloudflare Pages
 */

interface ErrorLog {
	timestamp: string;
	path: string;
	method: string;
	error: {
		name: string;
		message: string;
		stack?: string;
	};
	request?: {
		url: string;
		headers?: Record<string, string>;
	};
}

/**
 * Log error with context for Cloudflare Pages
 * These logs will appear in Cloudflare dashboard under Real-time Logs
 */
export function logError(
	error: unknown,
	context: {
		path: string;
		method: string;
		request?: Request;
		additionalInfo?: Record<string, unknown>;
	}
): void {
	const errorObj = error instanceof Error ? error : new Error(String(error));
	
	const logEntry: ErrorLog = {
		timestamp: new Date().toISOString(),
		path: context.path,
		method: context.method,
		error: {
			name: errorObj.name,
			message: errorObj.message,
			stack: errorObj.stack,
		},
		...(context.request && {
			request: {
				url: context.request.url,
			},
		}),
	};

	// Log to console (visible in Cloudflare Real-time Logs)
	console.error('[ERROR]', JSON.stringify(logEntry, null, 2));
	
	// Log additional context if provided
	if (context.additionalInfo) {
		console.error('[ERROR CONTEXT]', JSON.stringify(context.additionalInfo, null, 2));
	}
}

/**
 * Create a safe error response
 * In production, hides sensitive details but logs everything
 */
export function createErrorResponse(
	error: unknown,
	context: {
		path: string;
		method: string;
		request?: Request;
		statusCode?: number;
	}
): Response {
	const isDevelopment = import.meta.env.MODE === 'development' || import.meta.env.DEV;
	const errorObj = error instanceof Error ? error : new Error(String(error));

	// Always log the full error
	logError(error, context);

	// Handle specific error types
	if (errorObj.name === 'ZodError') {
		const zodError = error as { errors: Array<{ message: string }> };
		return new Response(
			JSON.stringify({
				error: zodError.errors[0]?.message || 'Validation error',
				...(isDevelopment && { details: zodError.errors }),
			}),
			{
				status: 400,
				headers: { 'Content-Type': 'application/json' },
			}
		);
	}

	// Return safe error response
	const statusCode = context.statusCode || 500;
	const response: { error: string; details?: string; errorId?: string } = {
		error: errorObj.message || 'Internal server error',
	};

	// Only include stack trace in development
	if (isDevelopment && errorObj.stack) {
		response.details = errorObj.stack;
	}

	// Generate error ID for tracking (first 8 chars of timestamp + random)
	const errorId = `${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;
	response.errorId = errorId;

	// Log error ID for correlation
	console.error(`[ERROR ID] ${errorId} - ${context.path} - ${errorObj.message}`);

	return new Response(JSON.stringify(response), {
		status: statusCode,
		headers: { 'Content-Type': 'application/json' },
	});
}
