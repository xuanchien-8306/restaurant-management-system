package com.rms.repository;

import com.rms.model.Staff;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface StaffRepository extends JpaRepository<Staff, Long> {

    @Query("SELECT s FROM Staff s WHERE " +
            "(:keyword IS NULL OR LOWER(s.fullName) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
            "OR LOWER(s.account.email) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
            "OR s.account.phone LIKE CONCAT('%', :keyword, '%')) " +
            "AND (:roleId IS NULL OR s.account.role.id = :roleId) " +
            "AND (:status IS NULL OR s.status = :status)")
    Page<Staff> searchAndFilterStaff(
            @Param("keyword") String keyword,
            @Param("roleId") Long roleId,
            @Param("status") String status,
            Pageable pageable);
}