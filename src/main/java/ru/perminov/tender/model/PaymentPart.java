package ru.perminov.tender.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Table(name = "payment_parts")
@Getter
@Setter
@ToString
@NoArgsConstructor
public class PaymentPart {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "payment_condition_id", nullable = false)
    private PaymentCondition paymentCondition;

    @Column(nullable = false)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PaymentType paymentType;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal amount;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PaymentMoment paymentMoment;

    private String description;

    @Column(nullable = false)
    private Integer orderIndex;

    public enum PaymentType {
        PERCENTAGE("Процент"),
        FIXED_AMOUNT("Фиксированная сумма");

        private final String displayName;

        PaymentType(String displayName) {
            this.displayName = displayName;
        }

        public String getDisplayName() {
            return displayName;
        }
    }

    public enum PaymentMoment {
        ADVANCE("Аванс"),
        READY_TO_SHIP("По готовности к отправке"),
        UPON_DELIVERY("По факту поставки"),
        AFTER_ACCEPTANCE("После приемки"),
        AFTER_WARRANTY("После гарантийного срока"),
        CUSTOM("Произвольный момент");

        private final String displayName;

        PaymentMoment(String displayName) {
            this.displayName = displayName;
        }

        public String getDisplayName() {
            return displayName;
        }
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        PaymentPart that = (PaymentPart) o;
        return id != null && id.equals(that.id);
    }

    @Override
    public int hashCode() {
        return getId() != null ? getId().hashCode() : 0;
    }
}
