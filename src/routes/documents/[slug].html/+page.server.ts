import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { read } from '$app/server';

export const load: PageServerLoad = async ({ params }) => {
	//console.log(params.slug)
	return await import(`$doc/${params.slug}.html?raw`) 
	//console.log(res)
	//error(404, 'Not found');
};