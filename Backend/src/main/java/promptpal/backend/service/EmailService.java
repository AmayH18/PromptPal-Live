package promptpal.backend.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import jakarta.mail.internet.MimeMessage;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    public boolean sendOtpEmail(String to, String subject, String otp) {

        try {

            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");

            helper.setTo(to);
            helper.setSubject(subject);

            String htmlContent = buildOtpEmailHtml(otp);
            helper.setText(htmlContent, true);
            

            mailSender.send(mimeMessage);

            System.out.println("✅ OTP Email Sent");

            return true;

        } catch (Exception e) {

            e.printStackTrace();

            return false;
        }
    }

    // =========================================================
    // HTML EMAIL TEMPLATE BUILDER
    // =========================================================

    private String buildOtpEmailHtml(String otp) {
        return """
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>PromptPal - Password Reset</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #F7F7FC;">

    <!-- Container -->
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #F7F7FC; padding: 40px 0;">
        <tr>
            <td align="center">

                <!-- Card -->
                <table width="100%" max-width="600" cellpadding="0" cellspacing="0" style="background-color: white; border-radius: 12px; box-shadow: 0 4px 6px rgba(30, 41, 59, 0.1); overflow: hidden;">

                    <!-- Header - Logo Section -->
                    <tr>
                        <td align="center" style="padding: 40px 20px 20px;">
                            <img src="https://amayh18.github.io/Portfolio/profile_pic/promptpal_logo.png" alt="PromptPal" width="80" height="80" style="display: block; margin: 0 auto; border-radius: 8px;">
                        </td>
                    </tr>

                    <!-- Title & Subtitle -->
                    <tr>
                        <td align="center" style="padding: 0 30px;">
                            <h1 style="margin: 20px 0 10px; font-size: 28px; font-weight: 700; color: #6C4DFF; line-height: 1.2;">PromptPal Wellness AI</h1>
                            <p style="margin: 0 0 30px; font-size: 14px; color: #9A6DFF; letter-spacing: 0.5px;">Personalized Skin • Hair • Body Wellness</p>
                        </td>
                    </tr>

                    <!-- Main Content -->
                    <tr>
                        <td style="padding: 30px 40px;">

                            <!-- Greeting -->
                            <p style="margin: 0 0 20px; font-size: 16px; color: #1E293B; line-height: 1.6;">Hello,</p>

                            <p style="margin: 0 0 30px; font-size: 15px; color: #475569; line-height: 1.6;">We received a request to reset the password for your PromptPal account. If this was you, use the verification code below to proceed.</p>

                            <!-- OTP Box -->
                            <table width="100%" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, #6C4DFF 0%, #9A6DFF 100%); border-radius: 12px; padding: 40px; margin: 30px 0; text-align: center;">
                                <tr>
                                    <td align="center">
                                        <p style="margin: 0 0 15px; font-size: 13px; color: white; font-weight: 600; letter-spacing: 1px;">VERIFICATION CODE</p>
                                        <p style="margin: 0 0 15px; font-size: 42px; font-weight: 800; color: white; letter-spacing: 8px; font-family: 'Courier New', monospace;">""" + otp + """
</p>
                                        <p style="margin: 0; font-size: 12px; color: rgba(255, 255, 255, 0.9);">Valid for 10 minutes</p>
                                    </td>
                                </tr>
                            </table>

                            <!-- Security Notice -->
                            <div style="background-color: #F7F7FC; border-left: 4px solid #9A6DFF; padding: 15px 20px; border-radius: 4px; margin: 30px 0;">
                                <p style="margin: 0; font-size: 13px; color: #475569; line-height: 1.5;">
                                    <strong style="color: #6C4DFF;">Security Notice:</strong> If you did not request this password reset, simply ignore this email. Your account will remain secure.
                                </p>
                            </div>

                            <!-- Why PromptPal Section -->
                            <div style="margin: 35px 0; padding: 25px; background-color: #F7F7FC; border-radius: 8px;">
                                <h3 style="margin: 0 0 20px; font-size: 16px; font-weight: 700; color: #1E293B;">Why PromptPal?</h3>
                                <table width="100%" cellpadding="0" cellspacing="0">
                                    <tr>
                                        <td style="padding: 8px 0; font-size: 14px; color: #475569; line-height: 1.5;">
                                            ✓ AI Personalized Wellness
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 8px 0; font-size: 14px; color: #475569; line-height: 1.5;">
                                            ✓ Skin Care Guidance
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 8px 0; font-size: 14px; color: #475569; line-height: 1.5;">
                                            ✓ Hair Care Recommendations
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 8px 0; font-size: 14px; color: #475569; line-height: 1.5;">
                                            ✓ Body Wellness Plans
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 8px 0; font-size: 14px; color: #475569; line-height: 1.5;">
                                            ✓ 21-Day Wellness Journey
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 8px 0; font-size: 14px; color: #475569; line-height: 1.5;">
                                            ✓ Progress Tracking
                                        </td>
                                    </tr>
                                </table>
                            </div>

                            <!-- CTA Button -->
                            <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                                <tr>
                                    <td align="center">
                                        <a href="https://amayh18.github.io/Portfolio/" style="display: inline-block; background: linear-gradient(135deg, #6C4DFF 0%, #9A6DFF 100%); color: white; text-decoration: none; padding: 14px 32px; border-radius: 6px; font-size: 15px; font-weight: 600; letter-spacing: 0.3px; box-shadow: 0 4px 12px rgba(108, 77, 255, 0.3); transition: transform 0.2s;">
                                            Explore PromptPal
                                        </a>
                                    </td>
                                </tr>
                            </table>

                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td style="padding: 30px 40px; border-top: 1px solid #E2E8F0; background-color: #FAFBFC;">
                            <p style="margin: 0 0 15px; font-size: 14px; color: #1E293B; font-weight: 600;">Need help?</p>
                            <p style="margin: 0 0 20px; font-size: 13px; color: #475569;">
                                Email: <a href="mailto:promptpalwellness@gmail.com" style="color: #6C4DFF; text-decoration: none; font-weight: 600;">promptpalwellness@gmail.com</a>
                            </p>
                            <p style="margin: 0; font-size: 12px; color: #94A3B8; text-align: center;">
                                © 2026 PromptPal Wellness AI. All rights reserved.
                            </p>
                        </td>
                    </tr>

                </table>

            </td>
        </tr>
    </table>

</body>
</html>
""";
    }
}