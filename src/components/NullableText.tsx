interface NullableTextProps {
    value: { String: string; Valid: boolean } | null | undefined;
    fallback?: string;
  }
  
  export default function NullableText({ value, fallback = "-" }: NullableTextProps) {
    if (!value || !value.Valid || !value.String) {
      return <>{fallback}</>;
    }
    return <>{value.String}</>;
  }
  