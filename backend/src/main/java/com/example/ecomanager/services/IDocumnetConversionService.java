package com.example.ecomanager.services;

public interface IDocumnetConversionService {

    byte[] convertDocxToPdf(Long fileId) throws Exception;

    String convertAndSavePdf(Long fileId) throws Exception;

}
