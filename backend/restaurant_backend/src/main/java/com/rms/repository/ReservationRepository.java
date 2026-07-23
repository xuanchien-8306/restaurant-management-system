package com.rms.repository;

import com.rms.model.Reservation;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface ReservationRepository extends JpaRepository<Reservation, Long> {

    @Query("SELECT r FROM Reservation r WHERE r.status != 'DELETED' AND " +
            "(:keyword = '' OR LOWER(r.reservationCode) LIKE LOWER(CONCAT('%', :keyword, '%')) OR LOWER(r.customerName) LIKE LOWER(CONCAT('%', :keyword, '%')) OR r.customerPhone LIKE CONCAT('%', :keyword, '%')) AND " +
            "(:status = '' OR r.status = :status) AND " +
            "(:tableId = -1L OR r.restaurantTable.id = :tableId) AND " +
            "(cast(:date as date) IS NULL OR r.reservationDate = :date)")
    Page<Reservation> searchAndFilter(@Param("keyword") String keyword,
                                      @Param("status") String status,
                                      @Param("tableId") Long tableId,
                                      @Param("date") LocalDate date,
                                      Pageable pageable);

    List<Reservation> findByReservationDateAndStatusIn(LocalDate date, List<String> statuses);

    // BỔ SUNG HÀM NÀY CHO BOOKING SERVICE CỦA KHÁCH HÀNG
    List<Reservation> findByCustomerIdOrderByReservationDateDescReservationTimeDesc(Long customerId);
}