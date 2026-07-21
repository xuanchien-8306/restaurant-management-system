package com.rms.service.impl;

import com.rms.dto.CategoryDto;
import com.rms.repository.CategoryRepository;
import com.rms.service.CategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CategoryServiceImpl implements CategoryService {

    private final CategoryRepository categoryRepository;

    @Override
    public List<CategoryDto> getAllCategories() {
        return categoryRepository.findByStatus("ACTIVE").stream()
                .map(cat -> CategoryDto.builder()
                        .id(cat.getId())
                        .name(cat.getName())
                        .description(cat.getDescription())
                        .build())
                .collect(Collectors.toList());
    }
}