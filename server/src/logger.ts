export function log(
  type: "error" | "info" | "debug" | "warn",
  service: string,
  message: string,
  metadata: Record<string, number | boolean | string | undefined> = {}
) {
  if(process.env.NODE_ENV !== "production") {
    return console[type](`[${type.toUpperCase()}] [${service}] ${message} (${JSON.stringify(metadata)})`)
  }

  return console[type]({
    type, service, message, metadata
  })
}