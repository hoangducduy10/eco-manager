package com.example.ecomanager.enums;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum AssignmentStatus {
    active,
    inactive;

    public static final AssignmentStatus ACTIVE = active;
    public static final AssignmentStatus INACTIVE = inactive;

    @JsonValue
    public String getValue() {
        return name();
    }

    public static AssignmentStatus fromString(String value) {
        if (value == null) throw new IllegalArgumentException("Status is null");

        String normalizedValue = value.trim().toLowerCase();
        try {
            return AssignmentStatus.valueOf(normalizedValue);
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid status: " + value);
        }
    }

    @JsonCreator
    public static AssignmentStatus fromValue(String value) {
        return fromString(value);
    }

    @Override
    public String toString() {
        return name();
    }
}