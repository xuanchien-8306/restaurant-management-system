package com.rms.repository;

import com.rms.model.Customer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface CustomerRepository extends JpaRepository<Customer, Long> {
    @Query("SELECT c FROM Customer c WHERE " +
            "c.status != 'DELETED' AND " +
            "(:keyword IS NULL OR LOWER(c.fullName) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
            "OR LOWER(c.account.email) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
            "OR c.account.phone LIKE CONCAT('%', :keyword, '%')) " +
            "AND (:status IS NULL OR c.status = :status)")
    Page<Customer> searchAndFilterCustomer(
            @Param("keyword") String keyword,
            @Param("status") String status,
            Pageable pageable);
}