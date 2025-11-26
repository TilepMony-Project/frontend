interface ImportMeta {
  readonly env: Record<string, string | undefined> & {
    GTM_ID?: string;
  };
}
