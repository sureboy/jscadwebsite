import type { Actions } from './$types';

export const actions = {
	default: async ({  request }) => {
		const data = await request.formData();
        const imgFiles = data.getAll("imgFiles")
        const tokenres =  await fetch("https://www.zaddone.com/apitoken")
        const token = await tokenres.json()
        console.log(token)
    
        console.log(imgFiles)
	}
} satisfies Actions;