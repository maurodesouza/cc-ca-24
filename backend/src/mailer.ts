export type SendEmailArgs = {
  to: string;
  subject: string;
  body: string;
}

export async function sendEmail(args: SendEmailArgs) {
    console.log(args.to, args.subject, args.body);
}
