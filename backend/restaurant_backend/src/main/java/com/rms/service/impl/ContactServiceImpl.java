package com.rms.service.impl;

import com.rms.dto.ContactRequest;
import com.rms.model.Contact;
import com.rms.repository.ContactRepository;
import com.rms.service.ContactService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ContactServiceImpl implements ContactService {

    private final ContactRepository contactRepository;

    @Override
    public void submitContact(ContactRequest request) {
        Contact contact = Contact.builder()
                .name(request.getName())
                .email(request.getEmail())
                .subject(request.getSubject())
                .message(request.getMessage())
                .status("NEW")
                .build();

        contactRepository.save(contact);
    }
}