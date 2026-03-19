import os
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail
from dotenv import load_dotenv

load_dotenv()


def send_email(to_email: str, subject: str, html: str) -> bool:
    """
    Send email using SendGrid API.

    Args:
        to_email: Recipient email address
        subject: Email subject
        html: HTML content

    Returns:
        True if email sent successfully, False otherwise
    """
    api_key = os.getenv("SENDGRID_API_KEY")
    from_email = os.getenv("SENDGRID_FROM_EMAIL", "hassankhilji26@gmail.com")

    if not api_key:
        print("SendGrid API key missing")
        return False

    try:
        message = Mail(
            from_email=from_email,
            to_emails=to_email,
            subject=subject,
            html_content=html
        )
        sg = SendGridAPIClient(api_key)
        response = sg.send(message)
        print(f"Email sent! Status: {response.status_code}")
        return True
    except Exception as e:
        print(f"Email error: {e}")
        return False


def send_verification_email(email: str, token: str) -> bool:
    """
    Send email verification email to user.

    Args:
        email: Recipient email address
        token: Email verification token

    Returns:
        True if email sent successfully, False otherwise
    """
    verify_url = f"{os.getenv('FRONTEND_URL')}/verify-email?token={token}"

    html = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #2563EB; font-size: 48px; margin: 0;">🎉</h1>
            </div>

            <h2 style="color: #2563EB; margin-bottom: 20px;">Welcome to E-Shop!</h2>

            <p style="margin-bottom: 20px;">
                Thank you for registering! Please verify your email address to activate your account:
            </p>

            <div style="text-align: center; margin: 30px 0;">
                <a href="{verify_url}"
                   style="background-color: #2563EB; color: white;
                          padding: 14px 28px; text-decoration: none;
                          border-radius: 8px; display: inline-block;
                          font-weight: bold;">
                    Verify Email
                </a>
            </div>

            <p style="margin-bottom: 20px;">
                Or copy and paste this link into your browser:
            </p>

            <p style="background-color: #f3f4f6; padding: 10px; border-radius: 4px;
                      word-break: break-all; font-size: 14px;">
                {verify_url}
            </p>

            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">

            <p style="color: #666; font-size: 14px;">
                <strong>Important:</strong> This link expires in 24 hours.
            </p>

            <p style="color: #666; font-size: 14px;">
                If you didn't create this account, you can safely ignore this email.
            </p>

            <p style="margin-top: 30px; color: #666; font-size: 12px;">
                © {__import__('datetime').datetime.now().year} E-Shop. All rights reserved.
            </p>
        </div>
    </body>
    </html>
    """

    return send_email(email, "Verify Your Email - E-Shop", html)


def send_reset_email(email: str, token: str) -> bool:
    """
    Send password reset email to user.

    Args:
        email: Recipient email address
        token: Password reset token

    Returns:
        True if email sent successfully, False otherwise
    """
    reset_url = f"{os.getenv('FRONTEND_URL')}/reset-password?token={token}"

    html = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #2563EB; margin-bottom: 20px;">Reset Your Password</h2>

            <p style="margin-bottom: 20px;">
                We received a request to reset your password. Click the button below to reset it:
            </p>

            <div style="text-align: center; margin: 30px 0;">
                <a href="{reset_url}"
                   style="background-color: #2563EB; color: white;
                          padding: 14px 28px; text-decoration: none;
                          border-radius: 8px; display: inline-block;
                          font-weight: bold;">
                    Reset Password
                </a>
            </div>

            <p style="margin-bottom: 20px;">
                Or copy and paste this link into your browser:
            </p>

            <p style="background-color: #f3f4f6; padding: 10px; border-radius: 4px;
                      word-break: break-all; font-size: 14px;">
                {reset_url}
            </p>

            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">

            <p style="color: #666; font-size: 14px;">
                <strong>Important:</strong> This link expires in 1 hour.
            </p>

            <p style="color: #666; font-size: 14px;">
                If you didn't request this password reset, you can safely ignore this email.
                Your password will remain unchanged.
            </p>

            <p style="margin-top: 30px; color: #666; font-size: 12px;">
                © {__import__('datetime').datetime.now().year} E-Shop. All rights reserved.
            </p>
        </div>
    </body>
    </html>
    """

    return send_email(email, "Reset Your Password - E-Shop", html)


def send_order_confirmation_email(email: str, order_number: str, total: float, items: list = None) -> bool:
    """
    Send order confirmation email to customer.

    Args:
        email: Customer email address
        order_number: Order number
        total: Order total amount
        items: List of order items (optional)

    Returns:
        True if email sent successfully, False otherwise
    """
    items_html = ""
    if items:
        items_html = """
        <div style="margin-top: 30px;">
            <h3 style="color: #333; margin-bottom: 15px;">Order Items:</h3>
            <table style="width: 100%; border-collapse: collapse;">
        """
        for item in items:
            items_html += f"""
                <tr>
                    <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb;">
                        {item.get('name', 'Product')} x {item.get('quantity', 1)}
                    </td>
                    <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; text-align: right;">
                        ${item.get('price', 0) * item.get('quantity', 1):.2f}
                    </td>
                </tr>
            """
        items_html += """
            </table>
        </div>
        """

    html = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #2563EB; font-size: 48px; margin: 0;">🎉</h1>
            </div>

            <h2 style="color: #2563EB; margin-bottom: 20px;">Order Confirmed!</h2>

            <p style="margin-bottom: 20px;">
                Thank you for your order! Your order <strong>#{order_number}</strong> has been placed successfully.
            </p>

            <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <p style="margin: 0 0 10px 0; font-size: 14px; color: #666;">Order Number:</p>
                <p style="margin: 0 0 20px 0; font-size: 24px; font-weight: bold; color: #2563EB;">#{order_number}</p>

                <p style="margin: 0 0 10px 0; font-size: 14px; color: #666;">Total Amount:</p>
                <p style="margin: 0; font-size: 28px; font-weight: bold; color: #10B981;">${total:.2f}</p>
            </div>

            {items_html}

            <div style="margin-top: 30px; padding: 20px; background-color: #EFF6FF; border-radius: 8px;">
                <h3 style="color: #2563EB; margin-top: 0;">What's Next?</h3>
                <ol style="margin: 10px 0; padding-left: 20px;">
                    <li style="margin-bottom: 10px;">We'll send you a confirmation email shortly</li>
                    <li style="margin-bottom: 10px;">Your order will be processed within 1-2 business days</li>
                    <li style="margin-bottom: 10px;">We'll notify you when your order ships</li>
                    <li>Track your order from your account dashboard</li>
                </ol>
            </div>

            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">

            <p style="margin-top: 30px; color: #666; font-size: 14px;">
                Questions? Contact us at support@eshop.com
            </p>

            <p style="margin-top: 30px; color: #666; font-size: 12px;">
                © {__import__('datetime').datetime.now().year} E-Shop. All rights reserved.
            </p>
        </div>
    </body>
    </html>
    """

    return send_email(email, f"Order Confirmed #{order_number} - E-Shop", html)


def send_contact_email(name: str, email: str, subject: str, message: str) -> bool:
    """
    Send contact form submission email to admin.

    Args:
        name: Sender's name
        email: Sender's email address
        subject: Email subject
        message: Email message

    Returns:
        True if email sent successfully, False otherwise
    """
    admin_email = os.getenv("SMTP_USER", "admin@eshop.com")

    html = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background-color: #2563EB; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
                <h2 style="margin: 0;">New Contact Form Submission</h2>
            </div>
            <div style="background-color: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; border-radius: 0 0 8px 8px;">
                <div style="margin-bottom: 15px;">
                    <div style="font-weight: bold; color: #374151;">Name:</div>
                    <div style="color: #6B7280;">{name}</div>
                </div>
                <div style="margin-bottom: 15px;">
                    <div style="font-weight: bold; color: #374151;">Email:</div>
                    <div style="color: #6B7280;"><a href="mailto:{email}" style="color: #2563EB;">{email}</a></div>
                </div>
                <div style="margin-bottom: 15px;">
                    <div style="font-weight: bold; color: #374151;">Subject:</div>
                    <div style="color: #6B7280;">{subject.replace('_', ' ').title()}</div>
                </div>
                <div style="margin-bottom: 15px;">
                    <div style="font-weight: bold; color: #374151;">Message:</div>
                    <div style="color: #6B7280; white-space: pre-wrap; background-color: white; padding: 15px; border-radius: 4px;">{message}</div>
                </div>
            </div>
            <div style="background-color: #f3f4f6; padding: 15px; text-align: center; font-size: 12px; color: #6B7280; margin-top: 20px; border-radius: 8px;">
                <p>This email was sent from the contact form on your website.</p>
                <p>Please respond to <a href="mailto:{email}" style="color: #2563EB;">{email}</a></p>
            </div>
        </div>
    </body>
    </html>
    """

    return send_email(admin_email, f"Contact Form: {subject} - from {name}", html)
