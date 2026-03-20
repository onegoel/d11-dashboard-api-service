export const isPrismaRecordNotFoundError = (error) => {
    if (typeof error !== "object" || error === null) {
        return false;
    }
    return error.code === "P2025";
};
//# sourceMappingURL=prisma-error.utils.js.map