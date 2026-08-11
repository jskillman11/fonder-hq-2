"use client";

import { createContext } from "react";

// Supplied once by FonderHQ; consumed by every <EditableText> in the tree.
export const EditContext = createContext({
  isAdmin: false,
  drafts: {},
  programId: null,
  onSaved: () => {},
});
