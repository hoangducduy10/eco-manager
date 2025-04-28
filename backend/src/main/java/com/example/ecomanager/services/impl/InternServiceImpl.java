package com.example.ecomanager.services.impl;

import com.example.ecomanager.models.Intern;
import com.example.ecomanager.repositories.InternRepository;
import com.example.ecomanager.services.IInternService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class InternService implements IInternService {

    private final InternRepository internRepository;

    @Override
    public List<Intern> getAllInterns() {
        return internRepository.findAll();
    }

    @Override
    public Intern getInternById(Long id) {
        return internRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Intern not found with id: " + id));
    }

    @Override
    public Intern createIntern(Intern intern) {
        if(internRepository.findByEmail(intern.getEmail()).isPresent()) {
            throw new RuntimeException("Intern with email " + intern.getEmail() + " already exists!");
        }

        return internRepository.save(intern);
    }

    @Override
    public Intern updateIntern(Long id, Intern intern) {
        Intern existingIntern = internRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Intern not found with id: " + id));
        
    }

    @Override
    public void deleteIntern(Long id) {

    }

    @Override
    public Optional<Intern> findByFullNameAndActive(String fullName, Boolean active) {
        return Optional.empty();
    }
}
