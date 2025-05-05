package com.example.ecomanager.controllers;

import com.example.ecomanager.dtos.InternDTO;
import com.example.ecomanager.responses.InternListResponse;
import com.example.ecomanager.responses.InternResponse;
import com.example.ecomanager.services.impl.InternServiceImpl;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindingResult;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("${api.prefix}/interns")
@RequiredArgsConstructor
public class InternController {

    private final InternServiceImpl internServiceImpl;

    @GetMapping
    public ResponseEntity<InternListResponse> getInterns(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String fullName,
            @RequestParam(required = false) Boolean active
    ) {
        PageRequest pageRequest = PageRequest.of(page, size, Sort.by("id").ascending());
        Page<InternResponse> internPage = internServiceImpl.getInterns(fullName, active, pageRequest);
        List<InternResponse> internList = internPage.getContent();
        return ResponseEntity.ok(InternListResponse.builder()
                .interns(internList)
                .totalPages(internPage.getTotalPages())
                .build());
    }

    @GetMapping("/{id}")
    public ResponseEntity<InternResponse> getInternById(@PathVariable Long id) throws Exception {
        InternResponse internResponse = internServiceImpl.getInternById(id);
        return ResponseEntity.ok(internResponse);
    }

    @PostMapping("/create")
    public ResponseEntity<?> createIntern(
            @Valid @RequestBody InternDTO internDTO,
            BindingResult bindingResult
    ) throws Exception {
        if(bindingResult.hasErrors()){
            List<String> errors = bindingResult.getFieldErrors()
                    .stream()
                    .map(FieldError::getDefaultMessage)
                    .toList();
            return ResponseEntity.badRequest().body(errors);
        }

        InternResponse internResponse = internServiceImpl.createIntern(internDTO);
        return ResponseEntity.ok(internResponse);
    }

    @PutMapping("/update/{id}")
    public ResponseEntity<InternResponse> updateIntern(@PathVariable Long id, @RequestBody InternDTO internDTO) throws Exception {
        InternResponse internResponse = internServiceImpl.updateIntern(id, internDTO);
        return ResponseEntity.ok(internResponse);
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<?> deleteIntern(@PathVariable Long id) {
        internServiceImpl.deleteIntern(id);
        return ResponseEntity.ok("Intern deleted successfully");
    }

}
