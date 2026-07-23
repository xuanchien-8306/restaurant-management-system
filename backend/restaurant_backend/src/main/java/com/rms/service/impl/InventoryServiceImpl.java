package com.rms.service.impl;

import com.rms.dto.InventoryDtos.*;
import com.rms.dto.PageResponse;
import com.rms.model.Ingredient;
import com.rms.model.IngredientCategory;
import com.rms.model.InventoryLog;
import com.rms.model.Supplier;
import com.rms.repository.IngredientCategoryRepository;
import com.rms.repository.IngredientRepository;
import com.rms.repository.InventoryLogRepository;
import com.rms.repository.SupplierRepository;
import com.rms.service.InventoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class InventoryServiceImpl implements InventoryService {

    private final IngredientRepository ingredientRepository;
    private final SupplierRepository supplierRepository;
    private final IngredientCategoryRepository categoryRepository;
    private final InventoryLogRepository logRepository;

    @Override
    @Transactional(readOnly = true) // Thêm dòng này để tránh lỗi Lazy Load
    public PageResponse<IngredientDto> getIngredients(String keyword, Long categoryId, Long supplierId, String status, int page, int size, String sortBy, String sortDir) {
        Sort sort = sortDir.equalsIgnoreCase(Sort.Direction.ASC.name()) ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);

        // --- BẮT ĐẦU ĐOẠN SỬA MỚI ---
        String searchKey = (keyword != null && !keyword.trim().isEmpty()) ? keyword.trim() : "";
        String filterStatus = (status != null && !status.trim().isEmpty()) ? status.trim() : "";
        Long filterCategory = (categoryId != null) ? categoryId : -1L;
        Long filterSupplier = (supplierId != null) ? supplierId : -1L;

        Page<Ingredient> ingredientPage = ingredientRepository.searchAndFilter(searchKey, filterCategory, filterSupplier, filterStatus, pageable);
        // --- KẾT THÚC ĐOẠN SỬA MỚI ---

        return PageResponse.<IngredientDto>builder()
                .content(ingredientPage.getContent().stream().map(this::mapToDto).collect(Collectors.toList()))
                .pageNumber(ingredientPage.getNumber())
                .pageSize(ingredientPage.getSize())
                .totalElements(ingredientPage.getTotalElements())
                .totalPages(ingredientPage.getTotalPages())
                .last(ingredientPage.isLast())
                .build();
    }

    @Override
    public IngredientDto getIngredientById(Long id) {
        Ingredient ingredient = ingredientRepository.findById(id).orElseThrow(() -> new RuntimeException("Không tìm thấy nguyên liệu"));
        return mapToDto(ingredient);
    }

    @Override
    @Transactional
    public IngredientDto createIngredient(IngredientRequest request) {
        Ingredient ingredient = new Ingredient();
        mapRequestToEntity(request, ingredient);
        ingredient = ingredientRepository.save(ingredient);
        return mapToDto(ingredient);
    }

    @Override
    @Transactional
    public IngredientDto updateIngredient(Long id, IngredientRequest request) {
        Ingredient ingredient = ingredientRepository.findById(id).orElseThrow(() -> new RuntimeException("Không tìm thấy nguyên liệu"));
        mapRequestToEntity(request, ingredient);
        ingredient = ingredientRepository.save(ingredient);
        return mapToDto(ingredient);
    }

    @Override
    @Transactional
    public void deleteIngredient(Long id) {
        Ingredient ingredient = ingredientRepository.findById(id).orElseThrow(() -> new RuntimeException("Không tìm thấy nguyên liệu"));
        ingredient.setStatus("DELETED");
        ingredientRepository.save(ingredient);
    }

    @Override
    @Transactional
    public void processStockAction(Long ingredientId, StockActionRequest request, String username) {
        Ingredient ingredient = ingredientRepository.findById(ingredientId).orElseThrow(() -> new RuntimeException("Không tìm thấy nguyên liệu"));

        if ("EXPORT".equals(request.getType())) {
            if (ingredient.getStockQuantity().compareTo(request.getQuantity()) < 0) {
                throw new RuntimeException("Số lượng tồn kho không đủ để xuất!");
            }
            ingredient.setStockQuantity(ingredient.getStockQuantity().subtract(request.getQuantity()));
        } else if ("IMPORT".equals(request.getType())) {
            ingredient.setStockQuantity(ingredient.getStockQuantity().add(request.getQuantity()));
        } else {
            throw new RuntimeException("Loại hành động không hợp lệ");
        }

        ingredientRepository.save(ingredient);

        InventoryLog log = InventoryLog.builder()
                .ingredient(ingredient)
                .logType(request.getType())
                .quantity(request.getQuantity())
                .note(request.getNote())
                .createdBy(username)
                .build();
        logRepository.save(log);
    }

    @Override
    public List<InventoryLogDto> getIngredientHistory(Long ingredientId) {
        return logRepository.findByIngredientIdOrderByCreatedAtDesc(ingredientId).stream().map(log -> InventoryLogDto.builder()
                .id(log.getId())
                .logType(log.getLogType())
                .quantity(log.getQuantity())
                .note(log.getNote())
                .createdBy(log.getCreatedBy())
                .createdAt(log.getCreatedAt())
                .build()).collect(Collectors.toList());
    }

    @Override
    public List<Supplier> getActiveSuppliers() {
        return supplierRepository.findByStatusNot("DELETED");
    }

    @Override
    public List<IngredientCategory> getActiveCategories() {
        return categoryRepository.findByStatusNot("DELETED");
    }

    private void mapRequestToEntity(IngredientRequest request, Ingredient ingredient) {
        ingredient.setSku(request.getSku());
        ingredient.setName(request.getName());
        ingredient.setUnit(request.getUnit());
        ingredient.setImportPrice(request.getImportPrice());
        ingredient.setStockQuantity(request.getStockQuantity() != null ? request.getStockQuantity() : BigDecimal.ZERO);
        ingredient.setMinStock(request.getMinStock());
        ingredient.setImportDate(request.getImportDate());
        ingredient.setExpiryDate(request.getExpiryDate());
        ingredient.setNote(request.getNote());
        ingredient.setStatus(request.getStatus() != null ? request.getStatus() : "ACTIVE");

        if (request.getCategoryId() != null) {
            IngredientCategory cat = categoryRepository.findById(request.getCategoryId()).orElse(null);
            ingredient.setCategory(cat);
        }
        if (request.getSupplierId() != null) {
            Supplier sup = supplierRepository.findById(request.getSupplierId()).orElse(null);
            ingredient.setSupplier(sup);
        }
    }

    private IngredientDto mapToDto(Ingredient ingredient) {
        boolean isLowStock = ingredient.getMinStock() != null && ingredient.getStockQuantity().compareTo(ingredient.getMinStock()) <= 0;
        boolean isExpiring = ingredient.getExpiryDate() != null && ingredient.getExpiryDate().isBefore(LocalDate.now().plusDays(7));

        return IngredientDto.builder()
                .id(ingredient.getId())
                .sku(ingredient.getSku())
                .name(ingredient.getName())
                .categoryId(ingredient.getCategory() != null ? ingredient.getCategory().getId() : null)
                .categoryName(ingredient.getCategory() != null ? ingredient.getCategory().getName() : null)
                .supplierId(ingredient.getSupplier() != null ? ingredient.getSupplier().getId() : null)
                .supplierName(ingredient.getSupplier() != null ? ingredient.getSupplier().getName() : null)
                .unit(ingredient.getUnit())
                .importPrice(ingredient.getImportPrice())
                .stockQuantity(ingredient.getStockQuantity())
                .minStock(ingredient.getMinStock())
                .importDate(ingredient.getImportDate())
                .expiryDate(ingredient.getExpiryDate())
                .note(ingredient.getNote())
                .status(ingredient.getStatus())
                .isLowStock(isLowStock)
                .isExpiring(isExpiring)
                .build();
    }
}