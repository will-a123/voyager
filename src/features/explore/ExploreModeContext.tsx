import { noop } from "es-toolkit";
import React, { createContext, useState } from "react";

interface ExploreModeContextType {
  search: string;
  setSearch: (search: string) => void;
  searching: boolean;
  setSearching: (searching: boolean) => void;
}

export const ExploreModeContext = createContext<ExploreModeContextType>({
  search: "",
  setSearch: noop,
  searching: false,
  setSearching: noop,
});

export function ExploreModeProvider({ children }: React.PropsWithChildren) {
  const [search, setSearch] = useState("");
  const [searching, setSearching] = useState(false);

  return (
    <ExploreModeContext value={{ search, setSearch, searching, setSearching }}>
      {children}
    </ExploreModeContext>
  );
}
