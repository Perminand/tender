package ru.perminov.tender.dto;

public class ImportColumnMappingDto {
    private String userId;
    private String companyId;
    private String mappingJson;

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }
    public String getCompanyId() { return companyId; }
    public void setCompanyId(String companyId) { this.companyId = companyId; }
    public String getMappingJson() { return mappingJson; }
    public void setMappingJson(String mappingJson) { this.mappingJson = mappingJson; }
} 