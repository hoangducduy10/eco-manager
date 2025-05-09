package com.example.ecomanager.responses;

import com.example.ecomanager.models.Product;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
public class ProductResponse extends BaseResponse{

    private Long id;

    private String name;

    private String description;

    private String status;

    public static ProductResponse fromProduct(Product product) {
        ProductResponse response = ProductResponse.builder()
                .id(product.getId())
                .name(product.getName())
                .description(product.getDescription())
                .status(product.getStatus().name())
                .build();

        response.setCreatedAt(product.getCreatedAt());
        response.setUpdatedAt(product.getUpdatedAt());

        return response;
    }


}
