package com.example.ecomanager.services;

public interface IDocumnetConversionService {

    byte[] convertDocxToPdf(String docxFileName) throws Exception;

    String convertAndSavePdf(String docxFileName) throws Exception;

}
