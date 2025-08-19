declare module '*.jpg' {
  const value: string;
  export default value;
}
declare module "*.png" {
  const value: string;
  export default value;
}

interface ImportMeta {
  readonly env: Record<string, string | undefined>;
}