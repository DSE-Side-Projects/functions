type responseArray = () => Promise<Array<SanityDocument>>

interface Deploy {
  _ref: string
  _type: string
}

interface Description {
  _key: string
  _type: string
  children: Array<unknown>
  markDefs: Array<unknown>
  style: string
}

interface Screenshot {
  _type: string
  asset: Record<string, string>
}

interface Slug {
  _type: string
  current: string
}
interface Technology {
  _type: string
  _ref: string
}
interface SanityDocument {
  _createdAt: string
  _id: string
  _rev: string
  _type: string
  _updatedAt: string
  deploy: Deploy
  description: Description
  docs: string
  github: string
  quickstart: string
  screenshot: Screenshot
  slug: Slug
  technology: Technology
  title: string
  url: string
}

interface ImageAssetMetadata {
  _type: string
  dimensions: {
    _type: string
    width: number
    height: number
    aspectRatio: number
  }
  palette: {
    _type: string
    vibrant: Record<string, unknown>
    lightVibrant: Record<string, unknown>
    darkVibrant: Record<string, unknown>
    muted: Record<string, unknown>
    lightMuted: Record<string, unknown>
    darkMuted: Record<string, unknown>
    dominant: Record<string, unknown>
  }
  lqip: string
  hasAlpha: boolean
  isOpaque: boolean
}

interface ImageAsset {
  _type: string
  uploadId: string
  _id: string
  assetId: string
  sha1hash: string
  path: string
  url: string
  originalFilename: string
  extension: string
  metadata: ImageAssetMetadata
  size: number
  mimeType: string
}
