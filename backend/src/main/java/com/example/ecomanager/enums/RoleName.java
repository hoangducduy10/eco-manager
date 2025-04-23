package com.example.ecomanager.enums;

public enum RoleName {
    ADMIN("ROLE_ADMIN"),
    STAFF("ROLE_STAFF");

    private final String value;

    RoleName(String value) {
        this.value = value;
    }

    public String getValue() {
        return value;
    }
}
