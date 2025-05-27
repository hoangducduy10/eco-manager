package com.example.ecomanager.enums;

public enum UserRole {
    ADMIN("ROLE_ADMIN"),
    STAFF("ROLE_STAFF");

    private final String value;

    UserRole(String value) {
        this.value = value;
    }

    public String getValue() {
        return value;
    }
}
