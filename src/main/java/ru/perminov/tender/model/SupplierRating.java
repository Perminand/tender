package ru.perminov.tender.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;
import ru.perminov.tender.model.company.Company;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "supplier_ratings")
@Getter
@Setter
@ToString
@NoArgsConstructor
public class SupplierRating {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "supplier_id")
    private Company supplier;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "contract_id")
    private Contract contract;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "delivery_id")
    private Delivery delivery;

    // Оценки по критериям (1-5 баллов)
    private Integer qualityRating;        // Качество товара
    private Integer deliveryTimeRating;   // Соблюдение сроков
    private Integer priceRating;          // Соответствие цен
    private Integer communicationRating;  // Качество коммуникации
    private Integer reliabilityRating;    // Надежность поставщика

    // Общая оценка
    private BigDecimal overallRating;

    // Комментарии
    private String qualityComments;
    private String deliveryComments;
    private String priceComments;
    private String communicationComments;
    private String reliabilityComments;
    private String generalComments;

    // Статистика
    private Integer totalContracts;
    private Integer completedContracts;
    private Integer delayedDeliveries;
    private Integer qualityIssues;
    private BigDecimal totalAmount;
    private BigDecimal averageSavings;

    // Метаданные
    private LocalDateTime ratingDate = LocalDateTime.now();
    private String ratedBy;
    private LocalDateTime createdAt = LocalDateTime.now();
    private LocalDateTime updatedAt = LocalDateTime.now();

    public enum RatingStatus {
        DRAFT,          // Черновик
        SUBMITTED,      // Отправлено
        APPROVED,       // Утверждено
        REJECTED        // Отклонено
    }

    @Enumerated(EnumType.STRING)
    private RatingStatus status = RatingStatus.DRAFT;

    // Метод для расчета общей оценки
    public void calculateOverallRating() {
        if (qualityRating != null && deliveryTimeRating != null && 
            priceRating != null && communicationRating != null && reliabilityRating != null) {
            
            double sum = qualityRating + deliveryTimeRating + priceRating + 
                        communicationRating + reliabilityRating;
            this.overallRating = BigDecimal.valueOf(sum / 5.0);
        }
    }
} 