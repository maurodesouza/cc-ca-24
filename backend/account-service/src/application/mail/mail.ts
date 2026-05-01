export type MailSendArgs = {
  to: string;
  subject: string;
  body: string;
}

export interface Mail {
  send: (args: MailSendArgs) => Promise<void>;
}
