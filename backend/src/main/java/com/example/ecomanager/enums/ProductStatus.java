package com.example.ecomanager.enums;

public enum ProductStatus {
    DEVELOPING,
    COMPLETED,
    PAUSED;

    public static ProductStatus fromString(String status) {
        return ProductStatus.valueOf(status.trim().toUpperCase());
    }

}
