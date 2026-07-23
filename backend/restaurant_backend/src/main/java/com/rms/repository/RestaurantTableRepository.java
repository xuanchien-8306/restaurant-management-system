package com.rms.repository;

import com.rms.model.RestaurantTable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.Optional;
import java.util.List;

public interface RestaurantTableRepository extends JpaRepository<RestaurantTable, Long> {

    @Query("SELECT t FROM RestaurantTable t WHERE t.status != 'DELETED' AND " +
            "(:keyword = '' OR LOWER(t.name) LIKE LOWER(CONCAT('%', :keyword, '%')) OR LOWER(t.tableCode) LIKE LOWER(CONCAT('%', :keyword, '%'))) AND " +
            "(:areaId = -1L OR t.area.id = :areaId) AND " +
            "(:status = '' OR t.status = :status)")
    Page<RestaurantTable> searchAndFilter(@Param("keyword") String keyword,
                                          @Param("areaId") Long areaId,
                                          @Param("status") String status,
                                          Pageable pageable);

    Optional<RestaurantTable> findByTableCode(String tableCode);

    List<RestaurantTable> findByStatusNot(String status);
}