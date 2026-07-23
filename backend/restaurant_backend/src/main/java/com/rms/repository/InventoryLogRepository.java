package com.rms.repository;

import com.rms.model.InventoryLog;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface InventoryLogRepository extends JpaRepository<InventoryLog, Long> {
    List<InventoryLog> findByIngredientIdOrderByCreatedAtDesc(Long ingredientId);
}