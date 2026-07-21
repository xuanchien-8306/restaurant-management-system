package com.rms.service;

import com.rms.dto.ContactRequest;

public interface ContactService {
    void submitContact(ContactRequest request);
}