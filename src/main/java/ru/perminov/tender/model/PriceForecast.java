package ru.perminov.tender.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "price_forecasts")
@Getter
@Setter
@ToString
@NoArgsConstructor
public class PriceForecast {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "material_id")
    private Material material;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id")
    private Category category;

    private LocalDate forecastDate;

    private LocalDate validFrom;

    private LocalDate validTo;

    // Текущие цены
    private BigDecimal currentPrice;
    private BigDecimal averageMarketPrice;
    private BigDecimal minPrice;
    private BigDecimal maxPrice;

    // Прогнозные цены
    private BigDecimal forecastedPrice;
    private BigDecimal optimisticPrice;
    private BigDecimal pessimisticPrice;

    // Тренды
    private BigDecimal priceChange;
    private BigDecimal priceChangePercentage;
    private String trendDirection; // UP, DOWN, STABLE

    // Факторы влияния
    private String marketFactors;
    private String seasonalFactors;
    private String supplyDemandFactors;
    private String externalFactors;

    // Уверенность в прогнозе
    private BigDecimal confidenceLevel; // 0-100%
    private String confidenceFactors;

    // Источники данных
    private String dataSources;
    private String methodology;
    private String assumptions;

    // Статус прогноза
    @Enumerated(EnumType.STRING)
    private ForecastStatus status = ForecastStatus.DRAFT;

    private String createdBy;
    private LocalDateTime createdAt = LocalDateTime.now();
    private LocalDateTime updatedAt = LocalDateTime.now();

    public enum ForecastStatus {
        DRAFT,          // Черновик
        PUBLISHED,      // Опубликован
        VERIFIED,       // Проверен
        EXPIRED,        // Истек
        ARCHIVED        // Архивирован
    }

    // Методы для расчета прогноза
    public void calculatePriceChange() {
        if (currentPrice != null && forecastedPrice != null) {
            this.priceChange = forecastedPrice.subtract(currentPrice);
            if (currentPrice.compareTo(BigDecimal.ZERO) > 0) {
                this.priceChangePercentage = priceChange
                        .divide(currentPrice, 4, BigDecimal.ROUND_HALF_UP)
                        .multiply(BigDecimal.valueOf(100));
            }
        }
    }

    public void determineTrendDirection() {
        if (priceChange != null) {
            if (priceChange.compareTo(BigDecimal.ZERO) > 0) {
                this.trendDirection = "UP";
            } else if (priceChange.compareTo(BigDecimal.ZERO) < 0) {
                this.trendDirection = "DOWN";
            } else {
                this.trendDirection = "STABLE";
            }
        }
    }

    // Метод для оценки точности прогноза
    public BigDecimal calculateAccuracy(BigDecimal actualPrice) {
        if (forecastedPrice != null && actualPrice != null) {
            BigDecimal difference = forecastedPrice.subtract(actualPrice).abs();
            return difference.divide(actualPrice, 4, BigDecimal.ROUND_HALF_UP)
                    .multiply(BigDecimal.valueOf(100));
        }
        return BigDecimal.ZERO;
    }
} 