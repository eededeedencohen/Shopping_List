import httpClient from "../network/index";

/**
 * עוזר קטן – פענוח תגובת שרת במקרה שהיא מחרוזת
 */
const normalize = (data) =>
  typeof data === "string" ? JSON.parse(data) : data;

/**
 * קבלת כל הקבוצות
 */
export const getAllGroups = async () => {
  try {
    const res = await httpClient.get("/grouped-barcodes");
    const payload = normalize(res.data);
    return payload?.data?.allGroups || [];
  } catch (error) {
    console.error("Error fetching all groups:", error);
    throw error;
  }
};

/**
 * יצירת קבוצה
 */
export const createGroup = async (groupData) => {
  try {
    await httpClient.post("/grouped-barcodes", JSON.stringify(groupData), {
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Error creating group:", error);
    throw error;
  }
};

/**
 * עדכון קבוצה לפי שם
 */
export const updateGroupByName = async (groupName, updatedData) => {
  try {
    const res = await httpClient.patch(
      `/grouped-barcodes/${groupName}`,
      JSON.stringify(updatedData),
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    const payload = normalize(res.data);
    return payload?.data?.updatedGroup || null;
  } catch (error) {
    console.error("Error updating group:", error);
    throw error;
  }
};

/**
 * מחיקת קבוצה לפי שם
 */
export const deleteGroupByName = async (groupName) => {
  try {
    await httpClient.delete(`/grouped-barcodes/${groupName}`, {
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Error deleting group:", error);
    throw error;
  }
};

/**
 * שינוי שם של קבוצה
 */
export const renameGroup = async ({ currentName, newName }) => {
  try {
    const res = await httpClient.patch(
      "/grouped-barcodes/rename",
      JSON.stringify({ currentName, newName }),
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    const payload = normalize(res.data);
    return payload?.data?.group || null;
  } catch (error) {
    console.error("Error renaming group:", error);
    throw error;
  }
};

/**
 * העתקת תכולת קבוצה אחת לאחרת
 */
export const copyGroupContent = async ({ fromGroupName, toGroupName }) => {
  try {
    const res = await httpClient.post(
      "/grouped-barcodes/copy",
      JSON.stringify({ fromGroupName, toGroupName }),
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    const payload = normalize(res.data);
    return payload?.data?.toGroup || null;
  } catch (error) {
    console.error("Error copying group content:", error);
    throw error;
  }
};
