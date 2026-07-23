package com.rms.service.impl;

import com.rms.dto.CategoryAdminDto;
import com.rms.dto.CategoryRequest;
import com.rms.dto.PageResponse;
import com.rms.model.Category;
import com.rms.repository.CategoryRepository;
import com.rms.service.CategoryAdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CategoryAdminServiceImpl implements CategoryAdminService {

    private final CategoryRepository categoryRepository;

    @Override
    @Transactional(readOnly = true)
    public PageResponse<CategoryAdminDto> getCategories(String keyword, String status, int page, int size, String sortBy, String sortDir) {
        Sort sort = sortDir.equalsIgnoreCase(Sort.Direction.ASC.name()) ? Sort.by(sortBy).ascending()
                : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);

        // Sửa ở đây: Nếu null thì gán bằng chuỗi rỗng "" thay vì gán bằng null
        String searchKeyword = (keyword != null && !keyword.trim().isEmpty()) ? keyword.trim() : "";
        String filterStatus = (status != null && !status.trim().isEmpty()) ? status.trim() : "";

        Page<Category> categoryPage = categoryRepository.searchAndFilterCategory(searchKeyword, filterStatus, pageable);

        return PageResponse.<CategoryAdminDto>builder()
                .content(categoryPage.getContent().stream().map(this::mapToDto).collect(Collectors.toList()))
                .pageNumber(categoryPage.getNumber())
                .pageSize(categoryPage.getSize())
                .totalElements(categoryPage.getTotalElements())
                .totalPages(categoryPage.getTotalPages())
                .last(categoryPage.isLast())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public CategoryAdminDto getCategoryById(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy danh mục"));
        return mapToDto(category);
    }

    @Override
    @Transactional
    public CategoryAdminDto createCategory(CategoryRequest request) {
        if (categoryRepository.findByName(request.getName()).isPresent()) {
            throw new RuntimeException("Tên danh mục đã tồn tại");
        }

        Category category = Category.builder()
                .name(request.getName())
                .description(request.getDescription())
                .status(request.getStatus() != null ? request.getStatus() : "ACTIVE")
                .build();

        category = categoryRepository.save(category);
        return mapToDto(category);
    }

    @Override
    @Transactional
    public CategoryAdminDto updateCategory(Long id, CategoryRequest request) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy danh mục"));

        Optional<Category> existName = categoryRepository.findByName(request.getName());
        if (existName.isPresent() && !existName.get().getId().equals(category.getId())) {
            throw new RuntimeException("Tên danh mục đã tồn tại");
        }

        category.setName(request.getName());
        category.setDescription(request.getDescription());
        if (request.getStatus() != null) {
            category.setStatus(request.getStatus());
        }

        category = categoryRepository.save(category);
        return mapToDto(category);
    }

    @Override
    @Transactional
    public void toggleCategoryStatus(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy danh mục"));

        category.setStatus("DISABLED".equals(category.getStatus()) ? "ACTIVE" : "DISABLED");
        categoryRepository.save(category);
    }

    @Override
    @Transactional
    public void softDeleteCategory(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy danh mục"));

        // Kiểm tra xem danh mục có món ăn nào đang hoạt động không
        boolean hasActiveItems = category.getMenuItems() != null && category.getMenuItems().stream()
                .anyMatch(item -> !item.getStatus().equals("DELETED"));

        if (hasActiveItems) {
            throw new RuntimeException("Không thể xóa danh mục đang chứa món ăn. Vui lòng chuyển hoặc xóa món ăn trước.");
        }

        category.setStatus("DELETED");
        categoryRepository.save(category);
    }

    private CategoryAdminDto mapToDto(Category category) {
        int count = 0;
        if (category.getMenuItems() != null) {
            count = (int) category.getMenuItems().stream()
                    .filter(item -> !item.getStatus().equals("DELETED"))
                    .count();
        }

        return CategoryAdminDto.builder()
                .id(category.getId())
                .name(category.getName())
                .description(category.getDescription())
                .status(category.getStatus())
                .menuItemCount(count)
                .createdAt(category.getCreatedAt())
                .build();
    }
}