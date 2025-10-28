/**
 * Mock API service for metadata-driven table configuration
 */

import { EntityMetadata, EntityDataResponse, UpdateRowRequest, OCCConflict } from "@/types/metadata";

// Mock metadata for different entity types
const mockMetadata: Record<string, EntityMetadata> = {
  "UKCC_SERVICEPROFILE": {
    entityId: "UKCC_SERVICEPROFILE",
    entityName: "Service Profile",
    columns: [
      {
        name: "DialledService",
        label: "Dialled Service",
        dataType: "STRING",
        editable: false,
        required: true,
        maxLength: 50,
      },
      {
        name: "BypassAg",
        label: "Bypass Agent",
        dataType: "BOOLEAN",
        editable: true,
      },
      {
        name: "InterceptTreatmentType",
        label: "Intercept Treatment",
        dataType: "ENUM",
        editable: true,
        enumValues: ["BLOCK", "REDIRECT", "ALLOW", "LOG"],
      },
      {
        name: "MaxQueueTime",
        label: "Max Queue Time (sec)",
        dataType: "NUMBER",
        editable: true,
        required: true,
      },
      {
        name: "Priority",
        label: "Priority Level",
        dataType: "NUMBER",
        editable: true,
      },
      {
        name: "IsActive",
        label: "Active",
        dataType: "BOOLEAN",
        editable: true,
      },
    ],
    permissions: {
      canView: true,
      canEdit: true,
      canDownload: true,
      canDelete: true,
      canAdd: true,
    },
  },
  "UKCC_CONFIG_MAIN": {
    entityId: "UKCC_CONFIG_MAIN",
    entityName: "Main Configuration",
    columns: [
      {
        name: "key",
        label: "Configuration Key",
        dataType: "STRING",
        editable: false,
        required: true,
        maxLength: 100,
      },
      {
        name: "value",
        label: "Value",
        dataType: "STRING",
        editable: true,
        required: true,
        maxLength: 500,
      },
      {
        name: "description",
        label: "Description",
        dataType: "STRING",
        editable: true,
        maxLength: 1000,
      },
      {
        name: "isEnabled",
        label: "Enabled",
        dataType: "BOOLEAN",
        editable: true,
      },
    ],
    permissions: {
      canView: true,
      canEdit: true,
      canDownload: true,
      canDelete: false,
      canAdd: true,
    },
  },
};

// Mock data for entities
const mockData: Record<string, EntityDataResponse> = {
  "UKCC_SERVICEPROFILE": {
    page: 1,
    pageSize: 50,
    totalCount: 245,
    rows: Array.from({ length: 15 }, (_, i) => ({
      id: `sp-${i + 1}`,
      DialledService: `12345${i}`,
      BypassAg: i % 2 === 0,
      InterceptTreatmentType: ["BLOCK", "REDIRECT", "ALLOW", "LOG"][i % 4],
      MaxQueueTime: 30 + (i * 5),
      Priority: (i % 5) + 1,
      IsActive: i % 3 !== 0,
      version: Math.floor(Math.random() * 10) + 1,
      lastUpdatedBy: ["john.doe", "jane.smith", "admin"][i % 3],
      lastUpdatedOn: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
    })),
  },
  "UKCC_CONFIG_MAIN": {
    page: 1,
    pageSize: 50,
    totalCount: 156,
    rows: Array.from({ length: 12 }, (_, i) => ({
      id: `cfg-${i + 1}`,
      key: `CONFIG_KEY_${i + 1}`,
      value: `Value ${i + 1}`,
      description: `Configuration description for key ${i + 1}`,
      isEnabled: i % 2 === 0,
      version: Math.floor(Math.random() * 8) + 1,
      lastUpdatedBy: ["admin@hsbc.com", "ops.team@hsbc.com"][i % 2],
      lastUpdatedOn: new Date(Date.now() - Math.random() * 20 * 24 * 60 * 60 * 1000).toISOString(),
    })),
  },
};

// Simulated API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export class MetadataApiService {
  /**
   * Fetch metadata for an entity
   */
  static async getEntityMetadata(
    entityId: string,
    country: string,
    businessUnit: string
  ): Promise<EntityMetadata> {
    await delay(300);
    
    const metadata = mockMetadata[entityId];
    if (!metadata) {
      throw new Error(`Entity metadata not found for ${entityId}`);
    }
    
    return metadata;
  }

  /**
   * Fetch data for an entity
   */
  static async getEntityData(
    entityId: string,
    country: string,
    businessUnit: string,
    page: number = 1,
    pageSize: number = 50
  ): Promise<EntityDataResponse> {
    await delay(500);
    
    const data = mockData[entityId];
    if (!data) {
      throw new Error(`Entity data not found for ${entityId}`);
    }
    
    // Simulate pagination
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedRows = data.rows.slice(startIndex, endIndex);
    
    return {
      ...data,
      page,
      pageSize,
      rows: paginatedRows,
    };
  }

  /**
   * Update a row (with OCC check)
   */
  static async updateRow(
    entityId: string,
    request: UpdateRowRequest
  ): Promise<{ success: boolean; conflict?: OCCConflict }> {
    await delay(400);
    
    // Simulate 20% chance of OCC conflict
    if (Math.random() < 0.2) {
      return {
        success: false,
        conflict: {
          currentVersion: request.version + 1,
          attemptedVersion: request.version,
          conflictingFields: Object.keys(request.changes),
          message: "This record has been modified by another user. Please refresh and try again.",
        },
      };
    }
    
    return { success: true };
  }

  /**
   * Download entity configuration
   */
  static async downloadConfig(
    entityId: string,
    format: "csv" | "json" | "excel",
    filters?: Record<string, any>
  ): Promise<Blob> {
    await delay(800);
    
    const data = mockData[entityId];
    if (!data) {
      throw new Error(`Entity data not found for ${entityId}`);
    }
    
    // Create mock CSV content
    const csvContent = "data:text/csv;charset=utf-8," + 
      Object.keys(data.rows[0]).join(",") + "\n" +
      data.rows.map(row => Object.values(row).join(",")).join("\n");
    
    return new Blob([csvContent], { type: "text/csv" });
  }
}
