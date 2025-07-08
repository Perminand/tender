package ru.perminov.tender.dto;

import ru.perminov.tender.model.Notification;
import ru.perminov.tender.model.company.Company;

import java.time.LocalDateTime;
import java.util.UUID;

public record NotificationDto(
    UUID id,
    Notification.NotificationType type,
    String title,
    String message,
    String recipientEmail,
    Company recipientCompany,
    UUID tenderId,
    String tenderNumber,
    String tenderTitle,
    UUID supplierProposalId,
    String supplierName,
    Notification.NotificationStatus status,
    LocalDateTime createdAt,
    LocalDateTime sentAt,
    String errorMessage
) {} 