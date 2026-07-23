package com.rms.repository;

import com.rms.model.RestaurantOrder;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface RestaurantOrderRepository extends JpaRepository<RestaurantOrder, Long> {

    @Query("SELECT o FROM RestaurantOrder o WHERE o.status != 'DELETED' AND " +
            "(:keyword = '' OR LOWER(o.orderCode) LIKE LOWER(CONCAT('%', :keyword, '%')) OR (o.customer IS NOT NULL AND LOWER(o.customer.fullName) LIKE LOWER(CONCAT('%', :keyword, '%')))) AND " +
            "(:status = '' OR o.status = :status) AND " +
            "(:orderType = '' OR o.orderType = :orderType)")
    Page<RestaurantOrder> searchAndFilter(@Param("keyword") String keyword,
                                          @Param("status") String status,
                                          @Param("orderType") String orderType,
                                          Pageable pageable);

    // Tìm đơn hàng đang hoạt động của một bàn (chưa hoàn thành hoặc chưa hủy)
    Optional<RestaurantOrder> findFirstByRestaurantTableIdAndStatusInOrderByIdDesc(Long tableId, List<String> statuses);
}