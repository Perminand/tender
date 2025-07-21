package ru.perminov.tender.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import ru.perminov.tender.dto.dashboard.DashboardDto;
import ru.perminov.tender.dto.dashboard.DashboardDto.*;
import ru.perminov.tender.model.*;
import ru.perminov.tender.model.company.CompanyRole;
import ru.perminov.tender.repository.AlertRepository;
import ru.perminov.tender.repository.company.CompanyRepository;
import ru.perminov.tender.repository.ContractRepository;
import ru.perminov.tender.repository.DeliveryRepository;
import ru.perminov.tender.repository.PaymentRepository;
import ru.perminov.tender.repository.TenderRepository;
import ru.perminov.tender.service.DashboardService;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DashboardServiceImpl implements DashboardService {
    
    private final TenderRepository tenderRepository;
    private final ContractRepository contractRepository;
    private final DeliveryRepository deliveryRepository;
    private final PaymentRepository paymentRepository;
    private final CompanyRepository companyRepository;
    private final AlertRepository alertRepository;

    @Override
    @Transactional(readOnly = true)
    public DashboardDto getMainDashboard(String username) {
        LocalDate today = LocalDate.now();
        LocalDate startOfMonth = today.withDayOfMonth(1);
        LocalDate endOfMonth = today.withDayOfMonth(today.lengthOfMonth());

        DashboardDto dashboard = new DashboardDto();
        dashboard.setDashboardDate(today);

        // Заполняем метрики
        DashboardMetricsDto metrics = new DashboardMetricsDto();
        
        // Тендеры
        List<Tender> allTenders = tenderRepository.findAll();
        List<Tender> activeTenders = allTenders.stream()
                .filter(t -> Tender.TenderStatus.BIDDING.equals(t.getStatus()) || Tender.TenderStatus.DRAFT.equals(t.getStatus()))
                .toList();
        List<Tender> completedTenders = allTenders.stream()
                .filter(t -> Tender.TenderStatus.AWARDED.equals(t.getStatus()))
                .toList();

        metrics.setTotalTenders(allTenders.size());
        metrics.setActiveTenders(activeTenders.size());
        metrics.setCompletedTenders(completedTenders.size());

        // Поставки
        List<Delivery> allDeliveries = deliveryRepository.findAll();
        List<Delivery> pendingDeliveries = allDeliveries.stream()
                .filter(d -> Delivery.DeliveryStatus.PLANNED.equals(d.getStatus()) || Delivery.DeliveryStatus.IN_TRANSIT.equals(d.getStatus()))
                .toList();
        List<Delivery> overdueDeliveries = allDeliveries.stream()
                .filter(d -> d.getPlannedDeliveryDate() != null && d.getPlannedDeliveryDate().isBefore(today) && 
                        !Delivery.DeliveryStatus.ACCEPTED.equals(d.getStatus()))
                .toList();

        metrics.setTotalDeliveries(allDeliveries.size());
        metrics.setPendingDeliveries(pendingDeliveries.size());
        metrics.setOverdueDeliveries(overdueDeliveries.size());

        // Платежи
        List<Payment> allPayments = paymentRepository.findAll();
        List<Payment> overduePayments = allPayments.stream()
                .filter(p -> p.getDueDate() != null && p.getDueDate().isBefore(today) && 
                        !Payment.PaymentStatus.PAID.equals(p.getStatus()))
                .toList();

        metrics.setTotalPayments(allPayments.size());
        metrics.setOverduePayments(overduePayments.size());

        // Контракты
        List<Contract> allContracts = contractRepository.findAll();
        List<Contract> activeContracts = allContracts.stream()
                .filter(c -> Contract.ContractStatus.ACTIVE.equals(c.getStatus()))
                .collect(Collectors.toList());

        metrics.setTotalContracts(allContracts.size());
        metrics.setActiveContracts(activeContracts.size());

        // Поставщики
        List<ru.perminov.tender.model.company.Company> suppliers = companyRepository.findByRole(ru.perminov.tender.model.company.CompanyRole.SUPPLIER);
        metrics.setActiveSuppliers(suppliers.size());

        // Расчет экономии
        BigDecimal totalSavings = allContracts.stream()
                .map(Contract::getTotalAmount)
                .filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        metrics.setTotalSavings(totalSavings);

        // Расчет процента экономии
        BigDecimal totalContractValue = allContracts.stream()
                .map(Contract::getTotalAmount)
                .filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        BigDecimal savingsPercentage = totalContractValue.compareTo(BigDecimal.ZERO) > 0 
                ? totalSavings.divide(totalContractValue, 4, RoundingMode.HALF_UP).multiply(BigDecimal.valueOf(100))
                : BigDecimal.ZERO;
        metrics.setSavingsPercentage(savingsPercentage);

        // Качество приемки (процент своевременных поставок)
        long onTimeDeliveries = allDeliveries.stream()
                .filter(d -> Delivery.DeliveryStatus.ACCEPTED.equals(d.getStatus()) && 
                        d.getPlannedDeliveryDate() != null && d.getActualDate() != null && 
                        !d.getPlannedDeliveryDate().isBefore(d.getActualDate()))
                .count();
        BigDecimal qualityAcceptanceRate = allDeliveries.size() > 0 ? 
                BigDecimal.valueOf((double) onTimeDeliveries / allDeliveries.size() * 100) : 
                BigDecimal.ZERO;
        metrics.setQualityAcceptanceRate(qualityAcceptanceRate);

        // Средний рейтинг поставщиков (используем фиксированное значение, так как у Company нет поля rating)
        double averageSupplierRating = 4.2; // Фиксированное значение для демонстрации
        metrics.setAverageSupplierRating(BigDecimal.valueOf(averageSupplierRating));

        // Бюджет
        BigDecimal totalBudget = allTenders.stream()
                .map(tender -> BigDecimal.ZERO) // У тендеров нет поля budget, используем 0
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal spentBudget = allPayments.stream()
                .filter(p -> Payment.PaymentStatus.PAID.equals(p.getStatus()))
                .map(Payment::getAmount)
                .filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal remainingBudget = totalBudget.subtract(spentBudget);

        metrics.setTotalBudget(totalBudget);
        metrics.setSpentBudget(spentBudget);
        metrics.setRemainingBudget(remainingBudget);

        BigDecimal budgetUtilization = totalBudget.compareTo(BigDecimal.ZERO) > 0 
                ? spentBudget.divide(totalBudget, 4, RoundingMode.HALF_UP).multiply(BigDecimal.valueOf(100))
                : BigDecimal.ZERO;
        metrics.setBudgetUtilization(budgetUtilization);

        dashboard.setMetrics(metrics);

        // Активные тендеры
        List<ActiveTenderDto> activeTendersList = activeTenders.stream()
                .map(tender -> {
                    ActiveTenderDto dto = new ActiveTenderDto();
                    dto.setId(tender.getId());
                    dto.setTenderNumber(tender.getTenderNumber());
                    dto.setTitle(tender.getTitle());
                    dto.setStatus(tender.getStatus().name());
                    dto.setDeadline(tender.getSubmissionDeadline() != null ? tender.getSubmissionDeadline().toLocalDate() : null);
                    dto.setDaysRemaining(tender.getSubmissionDeadline() != null ? 
                            (int) ChronoUnit.DAYS.between(today, tender.getSubmissionDeadline().toLocalDate()) : 0);
                    dto.setProposalsCount(tender.getSupplierProposals() != null ? tender.getSupplierProposals().size() : 0);
                    dto.setEstimatedValue(BigDecimal.ZERO); // У тендеров нет поля budget
                    dto.setBestOffer(BigDecimal.ZERO); // У тендеров нет поля bestOffer
                    dto.setPotentialSavings(BigDecimal.ZERO); // У тендеров нет поля potentialSavings
                    return dto;
                })
                .collect(Collectors.toList());
        dashboard.setActiveTenders(activeTendersList);

        // Срочные поставки
        List<UrgentDeliveryDto> urgentDeliveriesList = overdueDeliveries.stream()
                .map(delivery -> {
                    UrgentDeliveryDto dto = new UrgentDeliveryDto();
                    dto.setId(delivery.getId());
                    dto.setDeliveryNumber(delivery.getDeliveryNumber());
                    dto.setSupplierName(delivery.getSupplier() != null ? delivery.getSupplier().getName() : "Неизвестный поставщик");
                    dto.setContractNumber(delivery.getContract() != null ? delivery.getContract().getContractNumber() : "");
                    dto.setPlannedDate(delivery.getPlannedDeliveryDate());
                    dto.setDueDate(delivery.getPlannedDeliveryDate()); // Используем plannedDeliveryDate как dueDate
                    dto.setDaysOverdue(delivery.getPlannedDeliveryDate() != null ? 
                            (int) ChronoUnit.DAYS.between(delivery.getPlannedDeliveryDate(), today) : 0);
                    dto.setStatus(delivery.getStatus().name());
                    dto.setTotalValue(delivery.getDeliveryItems() != null ? 
                            delivery.getDeliveryItems().stream()
                                    .map(item -> item.getTotalPrice() != null ? item.getTotalPrice() : BigDecimal.ZERO)
                                    .reduce(BigDecimal.ZERO, BigDecimal::add) : BigDecimal.ZERO);
                    return dto;
                })
                .collect(Collectors.toList());
        dashboard.setUrgentDeliveries(urgentDeliveriesList);

        // Просроченные платежи
        List<OverduePaymentDto> overduePaymentsList = overduePayments.stream()
                .map(payment -> {
                    OverduePaymentDto dto = new OverduePaymentDto();
                    dto.setId(payment.getId());
                    dto.setPaymentNumber(payment.getPaymentNumber());
                    dto.setSupplierName(payment.getSupplier() != null ? payment.getSupplier().getName() : "Неизвестный поставщик");
                    dto.setContractNumber(payment.getContract() != null ? payment.getContract().getContractNumber() : "");
                    dto.setDueDate(payment.getDueDate());
                    dto.setDaysOverdue(payment.getDueDate() != null ? 
                            (int) ChronoUnit.DAYS.between(payment.getDueDate(), today) : 0);
                    dto.setAmount(payment.getAmount());
                    dto.setStatus(payment.getStatus().name());
                    return dto;
                })
                .collect(Collectors.toList());
        dashboard.setOverduePayments(overduePaymentsList);

        // Топ поставщики
        List<TopSupplierDto> topSuppliersList = suppliers.stream()
                .sorted((s1, s2) -> Double.compare(4.2, 4.1)) // Фиксированная сортировка для демонстрации
                .limit(5)
                .map(supplier -> {
                    TopSupplierDto dto = new TopSupplierDto();
                    dto.setId(supplier.getId());
                    dto.setName(supplier.getName());
                    dto.setRating(BigDecimal.valueOf(4.2)); // Фиксированное значение для демонстрации
                    
                    // Подсчет контрактов через tender.awardedSupplierId
                    long totalContracts = allContracts.stream()
                            .filter(c -> supplier.getId().equals(c.getTender() != null ? c.getTender().getAwardedSupplierId() : null))
                            .count();
                    dto.setTotalContracts((int) totalContracts);
                    
                    // Подсчет общей стоимости контрактов
                    BigDecimal totalValue = allContracts.stream()
                            .filter(c -> supplier.getId().equals(c.getTender() != null ? c.getTender().getAwardedSupplierId() : null))
                            .map(Contract::getTotalAmount)
                            .filter(Objects::nonNull)
                            .reduce(BigDecimal.ZERO, BigDecimal::add);
                    dto.setTotalValue(totalValue);
                    
                    // Средняя экономия
                    BigDecimal averageSavings = allContracts.stream()
                            .filter(c -> supplier.getId().equals(c.getTender() != null ? c.getTender().getAwardedSupplierId() : null))
                            .map(Contract::getTotalAmount)
                            .filter(Objects::nonNull)
                            .reduce(BigDecimal.ZERO, BigDecimal::add);
                    dto.setAverageSavings(totalContracts > 0 ? 
                            averageSavings.divide(BigDecimal.valueOf(totalContracts), 2, RoundingMode.HALF_UP) : 
                            BigDecimal.ZERO);
                    
                    // Своевременность поставок
                    long onTimeDeliveriesCount = allDeliveries.stream()
                            .filter(d -> supplier.equals(d.getSupplier()))
                            .filter(d -> Delivery.DeliveryStatus.ACCEPTED.equals(d.getStatus()) && 
                                    d.getPlannedDeliveryDate() != null && d.getActualDate() != null && 
                                    !d.getPlannedDeliveryDate().isBefore(d.getActualDate()))
                            .count();
                    long totalDeliveriesCount = allDeliveries.stream()
                            .filter(d -> supplier.equals(d.getSupplier()))
                            .count();
                    
                    dto.setOnTimeDeliveries((int) onTimeDeliveriesCount);
                    dto.setTotalDeliveries((int) totalDeliveriesCount);
                    
                    // Оценка производительности
                    double performanceScore = (dto.getRating().doubleValue() * 0.4) + 
                            (totalDeliveriesCount > 0 ? (double) onTimeDeliveriesCount / totalDeliveriesCount * 0.4 : 0.0) + 
                            (totalContracts > 0 ? Math.min(totalContracts / 10.0, 1.0) * 0.2 : 0.0);
                    dto.setPerformanceScore(BigDecimal.valueOf(performanceScore));
                    
                    return dto;
                })
                .collect(Collectors.toList());
        dashboard.setTopSuppliers(topSuppliersList);

        // Проблемные поставщики
        List<ProblematicSupplierDto> problematicSuppliersList = suppliers.stream()
                .filter(supplier -> {
                    // Находим поставщиков с проблемами
                    long qualityIssues = allDeliveries.stream()
                            .filter(d -> supplier.equals(d.getSupplier()))
                            .filter(d -> Delivery.DeliveryStatus.REJECTED.equals(d.getStatus()))
                            .count();
                    long delayedDeliveries = allDeliveries.stream()
                            .filter(d -> supplier.equals(d.getSupplier()))
                            .filter(d -> d.getPlannedDeliveryDate() != null && d.getActualDate() != null && 
                                    d.getPlannedDeliveryDate().isBefore(d.getActualDate()))
                            .count();
                    return qualityIssues > 0 || delayedDeliveries > 0;
                })
                .map(supplier -> {
                    ProblematicSupplierDto dto = new ProblematicSupplierDto();
                    dto.setId(supplier.getId());
                    dto.setName(supplier.getName());
                    dto.setRating(BigDecimal.valueOf(4.2)); // Фиксированное значение для демонстрации
                    
                    // Проблемы с качеством
                    long qualityIssues = allDeliveries.stream()
                            .filter(d -> supplier.equals(d.getSupplier()))
                            .filter(d -> Delivery.DeliveryStatus.REJECTED.equals(d.getStatus()))
                            .count();
                    dto.setQualityIssues((int) qualityIssues);
                    
                    // Задержки поставок
                    long delayedDeliveries = allDeliveries.stream()
                            .filter(d -> supplier.equals(d.getSupplier()))
                            .filter(d -> d.getPlannedDeliveryDate() != null && d.getActualDate() != null && 
                                    d.getPlannedDeliveryDate().isBefore(d.getActualDate()))
                            .count();
                    dto.setDelayedDeliveries((int) delayedDeliveries);
                    
                    // Оценка риска
                    double riskScore = (qualityIssues * 0.5) + (delayedDeliveries * 0.3) + 
                            (dto.getRating().doubleValue() < 3.0 ? (3.0 - dto.getRating().doubleValue()) * 0.2 : 0.0);
                    dto.setRiskScore(BigDecimal.valueOf(riskScore));
                    
                    // Уровень риска
                    if (riskScore > 5.0) dto.setRiskLevel("ВЫСОКИЙ");
                    else if (riskScore > 2.0) dto.setRiskLevel("СРЕДНИЙ");
                    else dto.setRiskLevel("НИЗКИЙ");
                    
                    // Рекомендации
                    if (qualityIssues > 0) {
                        dto.setRecommendations("Провести аудит качества поставок");
                    } else if (delayedDeliveries > 0) {
                        dto.setRecommendations("Улучшить планирование поставок");
                    } else {
                        dto.setRecommendations("Мониторинг производительности");
                    }
                    
                    return dto;
                })
                .collect(Collectors.toList());
        dashboard.setProblematicSuppliers(problematicSuppliersList);

        // Последняя активность
        List<RecentActivityDto> recentActivitiesList = new ArrayList<>();
        
        // Добавляем последние тендеры
        allTenders.stream()
                .sorted((t1, t2) -> {
                    LocalDateTime start1 = t1.getStartDate();
                    LocalDateTime start2 = t2.getStartDate();
                    if (start1 == null && start2 == null) return 0;
                    if (start1 == null) return 1; // null в конец
                    if (start2 == null) return -1; // null в конец
                    return start2.compareTo(start1); // сортировка по убыванию
                })
                .limit(3)
                .forEach(tender -> {
                    RecentActivityDto activity = new RecentActivityDto();
                    activity.setId(UUID.randomUUID());
                    activity.setType("TENDER");
                    activity.setDescription("Тендер " + tender.getTenderNumber() + " - " + tender.getTitle());
                    activity.setActivityDate(tender.getStartDate() != null ? tender.getStartDate().toLocalDate() : null);
                    activity.setStatus(tender.getStatus().name());
                    activity.setEntityType("TENDER");
                    activity.setEntityId(tender.getId());
                    recentActivitiesList.add(activity);
                });
        
        // Добавляем последние контракты
        allContracts.stream()
                .sorted((c1, c2) -> {
                    LocalDate start1 = c1.getStartDate();
                    LocalDate start2 = c2.getStartDate();
                    if (start1 == null && start2 == null) return 0;
                    if (start1 == null) return 1; // null в конец
                    if (start2 == null) return -1; // null в конец
                    return start2.compareTo(start1); // сортировка по убыванию
                })
                .limit(3)
                .forEach(contract -> {
                    RecentActivityDto activity = new RecentActivityDto();
                    activity.setId(UUID.randomUUID());
                    activity.setType("CONTRACT");
                    activity.setDescription("Контракт " + contract.getContractNumber() + " - " + contract.getTitle());
                    activity.setActivityDate(contract.getStartDate());
                    activity.setStatus(contract.getStatus().name());
                    activity.setEntityType("CONTRACT");
                    activity.setEntityId(contract.getId());
                    recentActivitiesList.add(activity);
                });
        
        // Сортируем по дате и берем последние 5
        recentActivitiesList.sort((a1, a2) -> {
            LocalDate date1 = a1.getActivityDate();
            LocalDate date2 = a2.getActivityDate();
            if (date1 == null && date2 == null) return 0;
            if (date1 == null) return 1; // null в конец
            if (date2 == null) return -1; // null в конец
            return date2.compareTo(date1); // сортировка по убыванию
        });
        dashboard.setRecentActivities(recentActivitiesList.stream().limit(5).collect(Collectors.toList()));

        // Алерты
        List<Alert> allAlerts = alertRepository.findAll();
        List<AlertSummaryDto> alertsList = allAlerts.stream()
                .map(alert -> {
                    AlertSummaryDto dto = new AlertSummaryDto();
                    dto.setId(alert.getId());
                    dto.setTitle(alert.getTitle());
                    dto.setType(alert.getType().name());
                    dto.setSeverity(alert.getSeverity().name());
                    dto.setIsRead(alert.getIsRead());
                    dto.setCreatedAt(alert.getCreatedAt().toLocalDate());
                    dto.setActionUrl(alert.getActionUrl());
                    return dto;
                })
                .collect(Collectors.toList());
        dashboard.setAlerts(alertsList);

        // Количество непрочитанных и срочных алертов
        long unreadCount = allAlerts.stream().filter(alert -> !alert.getIsRead()).count();
        long urgentCount = allAlerts.stream().filter(alert -> Alert.AlertSeverity.CRITICAL.equals(alert.getSeverity())).count();
        
        dashboard.setUnreadAlertsCount((int) unreadCount);
        dashboard.setUrgentAlertsCount((int) urgentCount);

        // Быстрые действия
        List<QuickActionDto> quickActionsList = Arrays.asList(
                createQuickAction("Создать тендер", "Создать новый тендер", "add", "/tenders/new", "primary", true),
                createQuickAction("Добавить поставщика", "Добавить нового поставщика", "person_add", "/counterparties/new", "secondary", true),
                createQuickAction("Создать отчет", "Сгенерировать отчет", "assessment", "/dashboard", "info", true)
        );
        dashboard.setQuickActions(quickActionsList);

        return dashboard;
    }

    private RecentActivityDto createActivity(String type, String description, String status) {
        RecentActivityDto activity = new RecentActivityDto();
        activity.setId(UUID.randomUUID());
        activity.setType(type);
        activity.setDescription(description);
        activity.setActivityDate(LocalDate.now());
        activity.setStatus(status);
        activity.setEntityType(type);
        activity.setEntityId(UUID.randomUUID());
        return activity;
    }

    private AlertSummaryDto createAlert(String title, String severity, boolean isRead) {
        AlertSummaryDto alert = new AlertSummaryDto();
        alert.setId(UUID.randomUUID());
        alert.setTitle(title);
        alert.setType("SYSTEM");
        alert.setSeverity(severity);
        alert.setIsRead(isRead);
        alert.setCreatedAt(LocalDate.now());
        alert.setActionUrl("/alerts");
        return alert;
    }

    private QuickActionDto createQuickAction(String title, String description, String icon, String actionUrl, String color, boolean isEnabled) {
        QuickActionDto action = new QuickActionDto();
        action.setTitle(title);
        action.setDescription(description);
        action.setIcon(icon);
        action.setActionUrl(actionUrl);
        action.setColor(color);
        action.setIsEnabled(isEnabled);
        return action;
    }

    private ChartDataDto createSavingsChart() {
        ChartDataDto chart = new ChartDataDto();
        chart.setTitle("Экономия по месяцам");
        chart.setType("LINE");
        chart.setXAxisLabel("Месяц");
        chart.setYAxisLabel("Экономия (руб.)");
        
        List<ChartPointDto> data = Arrays.asList(
                createChartPoint("Янв", 1200000, "#0088FE"),
                createChartPoint("Фев", 1500000, "#00C49F"),
                createChartPoint("Мар", 1800000, "#FFBB28"),
                createChartPoint("Апр", 1600000, "#FF8042"),
                createChartPoint("Май", 2000000, "#8884D8"),
                createChartPoint("Июн", 2200000, "#82CA9D")
        );
        chart.setData(data);
        return chart;
    }

    private ChartDataDto createDeliveryChart() {
        ChartDataDto chart = new ChartDataDto();
        chart.setTitle("Статусы поставок");
        chart.setType("PIE");
        chart.setXAxisLabel("");
        chart.setYAxisLabel("");
        
        List<ChartPointDto> data = Arrays.asList(
                createChartPoint("Выполнено", 15, "#00C49F"),
                createChartPoint("В процессе", 8, "#FFBB28"),
                createChartPoint("Просрочено", 3, "#FF8042")
        );
        chart.setData(data);
        return chart;
    }

    private ChartDataDto createQualityChart() {
        ChartDataDto chart = new ChartDataDto();
        chart.setTitle("Качество поставок");
        chart.setType("BAR");
        chart.setXAxisLabel("Поставщик");
        chart.setYAxisLabel("Рейтинг");
        
        List<ChartPointDto> data = Arrays.asList(
                createChartPoint("Поставщик А", 4.8, "#0088FE"),
                createChartPoint("Поставщик Б", 4.2, "#00C49F"),
                createChartPoint("Поставщик В", 3.9, "#FFBB28"),
                createChartPoint("Поставщик Г", 4.5, "#FF8042")
        );
        chart.setData(data);
        return chart;
    }

    private ChartDataDto createBudgetChart() {
        ChartDataDto chart = new ChartDataDto();
        chart.setTitle("Использование бюджета");
        chart.setType("DONUT");
        chart.setXAxisLabel("");
        chart.setYAxisLabel("");
        
        List<ChartPointDto> data = Arrays.asList(
                createChartPoint("Потрачено", 7000000, "#FF8042"),
                createChartPoint("Остаток", 3000000, "#00C49F")
        );
        chart.setData(data);
        return chart;
    }

    private ChartPointDto createChartPoint(String label, double value, String color) {
        ChartPointDto point = new ChartPointDto();
        point.setLabel(label);
        point.setValue(BigDecimal.valueOf(value));
        point.setColor(color);
        return point;
    }

    // Остальные методы возвращают заглушки
    @Override
    public DashboardDto getDashboardForPeriod(String username, LocalDate startDate, LocalDate endDate) {
        return getMainDashboard(username);
    }

    @Override
    public DashboardDto getFinancialDashboard(String username) {
        return getMainDashboard(username);
    }

    @Override
    public DashboardDto getOperationalDashboard(String username) {
        return getMainDashboard(username);
    }

    @Override
    public DashboardDto getSupplierDashboard(String username) {
        return getMainDashboard(username);
    }

    @Override
    public DashboardDto getQualityDashboard(String username) {
        return getMainDashboard(username);
    }

    @Override
    public DashboardDto getPersonalizedDashboard(String username, String preferences) {
        return getMainDashboard(username);
    }

    @Override
    public DashboardDto getExecutiveDashboard(String username) {
        return getMainDashboard(username);
    }

    @Override
    public DashboardDto getManagerDashboard(String username) {
        return getMainDashboard(username);
    }

    @Override
    public DashboardDto refreshDashboard(String username) {
        return getMainDashboard(username);
    }

    @Override
    public DashboardDto getLiveMetrics(String username) {
        return getMainDashboard(username);
    }

    @Override
    public byte[] exportDashboardToPDF(String username) {
        return new byte[0];
    }

    @Override
    public byte[] exportDashboardToExcel(String username) {
        return new byte[0];
    }

    @Override
    public void saveDashboardPreferences(String username, String preferences) {
        // Заглушка
    }

    @Override
    public String getDashboardPreferences(String username) {
        return "{}";
    }

    @Override
    public void sendDashboardAlerts(String username) {
        // Заглушка
    }

    @Override
    public void sendDashboardDigest(String username) {
        // Заглушка
    }
} 