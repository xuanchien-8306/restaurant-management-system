package com.rms.repository;

import com.rms.model.Promotion;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.Optional;

public interface PromotionRepository extends JpaRepository<Promotion, Long> {

    @Query("SELECT p FROM Promotion p WHERE p.status != 'DELETED' AND " +
            "(:keyword = '' OR LOWER(p.promoCode) LIKE LOWER(CONCAT('%', :keyword, '%')) OR LOWER(p.name) LIKE LOWER(CONCAT('%', :keyword, '%'))) AND " +
            "(:promoType = '' OR p.promoType = :promoType) AND " +
            "(:status = '' OR p.status = :status)")
    Page<Promotion> searchAndFilter(@Param("keyword") String keyword,
                                    @Param("promoType") String promoType,
                                    @Param("status") String status,
                                    Pageable pageable);

    Optional<Promotion> findByPromoCodeAndStatusNot(String promoCode, String status);
}