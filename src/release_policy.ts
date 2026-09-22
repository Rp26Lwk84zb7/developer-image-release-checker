import { z } from 'zod';
import { infrai } from './infrai_client.js';

const imageReferenceSchema = z.union([
  z.object({ base64: z.string().min(1) }).strict(),
  z.object({ url: z.string().url() }).strict(),
  z.object({ image_id: z.string().min(1) }).strict()
]);

const releaseEventSchema = z.object({
  buildId: z.string().min(1),
  image: imageReferenceSchema,
  targetBytes: z.number().int().positive(),
  maxWidth: z.number().int().positive().optional(),
  maxHeight: z.number().int().positive().optional()
});

export type ReleaseEvent = z.infer<typeof releaseEventSchema>;

export type ReleaseDecision = {
  buildId: string;
  status: 'release' | 'hold';
  originalBytes?: number;
  compressedBytes?: number;
  width?: number;
  height?: number;
  notes: string[];
};

export function decideRelease(event: ReleaseEvent, diagnostics: { sizeBytes: number; width?: number; height?: number }): ReleaseDecision {
  const notes: string[] = [];
  const withinSize = diagnostics.sizeBytes <= event.targetBytes;
  if (!withinSize) {
    notes.push(`compressed asset is ${diagnostics.sizeBytes} bytes, above target ${event.targetBytes}`);
  }

  if (event.maxWidth && diagnostics.width && diagnostics.width > event.maxWidth) {
    notes.push(`width ${diagnostics.width} exceeds ${event.maxWidth}`);
  }

  if (event.maxHeight && diagnostics.height && diagnostics.height > event.maxHeight) {
    notes.push(`height ${diagnostics.height} exceeds ${event.maxHeight}`);
  }

  return {
    buildId: event.buildId,
    status: notes.length === 0 ? 'release' : 'hold',
    compressedBytes: diagnostics.sizeBytes,
    width: diagnostics.width,
    height: diagnostics.height,
    notes: notes.length === 0 ? ['release gate passed'] : notes
  };
}

export async function evaluateReleaseEvent(raw: unknown): Promise<ReleaseDecision> {
  const event = releaseEventSchema.parse(raw);
  const compressed = await infrai.image.compress({ image: event.image, format: 'webp', store: false });
  const metadata = await infrai.image.metadata({ image: compressed.image ?? event.image });

  return decideRelease(event, {
    sizeBytes: metadata.size ?? 0,
    width: metadata.width,
    height: metadata.height
  });
}

export function parseReleaseEvent(input: unknown): ReleaseEvent {
  return releaseEventSchema.parse(input);
}
