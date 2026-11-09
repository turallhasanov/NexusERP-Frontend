// A product form picks photos in order: the first is the main photo (Əsas şəkil), the rest are gallery photos. The edit
// form may also hold the photo the product already has; it stays the main one until a new file is made main or it is
// removed. NexusERP keeps only the main photo; the gallery photos go to the Khazar store with the save.

export const MAX_PHOTOS = 8

// What to send: `image` becomes the product's main photo, `gallery` the extra photos.
export function splitPhotos(files, keepCurrent = false) {
  if (keepCurrent) {
    return { image: null, gallery: files }
  }

  return { image: files[0] ?? null, gallery: files.slice(1) }
}

// Moves the file at `index` to the front, making it the main photo.
export function makeMain(files, index) {
  if (index <= 0 || index >= files.length) {
    return files
  }

  return [files[index], ...files.slice(0, index), ...files.slice(index + 1)]
}

// A file picked twice (same name, size and date) is kept once.
export function sameFile(a, b) {
  return a.name === b.name && a.size === b.size && a.lastModified === b.lastModified
}

export function addFiles(files, picked, maxTotal) {
  const merged = [...files]

  for (const file of picked) {
    if (merged.length >= maxTotal) {
      break
    }

    if (!merged.some((existing) => sameFile(existing, file))) {
      merged.push(file)
    }
  }

  return merged
}
