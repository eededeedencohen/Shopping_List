import { createContext, useEffect, useState, useContext } from "react";
import { getAllGroups } from "../services/groupsServices";

import {
  createGroup,
  updateGroupByName,
  deleteGroupByName,
  renameGroup,
  copyGroupContent,
} from "../services/groupsServices";

const GroupContext = createContext(null);

export const GroupContextProvider = ({ children }) => {
  const [groups, setGroups] = useState([]);
  const [isLoadingGroups, setIsLoadingGroups] = useState(false);

  useEffect(() => {
    const loadGroups = async () => {
      setIsLoadingGroups(true);
      try {
        const all = await getAllGroups();
        setGroups(all);
      } catch (err) {
        console.error("Failed to load groups:", err);
      } finally {
        setIsLoadingGroups(false);
      }
    };
    loadGroups();
  }, []);

  return (
    <GroupContext.Provider
      value={{
        groups,
        setGroups,
        isLoadingGroups,
        createGroup,
        updateGroupByName,
        deleteGroupByName,
        renameGroup,
        copyGroupContent,
      }}
    >
      {children}
    </GroupContext.Provider>
  );
};

export const useGroups = () => {
  const context = useContext(GroupContext);
  if (!context) {
    throw new Error("useGroups must be used within a GroupContextProvider");
  }
  return context;
};
