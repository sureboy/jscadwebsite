import type { PageServerLoad } from './$types';
import type {windowConfigType} from "$lib/function/utils"
const db:windowConfigType = {pageType:'run' , 
	in: "index.js",
	func: "main",
	name:"test",
	src:"",}
export const load: PageServerLoad = async ({ params }) => {
	return db;
};