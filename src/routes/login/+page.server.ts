import type { Actions } from './$types';

export const actions:Actions = {
	login: async ({ cookies, request }) => {
		const data = await request.formData();
		const email = data.get('email');
		const code = data.get('code');

		//const user = await db.getUser(email);
		//cookies.set('sessionid', await db.createSession(user), { path: '/' });

		return { success: true };
	},
	check: async ({request}) => {
		const body = await request.formData();
		// Turnstile injects a token in "cf-turnstile-response".
		const token = body.get("cf-turnstile-response");
		const ip = request.headers.get("CF-Connecting-IP");
        return { success: true,token,ip };
		// TODO register the user
	}
};