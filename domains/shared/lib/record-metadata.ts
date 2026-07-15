export type SourceReference = {
  url: string;
  title?: string;
  sourceType?: string;
  publishedAt?: string;
  checkedAt: string;
};

export type RecordMetadata = {
  lastVerifiedAt: string;
  updatedAt: string;
  sources: SourceReference[];
};
