package ru.perminov.tender.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Table(name = "delivery_conditions")
@Getter
@Setter
@ToString
@NoArgsConstructor
public class DeliveryCondition {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String name;

    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private DeliveryType deliveryType;

    @Column(precision = 10, scale = 2)
    private BigDecimal deliveryCost;

    private String deliveryAddress;

    private String deliveryPeriod;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private DeliveryResponsibility deliveryResponsibility;

    private String additionalTerms;

    public enum DeliveryType {
        PICKUP("Самовывоз"),
        DELIVERY_TO_WAREHOUSE("Доставка на склад"),
        DELIVERY_TO_SITE("Доставка на объект"),
        EX_WORKS("EXW - Франко завод"),
        FCA("FCA - Франко перевозчик"),
        CPT("CPT - Фрахт оплачен до"),
        CIP("CIP - Фрахт и страхование оплачены до"),
        DAP("DAP - Поставка в месте назначения"),
        DPU("DPU - Поставка в месте назначения разгружено"),
        DDP("DDP - Поставка с оплатой пошлин"),
        INCLUDED_IN_PRICE("Доставка включена в стоимость"),
        SEPARATE_LINE("Доставка отдельной строкой"),
        THIRD_PARTY_INVOICE("Сторонний счет на доставку");

        private final String displayName;

        DeliveryType(String displayName) {
            this.displayName = displayName;
        }

        public String getDisplayName() {
            return displayName;
        }
    }

    public enum DeliveryResponsibility {
        SUPPLIER("Поставщик"),
        CUSTOMER("Заказчик"),
        SHARED("Разделенная ответственность");

        private final String displayName;

        DeliveryResponsibility(String displayName) {
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
        DeliveryCondition that = (DeliveryCondition) o;
        return id != null && id.equals(that.id);
    }

    @Override
    public int hashCode() {
        return getId() != null ? getId().hashCode() : 0;
    }
}
