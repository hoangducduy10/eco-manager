package com.example.ecomanager.responses;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@Builder
public class ProductListResponse {

    private List<ProductResponse> products;

    private int totalPages;

}
