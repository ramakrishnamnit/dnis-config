/**
 * API toggle service to switch between mock and real APIs
 */

import { MetadataApiService } from "./mockMetadataApi";
import { apiService } from "./apiService";
import type {
  MetadataResponse,
  DataRequest,
  DataResponse,
  RowUpdateRequest,
  RowUpdateResponse,
  BatchUpdateRequest,
  BatchUpdateResponse,
  AddRowRequest,
  AddRowResponse,
  BulkUploadRequest,
  BulkUploadResponse,
  DownloadConfigRequest,
} from "@/types/api";
import type { EntityMetadata, EntityDataResponse, UpdateRowRequest } from "@/types/metadata";

const USE_MOCK_API = import.meta.env.VITE_USE_MOCK_API === "true";

// Adapter to convert between mock and real API types
class ApiAdapter {
  // Convert metadata types
  private convertMetadataToReal(mockMetadata: EntityMetadata): MetadataResponse {
    return {
      entityId: mockMetadata.entityId,
      entityName: mockMetadata.entityName,
      columns: mockMetadata.columns,
      permissions: mockMetadata.permissions,
    };
  }

  // Convert data response types
  private convertDataToReal(mockData: EntityDataResponse): DataResponse {
    return {
      page: mockData.page,
      pageSize: mockData.pageSize,
      totalCount: mockData.totalCount,
      rows: mockData.rows,
    };
  }

  async getEntityMetadata(
    entityId: string,
    country: string,
    businessUnit: string
  ): Promise<MetadataResponse> {
    if (USE_MOCK_API) {
      const mockData = await MetadataApiService.getEntityMetadata(entityId, country, businessUnit);
      return this.convertMetadataToReal(mockData);
    }
    return apiService.getEntityMetadata(entityId, country, businessUnit);
  }

  async getEntityData(request: DataRequest): Promise<DataResponse> {
    if (USE_MOCK_API) {
      const mockData = await MetadataApiService.getEntityData(
        request.entityId,
        request.country,
        request.businessUnit,
        request.page,
        request.pageSize,
        request.filters,
        request.globalSearch
      );
      return this.convertDataToReal(mockData);
    }
    return apiService.getEntityData(request);
  }

  async updateRow(
    entityId: string,
    request: RowUpdateRequest
  ): Promise<RowUpdateResponse> {
    if (USE_MOCK_API) {
      const mockRequest: UpdateRowRequest = {
        id: request.id,
        version: request.version,
        editReason: request.editReason,
        changes: request.changes,
      };
      const result = await MetadataApiService.updateRow(entityId, mockRequest);
      return {
        success: result.success,
        conflict: result.conflict,
        newVersion: result.success ? request.version + 1 : undefined,
      };
    }
    return apiService.updateRow(entityId, request);
  }

  async batchUpdateRows(
    entityId: string,
    request: BatchUpdateRequest
  ): Promise<BatchUpdateResponse> {
    if (USE_MOCK_API) {
      // Mock batch update by calling individual updates
      const results = await Promise.all(
        request.updates.map(async (update) => {
          try {
            const result = await this.updateRow(entityId, update);
            return {
              id: update.id,
              success: result.success,
              conflict: result.conflict,
            };
          } catch (error) {
            return {
              id: update.id,
              success: false,
              error: error instanceof Error ? error.message : "Update failed",
            };
          }
        })
      );

      return {
        successCount: results.filter((r) => r.success).length,
        failureCount: results.filter((r) => !r.success).length,
        results,
      };
    }
    return apiService.batchUpdateRows(entityId, request);
  }

  async addRow(request: AddRowRequest): Promise<AddRowResponse> {
    if (USE_MOCK_API) {
      // Mock add row
      await new Promise((resolve) => setTimeout(resolve, 500));
      return {
        success: true,
        id: `mock-${Date.now()}`,
        message: "Row added successfully",
      };
    }
    return apiService.addRow(request);
  }

  async bulkUploadRows(request: BulkUploadRequest): Promise<BulkUploadResponse> {
    if (USE_MOCK_API) {
      // Mock bulk upload
      await new Promise((resolve) => setTimeout(resolve, 1000));
      const results = request.rows.map((_, index) => ({
        rowIndex: index,
        success: Math.random() > 0.1, // 90% success rate
        id: `mock-${Date.now()}-${index}`,
      }));

      return {
        successCount: results.filter((r) => r.success).length,
        failureCount: results.filter((r) => !r.success).length,
        results,
      };
    }
    return apiService.bulkUploadRows(request);
  }

  async downloadConfig(request: DownloadConfigRequest): Promise<Blob> {
    if (USE_MOCK_API) {
      return MetadataApiService.downloadConfig(request.entityId, request.format, request.filters);
    }
    return apiService.downloadConfig(request);
  }

  async deleteRow(
    entityId: string,
    rowId: string,
    editReason: string
  ): Promise<{ success: boolean; message?: string }> {
    if (USE_MOCK_API) {
      await new Promise((resolve) => setTimeout(resolve, 400));
      return { success: true, message: "Row deleted successfully" };
    }
    return apiService.deleteRow(entityId, rowId, editReason);
  }
}

export const configApiService = new ApiAdapter();
export { USE_MOCK_API };

