package ru.perminov.tender.service;

import ru.perminov.tender.dto.InvoiceDto;
import ru.perminov.tender.dto.InvoiceDtoNew;
import ru.perminov.tender.dto.InvoiceDtoUpdate;
import ru.perminov.tender.dto.InvoiceItemDto;

import java.util.List;
import java.util.UUID;

public interface InvoiceService {
    
    InvoiceDto createInvoice(InvoiceDtoNew invoiceDtoNew);
    
    InvoiceDto getInvoiceById(UUID id);
    
    List<InvoiceDto> getAllInvoices();
    
    List<InvoiceDto> getInvoicesByRequest(UUID requestId);
    
    List<InvoiceDto> getInvoicesByContract(UUID contractId);
    
    List<InvoiceDto> getInvoicesBySupplier(UUID supplierId);
    
    List<InvoiceDto> getInvoicesByStatus(String status);
    
    InvoiceDto updateInvoice(UUID id, InvoiceDtoUpdate invoiceDtoUpdate);
    
    void deleteInvoice(UUID id);
    
    InvoiceDto confirmInvoice(UUID id);
    
    InvoiceDto payInvoice(UUID id, Double amount);
    
    InvoiceDto cancelInvoice(UUID id);
    
    List<InvoiceDto> getOverdueInvoices();
    
    List<InvoiceDto> getPendingPaymentInvoices();
    
    List<InvoiceItemDto> getInvoiceItems(UUID invoiceId);
} 