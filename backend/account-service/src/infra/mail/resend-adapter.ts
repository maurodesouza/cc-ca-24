import { Mail, MailSendArgs } from "../../application/mail/mail";

export class ResendAdapter implements Mail {
    async send(args: MailSendArgs): Promise<void> {
        // logica de enviar email com resend
    }
}
