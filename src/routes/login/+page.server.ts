import nodemailer from 'nodemailer'; 
import type { Actions } from './$types';
const SECRET_KEY = "0x4AAAAAAAylaN-pLQyJmqPMnxe8TsvX9-0";
const url = "https://challenges.cloudflare.com/turnstile/v0/siteverify"; 
const transporter = nodemailer.createTransport({ 
	auth: {
	  user: 'verify@zaddone.com', 
	  pass: '4>H#:tZEQkiC67:',
	},
	dsn:{},
	pool:true,
	host: 'smtp.qiye.aliyun.com',
	port:465,
	//secureConnection: true
  });

const mailOptions = {
	from: '"verify@zaddone.com" <verify@zaddone.com>', // sender address
	to: 'zaddone@qq.com', // list of receivers
	subject: 'verify', // Subject line
	// 发送text或者html格式
	// text: 'Hello world?', // plain text body
	html: '<b>verify code 2222</b>' // html body
  };
  
  // send mail with defined transport object

export const actions:Actions = {
	login: async ({ cookies, request }) => {
		const body = await request.formData();
		const email = body.get('email');
		const code = body.get('code');

		//const user = await db.getUser(email);
		//cookies.set('sessionid', await db.createSession(user), { path: '/' });

		return { email,code};
	},
	check: async ({request}) => {
		//0x4AAAAAAAylaN-pLQyJmqPMnxe8TsvX9-0
		const body = await request.formData();
		const email = body.get('email'); 
		if (!email)return ;
		const ip = request.headers.get("CF-Connecting-IP")?.toString()||"";
		mailOptions.to = email?.toString()||""
		transporter.sendMail(mailOptions, (error, info) => {
			if (error) {
			  return console.log(error);
			}
			console.log(info)
			//console.log('Message sent: %s', info.messageId);
			// Message sent: <04ec7731-cc68-1ef6-303c-61b0f796b78f@qq.com>
		  });
 
        return { ip,email };
		// TODO register the user
	}
};