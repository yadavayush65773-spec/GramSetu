import crypto from 'crypto';
import path from 'path';
import fs from 'fs';
import { env } from './env.js';
import { supabaseAdminClient, supabaseClient } from './supabase.js';
import { ValidationError } from '../utils/errors.js';

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
const UPLOADS_DIR = path.resolve(process.cwd(), 'uploads');

// Ensure local uploads directory exists for demo mode storage
if (!fs.existsSync(UPLOADS_DIR)) {
  try {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  } catch (_) {}
}

export function computeBufferSHA256(buffer) {
  return crypto.createHash('sha256').update(buffer).digest('hex');
}

export async function uploadEvidenceFile({ file, inspectionId, userId }) {
  if (!file || !file.buffer) {
    throw new ValidationError('No file buffer provided for upload');
  }

  if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    throw new ValidationError(`Invalid file type: ${file.mimetype}. Allowed types: ${ALLOWED_MIME_TYPES.join(', ')}`);
  }

  const maxSizeBytes = env.MAX_UPLOAD_SIZE_MB * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    throw new ValidationError(`File size exceeds maximum permitted size of ${env.MAX_UPLOAD_SIZE_MB}MB`);
  }

  // Calculate genuine server-side SHA-256 from uploaded bytes
  const serverSha256 = computeBufferSHA256(file.buffer);

  const fileExt = path.extname(file.originalname) || (file.mimetype === 'application/pdf' ? '.pdf' : '.jpg');
  const safeFilename = `${Date.now()}-${serverSha256.slice(0, 12)}${fileExt}`;
  const storagePath = `inspections/${inspectionId || 'unassigned'}/${safeFilename}`;

  // If Supabase Storage is configured, upload to private bucket
  const activeClient = supabaseAdminClient || supabaseClient;
  if (activeClient) {
    try {
      const { data, error } = await activeClient.storage
        .from('gramsetu-inspection-evidence')
        .upload(storagePath, file.buffer, {
          contentType: file.mimetype,
          upsert: false,
        });

      if (!error && data) {
        return {
          storagePath: data.path,
          serverSha256,
          fileSize: file.size,
          mimeType: file.mimetype,
          originalFilename: file.originalname,
          provider: 'supabase',
        };
      }
    } catch (err) {
      console.warn('[Storage] Supabase upload failed, falling back to local file storage:', err.message);
    }
  }

  // Fallback: Local private filesystem storage for demo mode
  const localDest = path.join(UPLOADS_DIR, safeFilename);
  fs.writeFileSync(localDest, file.buffer);

  return {
    storagePath: `local://${safeFilename}`,
    serverSha256,
    fileSize: file.size,
    mimeType: file.mimetype,
    originalFilename: file.originalname,
    provider: 'local',
  };
}

export async function getEvidenceDownloadUrl(storagePath, expiresInSeconds = 3600) {
  if (!storagePath) return null;

  if (storagePath.startsWith('local://')) {
    const filename = storagePath.replace('local://', '');
    return `/api/evidence/file/${filename}`;
  }

  if (storagePath.startsWith('http://') || storagePath.startsWith('https://')) {
    return storagePath;
  }

  const activeClient = supabaseAdminClient || supabaseClient;
  if (activeClient) {
    try {
      const { data, error } = await activeClient.storage
        .from('gramsetu-inspection-evidence')
        .createSignedUrl(storagePath, expiresInSeconds);

      if (!error && data?.signedUrl) {
        return data.signedUrl;
      }
    } catch (_) {}
  }

  return `/api/evidence/file/${encodeURIComponent(storagePath)}`;
}
