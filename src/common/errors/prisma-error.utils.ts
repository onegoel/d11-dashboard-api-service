type PrismaLikeError = {
  code?: unknown;
};

export const isPrismaRecordNotFoundError = (error: unknown) => {
  if (typeof error !== "object" || error === null) {
    return false;
  }

  return (error as PrismaLikeError).code === "P2025";
};
