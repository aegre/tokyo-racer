/**
 * Email sending utilities
 * Currently configured for Resend, but can be adapted for other services
 */

interface SendVerificationEmailParams {
	email: string;
	username: string;
	verificationToken: string;
	appUrl: string;
}

export async function sendVerificationEmail({
	email,
	username,
	verificationToken,
	appUrl,
}: SendVerificationEmailParams): Promise<void> {
	const resendApiKey = import.meta.env.RESEND_API_KEY;
	const fromEmail = import.meta.env.FROM_EMAIL || 'onboarding@resend.dev';

	if (!resendApiKey) {
		console.warn(
			'RESEND_API_KEY not set. Email sending is disabled. ' +
			'Set RESEND_API_KEY in your .env file to enable email sending.'
		);
		// In development, you might want to log the verification URL instead
		if (import.meta.env.DEV) {
			const verificationUrl = `${appUrl}/verify-email?token=${verificationToken}`;
			console.log('📧 Verification email would be sent to:', email);
			console.log('🔗 Verification URL:', verificationUrl);
		}
		return;
	}

	try {
		// Dynamic import to avoid bundling Resend in production if not needed
		const { Resend } = await import('resend');
		const resend = new Resend(resendApiKey);

		const verificationUrl = `${appUrl}/verify-email?token=${verificationToken}`;

		const { error } = await resend.emails.send({
			from: fromEmail,
			to: email,
			subject: 'Verify your Tokyo Tracker account',
			html: `
				<!DOCTYPE html>
				<html>
				<head>
					<meta charset="utf-8">
					<meta name="viewport" content="width=device-width, initial-scale=1.0">
				</head>
				<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
					<div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
						<h1 style="color: white; margin: 0; font-size: 28px;">Tokyo Tracker</h1>
					</div>
					<div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
						<h2 style="color: #1f2937; margin-top: 0;">Hi ${username}!</h2>
						<p style="color: #4b5563; font-size: 16px;">
							Thanks for signing up! Please verify your email address by clicking the button below:
						</p>
						<div style="text-align: center; margin: 30px 0;">
							<a href="${verificationUrl}" 
							   style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; padding: 14px 28px; border-radius: 6px; font-weight: 600; font-size: 16px;">
								Verify Email Address
							</a>
						</div>
						<p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
							Or copy and paste this link into your browser:
						</p>
						<p style="color: #667eea; font-size: 12px; word-break: break-all; background: #f3f4f6; padding: 10px; border-radius: 4px;">
							${verificationUrl}
						</p>
						<p style="color: #9ca3af; font-size: 12px; margin-top: 30px; border-top: 1px solid #e5e7eb; padding-top: 20px;">
							This link will expire in 24 hours.<br>
							If you didn't create an account, you can safely ignore this email.
						</p>
					</div>
				</body>
				</html>
			`,
			text: `
Hi ${username}!

Thanks for signing up! Please verify your email address by clicking the link below:

${verificationUrl}

This link will expire in 24 hours.

If you didn't create an account, you can safely ignore this email.

Thanks,
Tokyo Tracker Team
			`,
		});

		if (error) {
			console.error('Failed to send verification email:', error);
			throw new Error(`Failed to send email: ${error.message}`);
		}

		console.log('Verification email sent successfully to:', email);
	} catch (error: any) {
		console.error('Error sending verification email:', error);
		// Don't throw - we don't want to fail user registration if email fails
		// You might want to log this to an error tracking service
		throw error;
	}
}
