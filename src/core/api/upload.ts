/** Fichier local à téléverser. */
export interface UploadFile {
  uri: string;
  name: string;
  type: string;
}

/** En-têtes d'un envoi `multipart/form-data` (la frontière est ajoutée par la couche réseau). */
export const MULTIPART_HEADERS = { 'Content-Type': 'multipart/form-data' } as const;

/**
 * Ajoute un fichier local à un `FormData`.
 * React Native attend un descripteur `{ uri, name, type }` là où le navigateur attend un `Blob`.
 */
export function appendFile(form: FormData, field: string, file: UploadFile): void {
  form.append(field, { uri: file.uri, name: file.name, type: file.type } as unknown as Blob);
}
