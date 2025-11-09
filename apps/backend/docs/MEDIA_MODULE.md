# Media Module - File Storage & Processing

## Overview

El **Media Module** proporciona un sistema completo de gestión de archivos multimedia (imágenes, videos, documentos) con:

- ✅ Upload a S3/MinIO (compatible con AWS S3)
- ✅ Procesamiento automático de imágenes (redimensionamiento, thumbnails)
- ✅ Validación de tipos y tamaños de archivos
- ✅ Generación de variantes (thumbnail, small, medium, large)
- ✅ Integración con Bull Queue para procesamiento asíncrono
- ✅ URLs firmadas para acceso temporal
- ✅ Soft delete con retención configurable
- ✅ Estadísticas de almacenamiento por usuario

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     UPLOAD WORKFLOW                          │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Client Upload  →  Validation  →  S3 Upload  →  Database   │
│                                         ↓                    │
│                                   Image Queue                │
│                                         ↓                    │
│                        Generate Variants (Sharp)            │
│                                         ↓                    │
│                           Upload Variants to S3             │
│                                         ↓                    │
│                        Update Database (Ready)              │
└─────────────────────────────────────────────────────────────┘
```

### Components

1. **MediaController** - REST endpoints para upload/download
2. **MediaService** - Lógica de negocio y gestión de archivos
3. **StorageService** - Integración con S3/MinIO
4. **ImageProcessingProcessor** - Procesamiento asíncrono de imágenes
5. **Media Entity** - Modelo de datos en PostgreSQL

---

## Database Schema

### Media Entity

```sql
CREATE TABLE media (
  id UUID PRIMARY KEY,
  original_name VARCHAR(500) NOT NULL,
  key VARCHAR(500) UNIQUE NOT NULL,  -- S3 key
  url VARCHAR(1000) NOT NULL,        -- Full URL
  type ENUM('image', 'video', 'document') NOT NULL,
  category ENUM('avatar', 'experience', 'post', 'story', 'review', 'document', 'temp') NOT NULL,
  status ENUM('uploading', 'processing', 'ready', 'failed') DEFAULT 'uploading',
  mime_type VARCHAR(100) NOT NULL,
  size INT NOT NULL,                 -- Bytes
  width INT,
  height INT,
  duration INT,                       -- For videos (seconds)
  variants JSONB,                     -- Thumbnail, small, medium, large URLs
  metadata JSONB,                     -- EXIF, location, etc.
  entity_id UUID,                     -- Related entity (post, experience, etc.)
  entity_type VARCHAR(100),           -- 'post', 'experience', 'review'
  user_id UUID NOT NULL,              -- Owner
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  deleted_at TIMESTAMP,               -- Soft delete

  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_media_user_id ON media(user_id);
CREATE INDEX idx_media_category ON media(category);
CREATE INDEX idx_media_status ON media(status);
CREATE INDEX idx_media_created_at ON media(created_at);
```

### Variants JSON Structure

```json
{
  "thumbnail": "https://cdn.viajeroconectado.com/posts/2024/01/uuid-photo-thumbnail.jpg",
  "small": "https://cdn.viajeroconectado.com/posts/2024/01/uuid-photo-small.jpg",
  "medium": "https://cdn.viajeroconectado.com/posts/2024/01/uuid-photo-medium.jpg",
  "large": "https://cdn.viajeroconectado.com/posts/2024/01/uuid-photo-large.jpg"
}
```

---

## Configuration

### Environment Variables

```env
# S3/MinIO Configuration
AWS_ACCESS_KEY_ID=minioadmin
AWS_SECRET_ACCESS_KEY=minioadmin123
AWS_S3_BUCKET=viajero-conectado
AWS_REGION=us-east-1
AWS_ENDPOINT=http://localhost:9000  # For MinIO (omit for AWS S3)

# CDN (Optional)
CDN_DOMAIN=cdn.viajeroconectado.com
```

### Storage Config

**File**: `src/config/storage.config.ts`

**Allowed Types**:
- **Images**: JPEG, PNG, GIF, WebP, SVG
- **Videos**: MP4, WebM, QuickTime, AVI
- **Documents**: PDF, DOC, DOCX, XLS, XLSX

**Size Limits**:
- **Images**: 10MB
- **Videos**: 100MB
- **Documents**: 20MB

**Image Sizes**:
```typescript
{
  thumbnail: { width: 150, height: 150 },
  small: { width: 320, height: 320 },
  medium: { width: 640, height: 640 },
  large: { width: 1280, height: 1280 },
  original: null  // Keep original
}
```

**Folders**:
```
avatars/           - User profile pictures
experiences/       - Experience photos
posts/             - Social media posts
stories/           - Stories (24h content)
reviews/           - Review media
documents/         - PDF, contracts, invoices
temp/              - Temporary uploads
```

---

## API Endpoints

### 1. Upload Single File

**POST** `/api/v1/media/upload`

**Headers**:
```
Authorization: Bearer <jwt-token>
Content-Type: multipart/form-data
```

**Request Body** (form-data):
```
file: <binary>
category: "post" | "avatar" | "experience" | "story" | "review" | "document" | "temp"
entityId: "uuid" (optional)
entityType: "post" | "experience" | "review" (optional)
```

**Response** (201):
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "originalName": "photo.jpg",
  "key": "posts/2024/01/uuid-photo.jpg",
  "url": "https://cdn.viajeroconectado.com/posts/2024/01/uuid-photo.jpg",
  "type": "image",
  "category": "post",
  "status": "processing",
  "mimeType": "image/jpeg",
  "size": 2048000,
  "width": null,
  "height": null,
  "variants": null,
  "createdAt": "2024-01-15T10:30:00Z"
}
```

**cURL Example**:
```bash
curl -X POST http://localhost:4000/api/v1/media/upload \
  -H "Authorization: Bearer <token>" \
  -F "file=@photo.jpg" \
  -F "category=post"
```

---

### 2. Upload Multiple Files

**POST** `/api/v1/media/upload-multiple`

**Request Body** (form-data):
```
files: <binary>[]  # Max 10 files
category: "post"
entityId: "uuid" (optional)
entityType: "post" (optional)
```

**Response** (201):
```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "originalName": "photo1.jpg",
    ...
  },
  {
    "id": "550e8400-e29b-41d4-a716-446655440001",
    "originalName": "photo2.jpg",
    ...
  }
]
```

**cURL Example**:
```bash
curl -X POST http://localhost:4000/api/v1/media/upload-multiple \
  -H "Authorization: Bearer <token>" \
  -F "files=@photo1.jpg" \
  -F "files=@photo2.jpg" \
  -F "category=post"
```

---

### 3. Get All Media

**GET** `/api/v1/media?category=post&limit=50`

**Query Parameters**:
- `category` (optional): Filter by category
- `limit` (optional): Limit results (default: 50)

**Response** (200):
```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "originalName": "photo.jpg",
    "url": "https://cdn.viajeroconectado.com/posts/2024/01/uuid-photo.jpg",
    "type": "image",
    "category": "post",
    "status": "ready",
    "size": 2048000,
    "width": 1920,
    "height": 1080,
    "variants": {
      "thumbnail": "https://cdn.viajeroconectado.com/posts/2024/01/uuid-photo-thumbnail.jpg",
      "small": "https://cdn.viajeroconectado.com/posts/2024/01/uuid-photo-small.jpg"
    },
    "createdAt": "2024-01-15T10:30:00Z"
  }
]
```

---

### 4. Get Media by ID

**GET** `/api/v1/media/:id`

**Response** (200):
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "originalName": "photo.jpg",
  "url": "https://cdn.viajeroconectado.com/posts/2024/01/uuid-photo.jpg",
  "type": "image",
  "category": "post",
  "status": "ready",
  "mimeType": "image/jpeg",
  "size": 2048000,
  "width": 1920,
  "height": 1080,
  "variants": {
    "thumbnail": "https://cdn.viajeroconectado.com/posts/2024/01/uuid-photo-thumbnail.jpg"
  },
  "createdAt": "2024-01-15T10:30:00Z"
}
```

---

### 5. Get Storage Statistics

**GET** `/api/v1/media/stats`

**Response** (200):
```json
{
  "totalFiles": 125,
  "totalSize": 52428800,
  "totalSizeMB": 50,
  "byCategory": {
    "avatar": {
      "count": 1,
      "size": 524288,
      "sizeMB": 0.5
    },
    "post": {
      "count": 50,
      "size": 20971520,
      "sizeMB": 20
    },
    "experience": {
      "count": 74,
      "size": 30932992,
      "sizeMB": 29.5
    }
  }
}
```

---

### 6. Get Media by Entity

**GET** `/api/v1/media/entity/:entityType/:entityId`

**Example**: `/api/v1/media/entity/post/550e8400-e29b-41d4-a716-446655440000`

**Response** (200):
```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "originalName": "photo.jpg",
    ...
  }
]
```

---

### 7. Get Signed URL (Temporary Access)

**GET** `/api/v1/media/:id/signed-url?expiresIn=3600`

**Query Parameters**:
- `expiresIn` (optional): Expiration time in seconds (default: 3600)

**Response** (200):
```json
{
  "url": "https://s3.amazonaws.com/bucket/file.jpg?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=...",
  "expiresIn": 3600
}
```

**Use Case**: Private files that need temporary access

---

### 8. Delete Media

**DELETE** `/api/v1/media/:id`

**Response** (200):
```json
{
  "message": "Media deleted successfully",
  "id": "550e8400-e29b-41d4-a716-446655440000"
}
```

**Note**: This is a soft delete. The file is marked as deleted but not physically removed from S3.

---

## Image Processing

### Process Flow

1. **Upload**: File is uploaded to S3 with status `uploading`
2. **Queue**: Image is added to Bull queue for processing
3. **Processing**:
   - Download original from S3
   - Extract metadata (width, height, EXIF)
   - Generate variants (thumbnail, small, medium, large)
   - Upload variants to S3
   - Update database with variant URLs
4. **Complete**: Status changes to `ready`

### Sharp Configuration

**Quality Settings**:
```typescript
.jpeg({
  quality: 85,          // Good balance
  progressive: true,    // Progressive JPEG
  mozjpeg: true,       // Better compression
})
```

**Resize Settings**:
```typescript
.resize(width, height, {
  fit: 'inside',                  // Maintain aspect ratio
  withoutEnlargement: true,       // Don't upscale
})
```

### Variants Generated

- **Thumbnail**: 150x150px (square crop for avatars)
- **Small**: 320x320px (gallery previews)
- **Medium**: 640x640px (mobile display)
- **Large**: 1280x1280px (desktop display)

---

## Usage Examples

### Frontend (React/Next.js)

#### Upload Avatar

```typescript
const uploadAvatar = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('category', 'avatar');

  const response = await fetch('http://localhost:4000/api/v1/media/upload', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: formData,
  });

  const media = await response.json();

  // Wait for processing to complete
  const checkStatus = async () => {
    const result = await fetch(`http://localhost:4000/api/v1/media/${media.id}`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    const updated = await result.json();

    if (updated.status === 'ready') {
      console.log('Variants:', updated.variants);
      return updated;
    }

    // Retry after delay
    setTimeout(checkStatus, 1000);
  };

  await checkStatus();
};
```

#### Upload Multiple Experience Photos

```typescript
const uploadExperiencePhotos = async (files: File[], experienceId: string) => {
  const formData = new FormData();

  files.forEach((file) => {
    formData.append('files', file);
  });

  formData.append('category', 'experience');
  formData.append('entityId', experienceId);
  formData.append('entityType', 'experience');

  const response = await fetch('http://localhost:4000/api/v1/media/upload-multiple', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: formData,
  });

  const mediaList = await response.json();
  console.log(`Uploaded ${mediaList.length} photos`);

  return mediaList;
};
```

#### Display Image with Variants

```tsx
interface MediaImageProps {
  media: Media;
  size?: 'thumbnail' | 'small' | 'medium' | 'large' | 'original';
}

const MediaImage: React.FC<MediaImageProps> = ({ media, size = 'medium' }) => {
  const url = media.variants?.[size] || media.url;

  return (
    <img
      src={url}
      alt={media.originalName}
      width={media.width}
      height={media.height}
    />
  );
};
```

---

### Backend Integration

#### Attach Media to Post

```typescript
// In PostService
async createPost(createPostDto: CreatePostDto, userId: string, mediaIds?: string[]) {
  const post = this.postRepository.create({
    ...createPostDto,
    userId,
  });

  await this.postRepository.save(post);

  // Link media to post
  if (mediaIds && mediaIds.length > 0) {
    await this.mediaRepository.update(
      { id: In(mediaIds), userId },
      { entityId: post.id, entityType: 'post' },
    );
  }

  return post;
}
```

#### Get Post with Media

```typescript
async getPostWithMedia(postId: string) {
  const post = await this.postRepository.findOne({
    where: { id: postId },
  });

  const media = await this.mediaService.findByEntity(postId, 'post');

  return {
    ...post,
    media,
  };
}
```

---

## Security

### File Validation

✅ **Implemented**:
- MIME type validation
- File size limits
- Extension checking
- User ownership verification

❌ **TODO**:
- Virus scanning (ClamAV)
- Content moderation (AWS Rekognition)
- NSFW detection

### Access Control

**Public Files**:
- Experience photos
- User avatars (if public profile)
- Post media (if public post)

**Private Files**:
- Documents
- Invoices
- Contracts
- Private messages media

**Implementation**:
```typescript
// In MediaController
@Get(':id/download')
async downloadFile(
  @Param('id') id: string,
  @CurrentUser() user: any,
) {
  const media = await this.mediaService.findOne(id, user.sub);

  // Check access permissions
  if (media.category === 'document') {
    // Additional permission checks
    await this.checkDocumentAccess(media, user);
  }

  // Generate signed URL for temporary access
  const signedUrl = await this.storageService.getSignedUrl(media.key, 300);

  return { url: signedUrl };
}
```

---

## Storage Quotas

### Default Limits

| Plan | Storage | Max File Size | Bandwidth |
|------|---------|---------------|-----------|
| Free | 1GB | 10MB | 5GB/month |
| Pro | 10GB | 50MB | 50GB/month |
| Business | 100GB | 100MB | 500GB/month |

### Quota Enforcement

```typescript
// In MediaService
async checkUserQuota(userId: string, fileSize: number): Promise<void> {
  const stats = await this.getUserStorageStats(userId);
  const user = await this.usersService.findOne(userId);

  const quota = this.getQuotaForPlan(user.subscriptionPlan);

  if (stats.totalSize + fileSize > quota.storage) {
    throw new BadRequestException('Storage quota exceeded');
  }
}
```

---

## Performance Optimization

### CDN Integration

**CloudFront** (AWS):
```typescript
const url = `https://d1234567890.cloudfront.net/${media.key}`;
```

**Cloudflare R2**:
```typescript
const url = `https://cdn.viajeroconectado.com/${media.key}`;
```

### Lazy Loading

```tsx
<img
  src={media.variants.thumbnail}
  data-src={media.variants.large}
  loading="lazy"
  onLoad={(e) => {
    e.target.src = e.target.dataset.src;
  }}
/>
```

### Progressive Image Loading

```tsx
const [loaded, setLoaded] = useState(false);

return (
  <div style={{ position: 'relative' }}>
    {/* Blur placeholder */}
    <img src={media.variants.thumbnail} style={{ filter: 'blur(10px)' }} />

    {/* Full resolution */}
    <img
      src={media.variants.large}
      onLoad={() => setLoaded(true)}
      style={{
        opacity: loaded ? 1 : 0,
        position: 'absolute',
        top: 0,
        left: 0,
      }}
    />
  </div>
);
```

---

## Monitoring

### Metrics to Track

1. **Upload Performance**:
   - Average upload time
   - Upload success rate
   - Failed uploads

2. **Processing Performance**:
   - Average processing time per image
   - Queue depth
   - Processing failures

3. **Storage**:
   - Total storage used
   - Storage by user/category
   - Growth rate

4. **Bandwidth**:
   - Download bandwidth
   - CDN hit rate
   - Traffic patterns

### Bull Board

Monitor image processing queue:

```
http://localhost:4000/admin/queues
```

View:
- Active jobs
- Completed jobs
- Failed jobs
- Queue metrics

---

## Troubleshooting

### Issue: Upload Fails with "File too large"

**Cause**: File exceeds max size for type

**Solution**:
```typescript
// Check limits in storage.config.ts
MAX_IMAGE_SIZE: 10 * 1024 * 1024, // 10MB
```

---

### Issue: Image Processing Stuck

**Cause**: Queue processor not running or crashed

**Solution**:
```bash
# Check Bull Board
http://localhost:4000/admin/queues

# Restart backend
pnpm run dev

# Check logs
docker-compose logs -f backend
```

---

### Issue: Variants Not Generated

**Cause**: Sharp not installed correctly

**Solution**:
```bash
# Approve sharp build scripts
pnpm approve-builds

# Rebuild sharp
cd apps/backend
pnpm rebuild sharp
```

---

### Issue: S3 Upload Fails

**Cause**: Invalid credentials or bucket

**Solution**:
```bash
# Check environment variables
echo $AWS_ACCESS_KEY_ID
echo $AWS_SECRET_ACCESS_KEY
echo $AWS_S3_BUCKET

# Test MinIO connection
curl http://localhost:9000

# Check MinIO console
http://localhost:9001
```

---

## Future Enhancements

### Short-term
- [ ] Video transcoding (FFmpeg)
- [ ] PDF thumbnail generation
- [ ] Automatic backup to multiple regions
- [ ] Duplicate detection (perceptual hashing)
- [ ] Batch operations (delete multiple)

### Long-term
- [ ] AI-powered tagging
- [ ] Face detection and blurring
- [ ] Automatic alt text generation
- [ ] Smart cropping (focal points)
- [ ] WebP/AVIF format support
- [ ] HEIC support (iOS photos)

---

## Resources

- [AWS S3 Documentation](https://docs.aws.amazon.com/s3/)
- [MinIO Documentation](https://min.io/docs/minio/linux/index.html)
- [Sharp Documentation](https://sharp.pixelplumbing.com/)
- [Bull Queue Documentation](https://github.com/OptimalBits/bull)

---

## Support

For issues with Media Module:
1. Check Bull Board for processing status
2. Verify S3/MinIO connectivity
3. Check application logs
4. Review this documentation

**Logs**: `docker-compose logs -f backend | grep Media`
