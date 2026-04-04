import { IonIcon, IonItem } from "@ionic/react";
import { linkOutline } from "ionicons/icons";
import { Instance } from "threadiverse";

import Ago from "#/features/labels/Ago";

import styles from "./InstanceSummary.module.css";

interface InstanceSummaryProps {
  instance: Instance;
  linked?: boolean;
}

export default function InstanceSummary({
  instance,
  linked,
}: InstanceSummaryProps) {
  return (
    <IonItem
      className={styles.item}
      routerLink={`/search/explore/instances/${instance.domain}/communities`}
      detail={false}
    >
      <div className={styles.contents}>
        <div className={styles.title}>
          <span className={styles.domain}>{instance.domain}</span>
          {linked && (
            <IonIcon icon={linkOutline} className={styles.linkedIcon} />
          )}
        </div>
        <div className={styles.stats}>
          {instance.software && (
            <span>
              {instance.software}
              {instance.version && ` ${instance.version}`}
            </span>
          )}
          {instance.published && (
            <>
              {instance.software && " · "}
              <Ago date={instance.published} /> Old
            </>
          )}
        </div>
      </div>
    </IonItem>
  );
}
