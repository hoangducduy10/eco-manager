package com.example.ecomanager.services.impl;

import com.example.ecomanager.dtos.InternDTO;
import com.example.ecomanager.exceptions.DataNotFoundException;
import com.example.ecomanager.models.Intern;
import com.example.ecomanager.repositories.InternRepository;
import com.example.ecomanager.responses.InternResponse;
import com.example.ecomanager.services.IInternService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class InternServiceImpl implements IInternService {

    private final InternRepository internRepository;
    private final ModelMapper modelMapper;

    @Override
    public Page<InternResponse> getInterns(String fullName, Boolean active, Pageable pageable) {
        Page<Intern> internPage = internRepository.findByFullNameAndActive(fullName, active, pageable);
        return internPage.map(InternResponse::fromIntern);
    }

    @Override
    @Transactional
    public InternResponse getInternById(Long id) throws Exception {
        Intern intern = internRepository.findById(id)
                .orElseThrow(() -> new DataNotFoundException("Intern not found with id: " + id));
        return InternResponse.fromIntern(intern);
    }

    @Override
    @Transactional
    public InternResponse createIntern(InternDTO internDTO) {
        if(internRepository.findByEmail(internDTO.getEmail()).isPresent()) {
            throw new RuntimeException("Intern with email " + internDTO.getEmail() + " already exists!");
        }

        Intern intern = modelMapper.map(internDTO, Intern.class);
        intern.setId(null);
        intern.setActive(true);

        return InternResponse.fromIntern(internRepository.save(intern));
    }

    @Override
    @Transactional
    public InternResponse updateIntern(Long id, InternDTO internDTO) throws Exception {
        Intern existingIntern = internRepository.findById(id)
                .orElseThrow(() -> new DataNotFoundException("Intern not found with id: " + id));
        if(!existingIntern.getEmail().equals(internDTO.getEmail()) && internRepository.findByEmail(internDTO.getEmail()).isPresent()) {
            throw new RuntimeException("Intern with email " + internDTO.getEmail() + " already exists!");
        }

        modelMapper.map(internDTO, existingIntern);
        return InternResponse.fromIntern(internRepository.save(existingIntern));
    }

    @Override
    public void deleteIntern(Long id) {
        Intern intern = internRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Intern not found with id: " + id));
        internRepository.delete(intern);
    }

}
