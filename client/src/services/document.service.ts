import { api } from './api';

export type DocumentKind = 'document' | 'research';
export type DocumentVisibility = 'private' | 'shared';
export type StorageProvider = 'local' | 's3';
export type DocumentAudienceRole = 'hod' | 'faculty' | 'alumni';

export interface DocumentUser {
  _id: string;
  name: string;
  email: string;
}

export interface DocumentRecord {
  _id: string;
  title: string;
  description?: string;
  kind: DocumentKind;
  owner: DocumentUser | string;
  visibility: DocumentVisibility;
  shareAll: boolean;
  audienceRoles: DocumentAudienceRole[];
  audienceUsers?: DocumentUser[];
  storageProvider: StorageProvider;
  storageKey: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  createdAt: string;
  updatedAt: string;
}

interface DocumentListResponse {
  success: boolean;
  count: number;
  documents: DocumentRecord[];
}

interface DocumentSingleResponse {
  success: boolean;
  document: DocumentRecord;
}

export interface DocumentPayload {
  title: string;
  description?: string;
  kind: DocumentKind;
  visibility: DocumentVisibility;
  shareAll: boolean;
  audienceRoles: DocumentAudienceRole[];
  audienceEmails: string;
  storageProvider: StorageProvider;
  file?: File | null;
}

function toFormData(payload: DocumentPayload): FormData {
  const form = new FormData();
  form.append('title', payload.title);
  form.append('description', payload.description ?? '');
  form.append('kind', payload.kind);
  form.append('visibility', payload.visibility);
  form.append('shareAll', String(payload.shareAll));
  form.append('audienceRoles', JSON.stringify(payload.audienceRoles ?? []));
  form.append('audienceEmails', payload.audienceEmails ?? '');
  form.append('storageProvider', payload.storageProvider);
  if (payload.file) {
    form.append('file', payload.file);
  }
  return form;
}

export const documentService = {
  async getAll(): Promise<DocumentRecord[]> {
    const { data } = await api.get<DocumentListResponse>('/v1/documents');
    return data.documents;
  },

  async getById(id: string): Promise<DocumentRecord> {
    const { data } = await api.get<DocumentSingleResponse>(`/v1/documents/${id}`);
    return data.document;
  },

  async create(payload: DocumentPayload): Promise<DocumentRecord> {
    const form = toFormData(payload);
    const { data } = await api.post<DocumentSingleResponse>('/v1/documents', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data.document;
  },

  async update(id: string, payload: DocumentPayload): Promise<DocumentRecord> {
    const form = toFormData(payload);
    const { data } = await api.patch<DocumentSingleResponse>(`/v1/documents/${id}`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data.document;
  },

  async remove(id: string): Promise<void> {
    await api.delete(`/v1/documents/${id}`);
  },
};
