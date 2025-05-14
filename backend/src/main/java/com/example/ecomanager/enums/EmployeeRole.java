package com.example.ecomanager.enums;

public enum EmployeeRole {
    LEADER,
    DEVELOPER,
    TESTER;

    public static EmployeeRole fromString(String role) {
        return EmployeeRole.valueOf(role.trim().toUpperCase());
    }
}
