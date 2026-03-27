"""
Email Template System
Beautiful HTML email templates for various notifications
"""

def get_order_confirmation_template(order) -> str:
    """Order confirmation email template"""
    return f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
            body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
            .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
            .header {{ background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }}
            .content {{ background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }}
            .order-details {{ background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }}
            .item {{ border-bottom: 1px solid #eee; padding: 15px 0; }}
            .total {{ background: #667eea; color: white; padding: 15px; border-radius: 8px; text-align: center; font-size: 18px; font-weight: bold; }}
            .button {{ display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin-top: 20px; }}
            .footer {{ text-align: center; color: #888; font-size: 12px; margin-top: 30px; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🎉 Order Confirmed!</h1>
                <p>Thank you for your purchase</p>
            </div>
            <div class="content">
                <p>Dear Customer,</p>
                <p>Your order has been successfully placed and is being processed.</p>
                
                <div class="order-details">
                    <h2>Order Details</h2>
                    <p><strong>Order Number:</strong> #{order.order_number}</p>
                    <p><strong>Order Date:</strong> {order.created_at.strftime('%B %d, %Y')}</p>
                    <p><strong>Status:</strong> {order.status}</p>
                    
                    <h3>Items:</h3>
                    {"".join([f'<div class="item"><strong>{item.product.name}</strong><br>Qty: {item.quantity} x Rs. {item.price:.2f}</div>' for item in order.items])}
                    
                    <div class="total">
                        Total: Rs. {order.total:.2f}
                    </div>
                </div>
                
                <p>We'll send you another email when your order ships.</p>
                
                <div style="text-align: center;">
                    <a href="http://localhost:3000/orders/{order.id}" class="button">Track Your Order</a>
                </div>
                
                <p style="margin-top: 30px;">Need help? Contact us at support@example.com</p>
            </div>
            <div class="footer">
                <p>&copy; 2026 Your Store. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
    """


def get_order_shipped_template(order) -> str:
    """Order shipped email template"""
    return f"""
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body {{ font-family: Arial, sans-serif; }}
            .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
            .header {{ background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }}
            .content {{ background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }}
            .tracking {{ background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #11998e; }}
            .button {{ display: inline-block; background: #11998e; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🚀 Order Shipped!</h1>
                <p>Your order is on its way</p>
            </div>
            <div class="content">
                <p>Great news! Your order #{order.order_number} has been shipped.</p>
                
                <div class="tracking">
                    <h3>Tracking Information</h3>
                    <p><strong>Tracking Number:</strong> TRK123456789</p>
                    <p><strong>Courier:</strong> TCS</p>
                    <p><strong>Estimated Delivery:</strong> 2-3 business days</p>
                </div>
                
                <div style="text-align: center;">
                    <a href="http://localhost:3000/orders/{order.id}" class="button">Track Your Order</a>
                </div>
            </div>
        </div>
    </body>
    </html>
    """


def get_password_reset_template(user, token) -> str:
    """Password reset email template"""
    reset_link = f"http://localhost:3000/reset-password?token={token}"
    
    return f"""
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body {{ font-family: Arial, sans-serif; }}
            .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
            .header {{ background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 30px; text-align: center; border-radius: 10px; }}
            .content {{ background: #f9f9f9; padding: 30px; margin-top: 20px; border-radius: 10px; }}
            .button {{ display: inline-block; background: #f5576c; color: white; padding: 15px 40px; text-decoration: none; border-radius: 5px; font-weight: bold; }}
            .warning {{ background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🔐 Password Reset Request</h1>
            </div>
            <div class="content">
                <p>Hello {user.full_name or user.username},</p>
                <p>We received a request to reset your password. Click the button below to reset it:</p>
                
                <div style="text-align: center; margin: 30px 0;">
                    <a href="{reset_link}" class="button">Reset Password</a>
                </div>
                
                <p>Or copy and paste this link:</p>
                <p style="word-break: break-all; color: #666;">{reset_link}</p>
                
                <div class="warning">
                    <strong>⚠️ Important:</strong> This link expires in 1 hour. If you didn't request this, please ignore this email.
                </div>
            </div>
        </div>
    </body>
    </html>
    """


def get_welcome_email_template(user) -> str:
    """Welcome email for new users"""
    return f"""
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body {{ font-family: Arial, sans-serif; }}
            .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
            .header {{ background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px; text-align: center; border-radius: 10px; }}
            .content {{ background: #f9f9f9; padding: 30px; margin-top: 20px; border-radius: 10px; }}
            .benefits {{ background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }}
            .benefit {{ padding: 10px 0; border-bottom: 1px solid #eee; }}
            .button {{ display: inline-block; background: #667eea; color: white; padding: 15px 40px; text-decoration: none; border-radius: 5px; font-weight: bold; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🎉 Welcome to Our Store!</h1>
                <p>We're excited to have you on board</p>
            </div>
            <div class="content">
                <p>Hi {user.full_name or user.username},</p>
                <p>Thank you for creating an account with us! You're now part of our community.</p>
                
                <div class="benefits">
                    <h3>What you can do now:</h3>
                    <div class="benefit">✅ Shop from thousands of products</div>
                    <div class="benefit">✅ Track your orders in real-time</div>
                    <div class="benefit">✅ Save items to your wishlist</div>
                    <div class="benefit">✅ Get exclusive deals and offers</div>
                    <div class="benefit">✅ Easy returns and refunds</div>
                </div>
                
                <div style="text-align: center; margin: 30px 0;">
                    <a href="http://localhost:3000/products" class="button">Start Shopping</a>
                </div>
                
                <p>Use code <strong style="background: #667eea; color: white; padding: 5px 10px; border-radius: 3px;">WELCOME10</strong> for 10% off your first order!</p>
            </div>
        </div>
    </body>
    </html>
    """


def get_return_approved_template(return_obj) -> str:
    """Return approved notification"""
    return f"""
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body {{ font-family: Arial, sans-serif; }}
            .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
            .header {{ background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%); color: white; padding: 30px; text-align: center; border-radius: 10px; }}
            .content {{ background: #f9f9f9; padding: 30px; margin-top: 20px; border-radius: 10px; }}
            .info-box {{ background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>✅ Return Approved</h1>
                <p>Your return request has been approved</p>
            </div>
            <div class="content">
                <p>Good news! Your return request #{return_obj.return_number} has been approved.</p>
                
                <div class="info-box">
                    <p><strong>Refund Amount:</strong> Rs. {return_obj.refund_amount:.2f}</p>
                    <p><strong>Refund Method:</strong> {return_obj.refund_method}</p>
                    <p><strong>Processing Time:</strong> 3-5 business days</p>
                </div>
                
                <p>You'll receive another email when the refund is processed.</p>
            </div>
        </div>
    </body>
    </html>
    """
