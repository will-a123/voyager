import type { IonActionSheetCustomEvent } from "@ionic/core";
import {
  ActionSheetButton,
  IonActionSheet,
  IonButton,
  IonIcon,
} from "@ionic/react";
import { OverlayEventDetail } from "@ionic/react/dist/types/components/react-component-lib/interfaces";
import { calendarOutline } from "ionicons/icons";
import { useState } from "react";

import { alphabeticalAsc } from "#/features/icons";
import { scrollUpIfNeeded } from "#/helpers/scrollUpIfNeeded";
import useGetAppScrollable from "#/helpers/useGetAppScrollable";

export type InstanceSortType = "NameAsc" | "Age";

interface InstanceSortProps {
  sort: InstanceSortType;
  setSort: (sort: InstanceSortType) => void;
}

const BUTTONS: ActionSheetButton<InstanceSortType>[] = [
  { text: "A-Z", data: "NameAsc", icon: alphabeticalAsc },
  { text: "Age", data: "Age", icon: calendarOutline },
];

export default function InstanceSort({ sort, setSort }: InstanceSortProps) {
  const [open, setOpen] = useState(false);
  const getAppScrollable = useGetAppScrollable();

  return (
    <>
      <IonButton onClick={() => setOpen(true)}>
        <IonIcon
          icon={sort === "NameAsc" ? alphabeticalAsc : calendarOutline}
          slot="icon-only"
        />
      </IonButton>
      <IonActionSheet
        cssClass="left-align-buttons"
        isOpen={open}
        onDidDismiss={() => setOpen(false)}
        onWillDismiss={(
          e: IonActionSheetCustomEvent<OverlayEventDetail<InstanceSortType>>,
        ) => {
          if (!e.detail.data) return;
          setSort(e.detail.data);
          scrollUpIfNeeded(getAppScrollable(), 1, "auto");
        }}
        header="Sort by..."
        buttons={BUTTONS.map((b) => ({
          ...b,
          role: sort === b.data ? "selected" : undefined,
        }))}
      />
    </>
  );
}
