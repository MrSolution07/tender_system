import { MAX_FILE_BYTES } from "@tender/shared";

export type PickedFile = {
  name: string;
  mimeType: string;
  size: number;
  bytes: Uint8Array;
};

export async function pickFile(): Promise<PickedFile | { canceled: true } | { error: string }> {
  const picker = await import("expo-document-picker");
  const result = await picker.getDocumentAsync({ copyToCacheDirectory: true, multiple: false });
  if (result.canceled) return { canceled: true };
  const asset = result.assets[0];
  if (!asset) return { error: "Choose a file." };
  const size = asset.size ?? 0;
  if (size > MAX_FILE_BYTES) return { error: "Files must be 50 MB or smaller." };
  const bytes = await readLocalFile(asset.uri);
  if (!bytes || bytes.byteLength === 0) return { error: "Could not read the file." };
  if (bytes.byteLength > MAX_FILE_BYTES) return { error: "Files must be 50 MB or smaller." };
  return {
    name: asset.name || "file",
    mimeType: asset.mimeType || "application/octet-stream",
    size: bytes.byteLength,
    bytes,
  };
}

async function readLocalFile(uri: string): Promise<Uint8Array | null> {
  try {
    const response = await fetch(uri);
    if (response.ok) return new Uint8Array(await response.arrayBuffer());
  } catch {
    // A file:// URI on a device is read through the file system below.
  }
  try {
    const filesystem = await import("expo-file-system");
    const file = new filesystem.File(uri);
    return new Uint8Array(await file.arrayBuffer());
  } catch {
    return null;
  }
}
