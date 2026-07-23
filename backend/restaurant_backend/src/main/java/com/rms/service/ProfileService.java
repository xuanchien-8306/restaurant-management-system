package com.rms.service;

import com.rms.dto.ProfileDtos.*;

public interface ProfileService {
    ProfileResponse getCurrentUserProfile();
    ProfileResponse updateProfile(UpdateProfileRequest request);
    void changePassword(ChangePasswordRequest request);
    void logout();
}