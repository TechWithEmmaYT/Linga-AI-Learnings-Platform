"use server"

interface AsyncHandlerOptions {
  fallbackError?: any
}

export async function asyncHandler<T>(
  action: () => Promise<T>,
  options: AsyncHandlerOptions = {}
) {
  const { fallbackError } = options

  try {
    return await action();
  } catch (error) {
    if (fallbackError !== undefined) return fallbackError;
    throw error
  }
}
