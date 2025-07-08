package ru.perminov.tender.service.impl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.perminov.tender.dto.NotificationDto;
import ru.perminov.tender.mapper.NotificationMapper;
import ru.perminov.tender.model.Notification;
import ru.perminov.tender.model.Tender;
import ru.perminov.tender.model.SupplierProposal;
import ru.perminov.tender.model.company.Company;
import ru.perminov.tender.repository.NotificationRepository;
import ru.perminov.tender.repository.company.CompanyRepository;
import ru.perminov.tender.service.EmailService;
import ru.perminov.tender.service.NotificationService;
import ru.perminov.tender.service.SettingsService;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;
    private final NotificationMapper notificationMapper;
    private final EmailService emailService;
    private final SettingsService settingsService;
    private final CompanyRepository companyRepository;

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("dd.MM.yyyy HH:mm");

    @Override
    @Transactional
    public void notifyTenderPublished(Tender tender, List<String> supplierEmails) {
        if (!Boolean.TRUE.equals(settingsService.getEmailSettings().enabled())) {
            log.info("Email notifications are disabled. Skipping notification creation.");
            return;
        }
        log.info("Создание уведомлений о публикации тендера: {}", tender.getTenderNumber());
        
        String title = "Опубликован новый тендер: " + tender.getTitle();
        String message = createTenderPublishedMessage(tender);
        
        for (String email : supplierEmails) {
            Company company = companyRepository.findByEmail(email).orElse(null);
            if (company != null && Boolean.FALSE.equals(company.getSendNotifications())) {
                log.info("Уведомления для компании {} отключены", company.getId());
                continue;
            }
            createAndSendNotification(
                Notification.NotificationType.TENDER_PUBLISHED,
                title,
                message,
                email,
                tender,
                null
            );
        }
    }

    @Override
    @Transactional
    public void notifyTenderDeadlineReminder(Tender tender, List<String> supplierEmails) {
        if (!Boolean.TRUE.equals(settingsService.getEmailSettings().enabled())) {
            log.info("Email notifications are disabled. Skipping notification creation.");
            return;
        }
        log.info("Создание напоминаний о дедлайне тендера: {}", tender.getTenderNumber());
        
        String title = "Напоминание о дедлайне тендера: " + tender.getTitle();
        String message = createDeadlineReminderMessage(tender);
        
        for (String email : supplierEmails) {
            Company company = companyRepository.findByEmail(email).orElse(null);
            if (company != null && Boolean.FALSE.equals(company.getSendNotifications())) {
                log.info("Уведомления для компании {} отключены", company.getId());
                continue;
            }
            createAndSendNotification(
                Notification.NotificationType.TENDER_REMINDER,
                title,
                message,
                email,
                tender,
                null
            );
        }
    }

    @Override
    @Transactional
    public void notifyProposalSubmitted(SupplierProposal proposal) {
        if (!Boolean.TRUE.equals(settingsService.getEmailSettings().enabled())) {
            log.info("Email notifications are disabled. Skipping notification creation.");
            return;
        }
        log.info("Создание уведомления о получении предложения: {}", proposal.getProposalNumber());
        
        String title = "Получено новое предложение по тендеру: " + proposal.getTender().getTitle();
        String message = createProposalSubmittedMessage(proposal);
        
        // Уведомляем заказчика (владельца тендера)
        if (proposal.getTender().getCustomer() != null && 
            proposal.getTender().getCustomer().getEmail() != null) {
            Company company = companyRepository.findByEmail(proposal.getTender().getCustomer().getEmail()).orElse(null);
            if (company != null && Boolean.FALSE.equals(company.getSendNotifications())) {
                log.info("Уведомления для компании {} отключены", company.getId());
                return;
            }
            createAndSendNotification(
                Notification.NotificationType.PROPOSAL_SUBMITTED,
                title,
                message,
                proposal.getTender().getCustomer().getEmail(),
                proposal.getTender(),
                proposal
            );
        }
    }

    @Override
    @Transactional
    public void notifyTenderAwarded(Tender tender, String winnerSupplierEmail) {
        if (!Boolean.TRUE.equals(settingsService.getEmailSettings().enabled())) {
            log.info("Email notifications are disabled. Skipping notification creation.");
            return;
        }
        log.info("Создание уведомления о присуждении тендера: {}", tender.getTenderNumber());
        
        String title = "Тендер присужден: " + tender.getTitle();
        String message = createTenderAwardedMessage(tender);
        
        Company company = companyRepository.findByEmail(winnerSupplierEmail).orElse(null);
        if (company != null && Boolean.FALSE.equals(company.getSendNotifications())) {
            log.info("Уведомления для компании {} отключены", company.getId());
            return;
        }
        createAndSendNotification(
            Notification.NotificationType.TENDER_AWARDED,
            title,
            message,
            winnerSupplierEmail,
            tender,
            null
        );
    }

    @Override
    @Transactional
    public void notifyTenderCancelled(Tender tender, List<String> supplierEmails) {
        if (!Boolean.TRUE.equals(settingsService.getEmailSettings().enabled())) {
            log.info("Email notifications are disabled. Skipping notification creation.");
            return;
        }
        log.info("Создание уведомлений об отмене тендера: {}", tender.getTenderNumber());
        
        String title = "Тендер отменен: " + tender.getTitle();
        String message = createTenderCancelledMessage(tender);
        
        for (String email : supplierEmails) {
            Company company = companyRepository.findByEmail(email).orElse(null);
            if (company != null && Boolean.FALSE.equals(company.getSendNotifications())) {
                log.info("Уведомления для компании {} отключены", company.getId());
                continue;
            }
            createAndSendNotification(
                Notification.NotificationType.TENDER_CANCELLED,
                title,
                message,
                email,
                tender,
                null
            );
        }
    }

    @Override
    @Transactional
    public void inviteSupplierToTender(Tender tender, String supplierEmail, String supplierName) {
        if (!Boolean.TRUE.equals(settingsService.getEmailSettings().enabled())) {
            log.info("Email notifications are disabled. Skipping notification creation.");
            return;
        }
        log.info("Создание приглашения поставщику к участию в тендере: {}", tender.getTenderNumber());
        
        String title = "Приглашение к участию в тендере: " + tender.getTitle();
        String message = createSupplierInvitationMessage(tender, supplierName);
        
        Company company = companyRepository.findByEmail(supplierEmail).orElse(null);
        if (company != null && Boolean.FALSE.equals(company.getSendNotifications())) {
            log.info("Уведомления для компании {} отключены", company.getId());
            return;
        }
        createAndSendNotification(
            Notification.NotificationType.SUPPLIER_INVITATION,
            title,
            message,
            supplierEmail,
            tender,
            null
        );
    }

    @Override
    @Transactional
    public void sendPendingNotifications() {
        log.info("Отправка ожидающих уведомлений");
        
        List<Notification> pendingNotifications = notificationRepository.findByStatus(Notification.NotificationStatus.PENDING);
        
        for (Notification notification : pendingNotifications) {
            boolean success = emailService.sendNotification(notification);
            if (success) {
                notificationRepository.save(notification);
                log.info("Уведомление отправлено: {}", notification.getId());
            } else {
                log.error("Ошибка отправки уведомления: {}", notification.getId());
            }
        }
    }

    @Override
    @Transactional(readOnly = true)
    public List<NotificationDto> getNotificationsByTender(UUID tenderId) {
        List<Notification> notifications = notificationRepository.findByTenderId(tenderId);
        return notifications.stream()
                .map(notificationMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<NotificationDto> getNotificationsBySupplier(UUID supplierId) {
        List<Notification> notifications = notificationRepository.findByRecipientCompanyId(supplierId);
        return notifications.stream()
                .map(notificationMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<NotificationDto> getNotificationsByStatus(Notification.NotificationStatus status) {
        List<Notification> notifications = notificationRepository.findByStatus(status);
        return notifications.stream()
                .map(notificationMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public boolean retryFailedNotification(UUID notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Уведомление не найдено"));
        
        if (notification.getStatus() == Notification.NotificationStatus.FAILED) {
            notification.setStatus(Notification.NotificationStatus.PENDING);
            notification.setErrorMessage(null);
            notificationRepository.save(notification);
            
            boolean success = emailService.sendNotification(notification);
            if (success) {
                notificationRepository.save(notification);
            }
            return success;
        }
        return false;
    }

    @Override
    @Transactional
    public void cancelNotification(UUID notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Уведомление не найдено"));
        
        notification.setStatus(Notification.NotificationStatus.CANCELLED);
        notificationRepository.save(notification);
    }

    private void createAndSendNotification(Notification.NotificationType type, String title, String message,
                                        String recipientEmail, Tender tender, SupplierProposal proposal) {
        Notification notification = new Notification();
        notification.setType(type);
        notification.setTitle(title);
        notification.setMessage(message);
        notification.setRecipientEmail(recipientEmail);
        notification.setTender(tender);
        notification.setSupplierProposal(proposal);
        notification.setStatus(Notification.NotificationStatus.PENDING);
        
        notification = notificationRepository.save(notification);
        
        boolean success = emailService.sendNotification(notification);
        if (success) {
            notificationRepository.save(notification);
            log.info("Уведомление создано и отправлено: {}", notification.getId());
        } else {
            log.error("Ошибка отправки уведомления: {}", notification.getId());
        }
    }

    private String createTenderPublishedMessage(Tender tender) {
        return String.format("""
            Здравствуйте!
            
            Опубликован новый тендер: %s
            
            Номер тендера: %s
            Описание: %s
            Дедлайн подачи предложений: %s
            
            Для участия в тендере перейдите в систему закупок.
            
            С уважением,
            Команда закупок
            """,
            tender.getTitle(),
            tender.getTenderNumber(),
            tender.getDescription(),
            tender.getSubmissionDeadline().format(DATE_FORMATTER)
        );
    }

    private String createDeadlineReminderMessage(Tender tender) {
        return String.format("""
            Здравствуйте!
            
            Напоминаем о приближающемся дедлайне подачи предложений по тендеру: %s
            
            Номер тендера: %s
            Дедлайн: %s
            
            Убедитесь, что ваше предложение подано вовремя.
            
            С уважением,
            Команда закупок
            """,
            tender.getTitle(),
            tender.getTenderNumber(),
            tender.getSubmissionDeadline().format(DATE_FORMATTER)
        );
    }

    private String createProposalSubmittedMessage(SupplierProposal proposal) {
        return String.format("""
            Здравствуйте!
            
            Получено новое предложение по тендеру: %s
            
            Номер тендера: %s
            Поставщик: %s
            Номер предложения: %s
            Общая стоимость: %.2f руб.
            
            Предложение доступно для рассмотрения в системе.
            
            С уважением,
            Команда закупок
            """,
            proposal.getTender().getTitle(),
            proposal.getTender().getTenderNumber(),
            proposal.getSupplier().getName(),
            proposal.getProposalNumber(),
            proposal.getTotalPrice()
        );
    }

    private String createTenderAwardedMessage(Tender tender) {
        return String.format("""
            Поздравляем!
            
            Ваше предложение по тендеру "%s" было признано победителем.
            
            Номер тендера: %s
            Дата присуждения: %s
            
            В ближайшее время с вами свяжется представитель заказчика для обсуждения деталей контракта.
            
            С уважением,
            Команда закупок
            """,
            tender.getTitle(),
            tender.getTenderNumber(),
            LocalDateTime.now().format(DATE_FORMATTER)
        );
    }

    private String createTenderCancelledMessage(Tender tender) {
        return String.format("""
            Здравствуйте!
            
            Тендер "%s" был отменен.
            
            Номер тендера: %s
            Дата отмены: %s
            
            Приносим извинения за неудобства.
            
            С уважением,
            Команда закупок
            """,
            tender.getTitle(),
            tender.getTenderNumber(),
            LocalDateTime.now().format(DATE_FORMATTER)
        );
    }

    private String createSupplierInvitationMessage(Tender tender, String supplierName) {
        return String.format("""
            Здравствуйте, %s!
            
            Приглашаем вас принять участие в тендере: %s
            
            Номер тендера: %s
            Описание: %s
            Дедлайн подачи предложений: %s
            
            Для участия в тендере перейдите в систему закупок и подайте ваше предложение.
            
            С уважением,
            Команда закупок
            """,
            supplierName,
            tender.getTitle(),
            tender.getTenderNumber(),
            tender.getDescription(),
            tender.getSubmissionDeadline().format(DATE_FORMATTER)
        );
    }

    @Override
    @Transactional(readOnly = true)
    public List<String> getSupplierEmailsForNotification(UUID tenderId) {
        // Получаем email адреса всех поставщиков
        return notificationRepository.findSupplierEmailsByRole();
    }

    @Override
    @Transactional(readOnly = true)
    public List<String> getCustomerEmailsForNotification(UUID tenderId) {
        // Получаем email адреса всех заказчиков
        return notificationRepository.findCustomerEmailsByRole();
    }

    @Override
    @Transactional
    public void notifyTenderPublishedToSuppliers(Tender tender) {
        if (!Boolean.TRUE.equals(settingsService.getEmailSettings().enabled())) {
            log.info("Email notifications are disabled. Skipping notification creation.");
            return;
        }
        log.info("Создание уведомлений о публикации тендера поставщикам: {}", tender.getTenderNumber());
        
        List<String> supplierEmails = getSupplierEmailsForNotification(tender.getId());
        if (!supplierEmails.isEmpty()) {
            notifyTenderPublished(tender, supplierEmails);
        } else {
            log.warn("Не найдены email адреса поставщиков для уведомлений");
        }
    }

    @Override
    @Transactional
    public void notifyTenderPublishedToCustomers(Tender tender) {
        if (!Boolean.TRUE.equals(settingsService.getEmailSettings().enabled())) {
            log.info("Email notifications are disabled. Skipping notification creation.");
            return;
        }
        log.info("Создание уведомлений о публикации тендера заказчикам: {}", tender.getTenderNumber());
        
        List<String> customerEmails = getCustomerEmailsForNotification(tender.getId());
        if (!customerEmails.isEmpty()) {
            String title = "Опубликован новый тендер: " + tender.getTitle();
            String message = createTenderPublishedMessage(tender);
            
            for (String email : customerEmails) {
                Company company = companyRepository.findByEmail(email).orElse(null);
                if (company != null && Boolean.FALSE.equals(company.getSendNotifications())) {
                    log.info("Уведомления для компании {} отключены", company.getId());
                    continue;
                }
                createAndSendNotification(
                    Notification.NotificationType.TENDER_PUBLISHED,
                    title,
                    message,
                    email,
                    tender,
                    null
                );
            }
        } else {
            log.warn("Не найдены email адреса заказчиков для уведомлений");
        }
    }

    @Override
    @Transactional(readOnly = true)
    public List<NotificationDto> getAll() {
        return notificationRepository.findAllByOrderByCreatedAtDesc().stream()
            .map(notificationMapper::toDto)
            .collect(java.util.stream.Collectors.toList());
    }
} 