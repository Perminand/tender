package ru.perminov.tender.service.impl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import ru.perminov.tender.model.Notification;
import ru.perminov.tender.service.EmailService;
import ru.perminov.tender.service.SettingsService;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailServiceImpl implements EmailService {

    private final JavaMailSender mailSender;
    private final SettingsService settingsService;

    @Value("${spring.mail.username}")
    private String defaultFromEmail;

    @Value("${notification.email.enabled:true}")
    private boolean defaultEmailEnabled;

    @Override
    public boolean sendNotification(Notification notification) {
        if (!isEmailEnabled()) {
            log.info("Email notifications disabled, skipping notification: {}", notification.getId());
            return false;
        }

        try {
            String subject = notification.getTitle();
            String message = notification.getMessage();
            
            boolean success = sendEmail(notification.getRecipientEmail(), subject, message);
            
            if (success) {
                notification.setStatus(Notification.NotificationStatus.SENT);
                notification.setSentAt(LocalDateTime.now());
            } else {
                notification.setStatus(Notification.NotificationStatus.FAILED);
                notification.setErrorMessage("Failed to send email");
            }
            
            return success;
        } catch (Exception e) {
            log.error("Error sending notification: {}", notification.getId(), e);
            notification.setStatus(Notification.NotificationStatus.FAILED);
            notification.setErrorMessage(e.getMessage());
            return false;
        }
    }

    @Override
    public boolean sendEmail(String to, String subject, String message) {
        if (!isEmailEnabled()) {
            log.info("Email notifications disabled, skipping email to: {}", to);
            return false;
        }

        try {
            SimpleMailMessage mailMessage = new SimpleMailMessage();
            mailMessage.setFrom(getFromEmail());
            mailMessage.setTo(to);
            mailMessage.setSubject(subject);
            mailMessage.setText(message);
            
            mailSender.send(mailMessage);
            log.info("Email sent successfully to: {}", to);
            return true;
        } catch (Exception e) {
            log.error("Error sending email to: {}", to, e);
            return false;
        }
    }

    @Override
    public boolean sendHtmlEmail(String to, String subject, String htmlContent) {
        if (!isEmailEnabled()) {
            log.info("Email notifications disabled, skipping HTML email to: {}", to);
            return false;
        }

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            
            helper.setFrom(getFromEmail());
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlContent, true);
            
            mailSender.send(message);
            log.info("HTML email sent successfully to: {}", to);
            return true;
        } catch (MessagingException e) {
            log.error("Error sending HTML email to: {}", to, e);
            return false;
        }
    }

    @Override
    public boolean isEmailServiceAvailable() {
        return isEmailEnabled() && mailSender != null;
    }
    
    private boolean isEmailEnabled() {
        try {
            return settingsService.getEmailSettings().enabled();
        } catch (Exception e) {
            log.warn("Failed to get email settings, using default: {}", defaultEmailEnabled);
            return defaultEmailEnabled;
        }
    }
    
    private String getFromEmail() {
        try {
            String fromEmail = settingsService.getEmailSettings().fromEmail();
            if (fromEmail != null && !fromEmail.trim().isEmpty()) {
                return fromEmail;
            }
            return defaultFromEmail;
        } catch (Exception e) {
            log.warn("Failed to get email settings, using default: {}", defaultFromEmail);
            return defaultFromEmail;
        }
    }
} 