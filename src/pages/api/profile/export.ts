import type { APIRoute } from 'astro';
import { getUserFromSession } from '../../../lib/session';
import { getRivalsWithProgress } from '../../../lib/rivals';
import { getMandatoryCars } from '../../../lib/cars';

export const GET: APIRoute = async ({ cookies, request, url }) => {
	try {
		const sessionToken = cookies.get('session')?.value;
		if (!sessionToken) {
			return new Response(JSON.stringify({ error: 'Unauthorized' }), {
				status: 401,
				headers: { 'Content-Type': 'application/json' },
			});
		}

		const user = await getUserFromSession(sessionToken);
		if (!user) {
			return new Response(JSON.stringify({ error: 'Unauthorized' }), {
				status: 401,
				headers: { 'Content-Type': 'application/json' },
			});
		}

		const format = url.searchParams.get('format') || 'json';

		// Get all data
		const rivals = await getRivalsWithProgress(user.id);
		const cars = await getMandatoryCars(user.id);

		const exportData = {
			exportedAt: new Date().toISOString(),
			user: {
				username: user.username,
				email: user.email,
			},
			rivals: rivals.map(r => ({
				number: r.number,
				level: r.level,
				name: r.name,
				location: r.location,
				completed: r.user_completed,
				completedAt: r.last_updated,
			})),
			cars: cars.map(c => ({
				brand: c.brand,
				model: c.model,
				year: c.year,
				chassis: c.chassis,
				status: c.status,
			})),
		};

		if (format === 'csv') {
			// Generate CSV
			const csvLines: string[] = [];

			// Rivals CSV
			csvLines.push('=== RIVALS ===');
			csvLines.push('Number,Level,Name,Location,Completed,Completed At');
			rivals.forEach(r => {
				csvLines.push([
					r.number,
					r.level,
					`"${r.name.replace(/"/g, '""')}"`,
					`"${r.location.replace(/"/g, '""')}"`,
					r.user_completed ? 'Yes' : 'No',
					r.last_updated || '',
				].join(','));
			});

			csvLines.push('');
			csvLines.push('=== CARS ===');
			csvLines.push('Brand,Model,Year,Chassis,Status');
			cars.forEach(c => {
				csvLines.push([
					c.brand,
					`"${c.model.replace(/"/g, '""')}"`,
					c.year || '',
					c.chassis || '',
					c.status,
				].join(','));
			});

			const csv = csvLines.join('\n');

			return new Response(csv, {
				status: 200,
				headers: {
					'Content-Type': 'text/csv',
					'Content-Disposition': `attachment; filename="tokyo-tracker-export-${new Date().toISOString().split('T')[0]}.csv"`,
				},
			});
		}

		// JSON format
		return new Response(JSON.stringify(exportData, null, 2), {
			status: 200,
			headers: {
				'Content-Type': 'application/json',
				'Content-Disposition': `attachment; filename="tokyo-tracker-export-${new Date().toISOString().split('T')[0]}.json"`,
			},
		});
	} catch (error: unknown) {
		const { createErrorResponse } = await import('../../../lib/error-handler');
		return createErrorResponse(error, {
			path: '/api/profile/export',
			method: 'GET',
			request,
		});
	}
};
