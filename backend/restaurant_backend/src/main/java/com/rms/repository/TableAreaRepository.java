package com.rms.repository;

import com.rms.model.TableArea;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface TableAreaRepository extends JpaRepository<TableArea, Long> {
    List<TableArea> findByStatusNot(String status);
}