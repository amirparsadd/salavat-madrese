export function log(
  type: "error" | "info" | "debug" | "warn",
  service: string,
  message: string,
  metadata: Record<string, number | boolean | string | undefined> = {}
) {
  if(process.env.NODE_ENV !== "production") {
    return console[type](`[${type.toUpperCase()}] [${service}] ${message} (${JSON.stringify(metadata)})`)
  }

  if(type === "debug") return // We're on prod

  return console[type](JSON.stringify({
    type, service, message, metadata
  }))
}