package com.example.ecomanager.services;

import com.example.ecomanager.dtos.InternDTO;
import com.example.ecomanager.responses.InternResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface IInternService {

    Page<InternResponse> getInterns(String fullName, Boolean active, Pageable pageable);

    InternResponse getInternById(Long id) throws Exception;

    InternResponse createIntern(InternDTO internDTO) throws Exception;

    InternResponse updateIntern(Long id, InternDTO internDTO) throws Exception;

    void deleteIntern(Long id) throws Exception;

}
