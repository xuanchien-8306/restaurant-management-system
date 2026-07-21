package com.rms.controller;

import com.rms.dto.ApiResponse;
import com.rms.dto.ContactRequest;
import com.rms.service.ContactService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/contact")
@RequiredArgsConstructor
public class ContactController {

    private final ContactService contactService;

    @PostMapping
    public ResponseEntity<ApiResponse<String>> submitContact(@Valid @RequestBody ContactRequest request) {
        contactService.submitContact(request);
        return ResponseEntity.ok(new ApiResponse<>(true, "Cảm ơn bạn đã liên hệ. Chúng tôi sẽ phản hồi sớm nhất!", null));
    }
}