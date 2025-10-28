/**
 * Real API service for backend integration
 */

import {
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
  ApiError,
} from "@/types/api";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api/v1";

class ApiService {
  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const error: ApiError = await response.json().catch(() => ({
        code: "UNKNOWN_ERROR",
        message: "An unexpected error occurred",
      }));
      throw error;
    }
    return response.json();
  }

  /**
   * Fetch metadata for an entity
   * GET /api/v1/metadata/entity/{id}?country=<c>&bu=<b>
   */
  async getEntityMetadata(
    entityId: string,
    country: string,
    businessUnit: string
  ): Promise<MetadataResponse> {
    const params = new URLSearchParams({
      country,
      bu: businessUnit,
    });

    const response = await fetch(
      `${API_BASE_URL}/metadata/entity/${entityId}?${params.toString()}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    return this.handleResponse<MetadataResponse>(response);
  }

  /**
   * Fetch paginated and filtered entity data
   * GET /api/v1/entity/{id}/data
   */
  async getEntityData(request: DataRequest): Promise<DataResponse> {
    const params = new URLSearchParams({
      country: request.country,
      bu: request.businessUnit,
      page: request.page.toString(),
      pageSize: request.pageSize.toString(),
    });

    if (request.globalSearch) {
      params.append("globalSearch", request.globalSearch);
    }

    if (request.sortBy) {
      params.append("sortBy", request.sortBy);
      params.append("sortDirection", request.sortDirection || "asc");
    }

    if (request.filters) {
      Object.entries(request.filters).forEach(([key, value]) => {
        if (value) {
          params.append(`filter[${key}]`, value);
        }
      });
    }

    const response = await fetch(
      `${API_BASE_URL}/entity/${request.entityId}/data?${params.toString()}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    return this.handleResponse<DataResponse>(response);
  }

  /**
   * Update a single row
   * PATCH /api/v1/entity/{id}/rows/{rowId}
   */
  async updateRow(
    entityId: string,
    request: RowUpdateRequest
  ): Promise<RowUpdateResponse> {
    const response = await fetch(
      `${API_BASE_URL}/entity/${entityId}/rows/${request.id}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          version: request.version,
          editReason: request.editReason,
          changes: request.changes,
        }),
      }
    );

    return this.handleResponse<RowUpdateResponse>(response);
  }

  /**
   * Batch update multiple rows
   * PATCH /api/v1/entity/{id}/rows/batch
   */
  async batchUpdateRows(
    entityId: string,
    request: BatchUpdateRequest
  ): Promise<BatchUpdateResponse> {
    const response = await fetch(
      `${API_BASE_URL}/entity/${entityId}/rows/batch`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(request),
      }
    );

    return this.handleResponse<BatchUpdateResponse>(response);
  }

  /**
   * Add a new row
   * POST /api/v1/entity/{id}/rows
   */
  async addRow(request: AddRowRequest): Promise<AddRowResponse> {
    const params = new URLSearchParams({
      country: request.country,
      bu: request.businessUnit,
    });

    const response = await fetch(
      `${API_BASE_URL}/entity/${request.entityId}/rows?${params.toString()}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          data: request.data,
          editReason: request.editReason,
        }),
      }
    );

    return this.handleResponse<AddRowResponse>(response);
  }

  /**
   * Bulk upload rows
   * POST /api/v1/entity/{id}/rows/bulk
   */
  async bulkUploadRows(
    request: BulkUploadRequest
  ): Promise<BulkUploadResponse> {
    const params = new URLSearchParams({
      country: request.country,
      bu: request.businessUnit,
    });

    const response = await fetch(
      `${API_BASE_URL}/entity/${request.entityId}/rows/bulk?${params.toString()}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          rows: request.rows,
          editReason: request.editReason,
        }),
      }
    );

    return this.handleResponse<BulkUploadResponse>(response);
  }

  /**
   * Download entity configuration
   * GET /api/v1/export/entity/{id}/rows
   */
  async downloadConfig(request: DownloadConfigRequest): Promise<Blob> {
    const params = new URLSearchParams({
      country: request.country,
      bu: request.businessUnit,
      format: request.format,
    });

    if (request.scope) {
      params.append("scope", request.scope);
    }

    if (request.filters) {
      Object.entries(request.filters).forEach(([key, value]) => {
        if (value) {
          params.append(`filter[${key}]`, value);
        }
      });
    }

    const response = await fetch(
      `${API_BASE_URL}/export/entity/${request.entityId}/rows?${params.toString()}`,
      {
        method: "GET",
      }
    );

    if (!response.ok) {
      throw new Error("Failed to download configuration");
    }

    return response.blob();
  }

  /**
   * Delete a row
   * DELETE /api/v1/entity/{id}/rows/{rowId}
   */
  async deleteRow(
    entityId: string,
    rowId: string,
    editReason: string
  ): Promise<{ success: boolean; message?: string }> {
    const response = await fetch(
      `${API_BASE_URL}/entity/${entityId}/rows/${rowId}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ editReason }),
      }
    );

    return this.handleResponse(response);
  }
}

export const apiService = new ApiService();

