package com.example.ecomanager.services;

import com.example.ecomanager.dtos.ProductDTO;
import com.example.ecomanager.enums.ProductStatus;
import com.example.ecomanager.responses.InternResponse;
import com.example.ecomanager.responses.ProductResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface IProductService {

    Page<ProductResponse> getProducts(String name, ProductStatus status, Pageable pageable);

    ProductResponse getProductById(Long id) throws Exception;

    ProductResponse createProduct(ProductDTO productDTO) throws Exception;

    ProductResponse updateProduct(Long id, ProductDTO productDTO) throws Exception;

    void deleteProduct(Long id) throws Exception;

}
