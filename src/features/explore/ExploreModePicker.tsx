import { IonButton, IonButtons, IonIcon } from "@ionic/react";
import { chevronDown, close } from "ionicons/icons";
import { use, useEffect, useRef } from "react";

import AppTitle from "#/features/shared/AppTitle";
import { isIosTheme } from "#/helpers/device";

import { ExploreModeContext } from "./ExploreModeContext";

import styles from "./ExploreModePicker.module.css";

export type ExploreMode = "communities" | "instances";

interface ExploreModePickerProps {
  mode: ExploreMode;
  children?: React.ReactNode;
}

export default function ExploreModePicker({
  mode,
  children,
}: ExploreModePickerProps) {
  const { search, setSearch, searching, setSearching } =
    use(ExploreModeContext);
  const searchRef = useRef<HTMLInputElement>(null);
  const titleRef = useRef<HTMLElement>(null);

  const name = mode === "communities" ? "Communities" : "Instances";
  const placeholder = mode === "communities" ? "Community..." : "Instance...";

  useEffect(() => {
    if (!searching) return;
    searchRef.current?.focus();
  }, [searching]);

  useEffect(() => {
    const activate = () => setSearching(true);
    const title = titleRef.current;
    title?.addEventListener("click", activate);
    return () => title?.removeEventListener("click", activate);
  }, [searching, setSearching]);

  if (searching) {
    return (
      <>
        <AppTitle>
          <input
            className={styles.input}
            ref={searchRef}
            placeholder={placeholder}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Escape" || e.key === "Tab") {
                setSearching(false);
                setSearch("");
              }
            }}
          />
        </AppTitle>
        <IonButtons slot="end">
          <IonButton
            onClick={() => {
              setSearching(false);
              setSearch("");
            }}
          >
            {isIosTheme() ? (
              "Cancel"
            ) : (
              <IonIcon icon={close} slot="icon-only" />
            )}
          </IonButton>
        </IonButtons>
      </>
    );
  }

  return (
    <>
      <AppTitle fullPadding={75}>
        <span ref={titleRef} className={styles.titleContents}>
          <span>{name}</span>{" "}
          <IonIcon className={styles.dropdownIcon} icon={chevronDown} />
        </span>
      </AppTitle>
      {children}
    </>
  );
}
