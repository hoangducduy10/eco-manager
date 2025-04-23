package com.example.ecomanager.exceptions;

public class PermissionDenyException extends Exception{
    public PermissionDenyException(String message){
        super(message);
    }
}
