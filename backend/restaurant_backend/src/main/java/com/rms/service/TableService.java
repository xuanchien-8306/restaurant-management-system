package com.rms.service;

import com.rms.dto.PageResponse;
import com.rms.dto.TableDtos.*;
import com.rms.model.TableArea;
import java.util.List;

public interface TableService {
    PageResponse<TableResponse> getTables(String keyword, Long areaId, String status, int page, int size, String sortBy, String sortDir);
    TableResponse getTableById(Long id);
    TableResponse createTable(TableRequest request);
    TableResponse updateTable(Long id, TableRequest request);
    void deleteTable(Long id);
    void changeStatus(Long id, String status);

    // Các thao tác nghiệp vụ
    void transferTable(TableActionRequest request);
    void mergeTables(TableActionRequest request);
    void splitTable(TableActionRequest request);

    List<TableArea> getActiveAreas();
    List<TableResponse> getAllActiveTables();
}