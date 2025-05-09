package com.example.ecomanager.services.impl;

import com.example.ecomanager.dtos.ProductDTO;
import com.example.ecomanager.enums.ProductStatus;
import com.example.ecomanager.exceptions.DataNotFoundException;
import com.example.ecomanager.models.Intern;
import com.example.ecomanager.models.Product;
import com.example.ecomanager.repositories.ProductRepository;
import com.example.ecomanager.responses.InternResponse;
import com.example.ecomanager.responses.ProductResponse;
import com.example.ecomanager.services.IProductService;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ProductServiceImpl implements IProductService {

    private final ProductRepository productRepository;
    private final ModelMapper modelMapper;

    @Override
    public Page<ProductResponse> getProducts(String name, ProductStatus status, Pageable pageable) {
        Page<Product> products = productRepository.findByNameAndStatus(name, status, pageable);
        return products.map(ProductResponse::fromProduct);
    }

    @Override
    public ProductResponse getProductById(Long id) throws Exception {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new DataNotFoundException("Product not found with id: " + id));
        return ProductResponse.fromProduct(product);
    }

    @Override
    public ProductResponse createProduct(ProductDTO productDTO) throws Exception {
        Product product = modelMapper.map(productDTO, Product.class);
        product.setId(null);

        if(productDTO.getStatus() != null && !productDTO.getStatus().isEmpty()){
            try {
                ProductStatus productStatus = ProductStatus.fromString(productDTO.getStatus());
                product.setStatus(productStatus);
            }catch (IllegalArgumentException e){
                throw new IllegalArgumentException("Invalid status value: " + productDTO.getStatus());
            }
        }else{
            product.setStatus(ProductStatus.DEVELOPING);
        }

        return ProductResponse.fromProduct(productRepository.save(product));
    }

    @Override
    public ProductResponse updateProduct(Long id, ProductDTO productDTO) throws Exception {
        Product existingProduct = productRepository.findById(id)
                .orElseThrow(() -> new DataNotFoundException("Product not found with id: " + id));

        modelMapper.map(productDTO, existingProduct);

        if(productDTO.getStatus() != null && !productDTO.getStatus().isEmpty()){
            try {
                ProductStatus productStatus = ProductStatus.fromString(productDTO.getStatus());
                existingProduct.setStatus(productStatus);
            }catch (IllegalArgumentException e){
                throw new IllegalArgumentException("Invalid status value: " + productDTO.getStatus());
            }
        }

        return ProductResponse.fromProduct(productRepository.save(existingProduct));
    }

    @Override
    public void deleteProduct(Long id) throws Exception{
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new DataNotFoundException("Product not found with id: " + id));

        productRepository.delete(product);
    }
}
