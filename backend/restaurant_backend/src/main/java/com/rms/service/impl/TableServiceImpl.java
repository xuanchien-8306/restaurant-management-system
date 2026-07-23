package com.rms.service.impl;

import com.rms.dto.PageResponse;
import com.rms.dto.TableDtos.*;
import com.rms.model.RestaurantTable;
import com.rms.model.TableArea;
import com.rms.repository.RestaurantTableRepository;
import com.rms.repository.TableAreaRepository;
import com.rms.service.TableService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TableServiceImpl implements TableService {

    private final RestaurantTableRepository tableRepository;
    private final TableAreaRepository areaRepository;

    @Override
    @Transactional(readOnly = true)
    public PageResponse<TableResponse> getTables(String keyword, Long areaId, String status, int page, int size, String sortBy, String sortDir) {
        Sort sort = sortDir.equalsIgnoreCase(Sort.Direction.ASC.name()) ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);

        String searchKey = (keyword != null && !keyword.trim().isEmpty()) ? keyword.trim() : "";
        String filterStatus = (status != null && !status.trim().isEmpty()) ? status.trim() : "";
        Long filterArea = (areaId != null) ? areaId : -1L;

        Page<RestaurantTable> tablePage = tableRepository.searchAndFilter(searchKey, filterArea, filterStatus, pageable);

        return PageResponse.<TableResponse>builder()
                .content(tablePage.getContent().stream().map(this::mapToDto).collect(Collectors.toList()))
                .pageNumber(tablePage.getNumber())
                .pageSize(tablePage.getSize())
                .totalElements(tablePage.getTotalElements())
                .totalPages(tablePage.getTotalPages())
                .last(tablePage.isLast())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public TableResponse getTableById(Long id) {
        return mapToDto(tableRepository.findById(id).orElseThrow(() -> new RuntimeException("Không tìm thấy bàn")));
    }

    @Override
    @Transactional
    public TableResponse createTable(TableRequest request) {
        if (tableRepository.findByTableCode(request.getTableCode()).isPresent()) {
            throw new RuntimeException("Mã bàn đã tồn tại!");
        }

        TableArea area = areaRepository.findById(request.getAreaId()).orElseThrow(() -> new RuntimeException("Khu vực không tồn tại"));

        RestaurantTable table = RestaurantTable.builder()
                .tableCode(request.getTableCode())
                .name(request.getName())
                .area(area)
                .capacity(request.getCapacity())
                .note(request.getNote())
                .status(request.getStatus() != null ? request.getStatus() : "AVAILABLE")
                .build();

        return mapToDto(tableRepository.save(table));
    }

    @Override
    @Transactional
    public TableResponse updateTable(Long id, TableRequest request) {
        RestaurantTable table = tableRepository.findById(id).orElseThrow(() -> new RuntimeException("Không tìm thấy bàn"));

        Optional<RestaurantTable> existCode = tableRepository.findByTableCode(request.getTableCode());
        if (existCode.isPresent() && !existCode.get().getId().equals(id)) {
            throw new RuntimeException("Mã bàn đã tồn tại!");
        }

        TableArea area = areaRepository.findById(request.getAreaId()).orElseThrow(() -> new RuntimeException("Khu vực không tồn tại"));

        table.setTableCode(request.getTableCode());
        table.setName(request.getName());
        table.setArea(area);
        table.setCapacity(request.getCapacity());
        table.setNote(request.getNote());
        if (request.getStatus() != null) table.setStatus(request.getStatus());

        return mapToDto(tableRepository.save(table));
    }

    @Override
    @Transactional
    public void deleteTable(Long id) {
        RestaurantTable table = tableRepository.findById(id).orElseThrow(() -> new RuntimeException("Không tìm thấy bàn"));
        if ("IN_USE".equals(table.getStatus()) || "PAYING".equals(table.getStatus())) {
            throw new RuntimeException("Không thể xóa bàn đang sử dụng hoặc đang thanh toán!");
        }
        table.setStatus("DELETED");
        tableRepository.save(table);
    }

    @Override
    @Transactional
    public void changeStatus(Long id, String status) {
        RestaurantTable table = tableRepository.findById(id).orElseThrow(() -> new RuntimeException("Không tìm thấy bàn"));
        table.setStatus(status);
        tableRepository.save(table);
    }

    @Override
    @Transactional
    public void transferTable(TableActionRequest request) {
        RestaurantTable source = tableRepository.findById(request.getSourceTableId()).orElseThrow(() -> new RuntimeException("Bàn chuyển không tồn tại"));
        RestaurantTable target = tableRepository.findById(request.getTargetTableId()).orElseThrow(() -> new RuntimeException("Bàn đích không tồn tại"));

        if (!"AVAILABLE".equals(target.getStatus()) && !"CLEANING".equals(target.getStatus())) {
            throw new RuntimeException("Bàn đích phải ở trạng thái Trống hoặc Đang dọn");
        }

        target.setStatus(source.getStatus());
        source.setStatus("CLEANING"); // Sau khi chuyển, bàn cũ cần dọn dẹp

        tableRepository.save(source);
        tableRepository.save(target);
    }

    @Override
    @Transactional
    public void mergeTables(TableActionRequest request) {
        RestaurantTable target = tableRepository.findById(request.getTargetTableId()).orElseThrow(() -> new RuntimeException("Bàn đích không tồn tại"));

        for (Long sourceId : request.getSourceTableIds()) {
            if (sourceId.equals(target.getId())) continue;
            RestaurantTable source = tableRepository.findById(sourceId).orElseThrow(() -> new RuntimeException("Bàn gộp không tồn tại"));
            source.setStatus("CLEANING");
            tableRepository.save(source);
        }
        target.setStatus("IN_USE");
        tableRepository.save(target);
    }

    @Override
    @Transactional
    public void splitTable(TableActionRequest request) {
        RestaurantTable target = tableRepository.findById(request.getTargetTableId()).orElseThrow(() -> new RuntimeException("Bàn đích không tồn tại"));

        if (!"AVAILABLE".equals(target.getStatus()) && !"CLEANING".equals(target.getStatus())) {
            throw new RuntimeException("Bàn đích phải ở trạng thái Trống hoặc Đang dọn");
        }

        // Bàn nguồn giữ nguyên IN_USE, bàn đích chuyển sang IN_USE
        target.setStatus("IN_USE");
        tableRepository.save(target);
    }

    @Override
    @Transactional(readOnly = true)
    public List<TableArea> getActiveAreas() {
        return areaRepository.findByStatusNot("DELETED");
    }

    @Override
    @Transactional(readOnly = true)
    public List<TableResponse> getAllActiveTables() {
        return tableRepository.findByStatusNot("DELETED").stream().map(this::mapToDto).collect(Collectors.toList());
    }

    private TableResponse mapToDto(RestaurantTable table) {
        return TableResponse.builder()
                .id(table.getId())
                .tableCode(table.getTableCode())
                .name(table.getName())
                .areaId(table.getArea() != null ? table.getArea().getId() : null)
                .areaName(table.getArea() != null ? table.getArea().getName() : null)
                .capacity(table.getCapacity())
                .note(table.getNote())
                .status(table.getStatus())
                .build();
    }
}