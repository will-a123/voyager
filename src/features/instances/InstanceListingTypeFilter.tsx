import type { IonActionSheetCustomEvent } from "@ionic/core";
import {
  ActionSheetButton,
  IonActionSheet,
  IonButton,
  IonIcon,
} from "@ionic/react";
import { OverlayEventDetail } from "@ionic/react/dist/types/components/react-component-lib/interfaces";
import { earthOutline, linkOutline } from "ionicons/icons";
import { useState } from "react";

import { scrollUpIfNeeded } from "#/helpers/scrollUpIfNeeded";
import useGetAppScrollable from "#/helpers/useGetAppScrollable";

export type InstanceListingType = "Linked" | "Allowed";

const BUTTONS: ActionSheetButton<InstanceListingType>[] = [
  { text: "Linked", data: "Linked", icon: linkOutline },
  { text: "Allowed", data: "Allowed", icon: earthOutline },
];

interface InstanceListingTypeFilterProps {
  listingType: InstanceListingType;
  setListingType: (listingType: InstanceListingType) => void;
}

export default function InstanceListingTypeFilter({
  listingType,
  setListingType,
}: InstanceListingTypeFilterProps) {
  const [open, setOpen] = useState(false);
  const getAppScrollable = useGetAppScrollable();

  return (
    <>
      <IonButton onClick={() => setOpen(true)}>
        <IonIcon
          icon={listingType === "Linked" ? linkOutline : earthOutline}
          slot="icon-only"
        />
      </IonButton>
      <IonActionSheet
        cssClass="left-align-buttons"
        isOpen={open}
        onDidDismiss={() => setOpen(false)}
        onWillDismiss={(
          e: IonActionSheetCustomEvent<OverlayEventDetail<InstanceListingType>>,
        ) => {
          if (!e.detail.data) return;
          setListingType(e.detail.data);
          scrollUpIfNeeded(getAppScrollable(), 1, "auto");
        }}
        header="Filter by..."
        buttons={BUTTONS.map((b) => ({
          ...b,
          role: listingType === b.data ? "selected" : undefined,
        }))}
      />
    </>
  );
}
