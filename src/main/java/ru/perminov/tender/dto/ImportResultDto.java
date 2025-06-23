package ru.perminov.tender.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ImportResultDto {
    private int imported;
    private List<ImportError> errors = new ArrayList<>();

    public void addError(int row, String message) {
        this.errors.add(new ImportError(row, message));
    }

    public void incrementImported() {
        this.imported++;
    }

    @Getter
    @AllArgsConstructor
    public static class ImportError {
        private final int row;
        private final String message;
    }
} 