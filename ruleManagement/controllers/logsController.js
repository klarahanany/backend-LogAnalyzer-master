async function getAllLogs(databaseName) {
    try {
        const conn = await getDatabaseConnection(databaseName);

        const result = await conn.LogSchema.find({}, { _id: 0, __v: 0 });
        return result;
    } catch (error) {
        console.log("Error in get all rules", error);
        return "error";
    }
}