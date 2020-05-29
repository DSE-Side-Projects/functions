type responseArray = () => Promise<Array<SanityDocument>>

interface Deploy {
  _ref: string
  _type: string
}

interface Description {
    _key: string
    _type: string
    children: Array<any>,
    markDefs: Array<any>
    style: string
}

interface Screenshot {
  _type: string,
  asset: Record<string, string>
}

interface Slug {
  _type: string,
  current: string
}
interface Technology {
  _type: string,
  _ref: string
}
interface SanityDocument {
    _createdAt: string
    _id: string
    _rev: string
    _type: string,
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
