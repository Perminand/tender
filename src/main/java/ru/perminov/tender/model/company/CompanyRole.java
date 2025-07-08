package ru.perminov.tender.model.company;

public enum CompanyRole {
    SUPPLIER("Поставщик"),
    CUSTOMER("Заказчик"),
    BOTH("Поставщик и заказчик");
    
    private final String displayName;
    
    CompanyRole(String displayName) {
        this.displayName = displayName;
    }
    
    public String getDisplayName() {
        return displayName;
    }
} 