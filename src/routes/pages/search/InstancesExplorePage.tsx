import { IonBackButton, IonButtons, IonContent, IonToolbar } from "@ionic/react";
import { use, useEffect, useMemo, useState } from "react";

import {
  ExploreModeContext,
  ExploreModeProvider,
} from "#/features/explore/ExploreModeContext";
import ExploreModeDropdown from "#/features/explore/ExploreModeDropdown";
import ExploreModePicker from "#/features/explore/ExploreModePicker";
import InstanceListingTypeFilter, {
  InstanceListingType,
} from "#/features/instances/InstanceListingTypeFilter";
import InstanceSort, {
  InstanceSortType,
} from "#/features/instances/InstanceSort";
import { getInstances } from "#/features/instances/instancesSlice";
import InstanceSummary from "#/features/instances/InstanceSummary";
import AppHeader from "#/features/shared/AppHeader";
import { CenteredSpinner } from "#/features/shared/CenteredSpinner";
import { AppPage } from "#/helpers/AppPage";
import { useBuildGeneralBrowseLink } from "#/helpers/routes";
import { useAppDispatch, useAppSelector } from "#/store";

function InstancesExploreContent() {
  const buildGeneralBrowseLink = useBuildGeneralBrowseLink();
  const dispatch = useAppDispatch();
  const { search } = use(ExploreModeContext);
  const knownInstances = useAppSelector(
    (state) => state.instances.knownInstances,
  );
  const [listingType, setListingType] = useState<InstanceListingType>("Linked");
  const [sort, setSort] = useState<InstanceSortType>("NameAsc");

  useEffect(() => {
    dispatch(getInstances());
  }, [dispatch]);

  const result = useMemo(() => {
    if (!knownInstances || knownInstances === "pending") return null;

    const linkedSet = new Set(knownInstances.linked.map((i) => i.domain));
    const supportedSoftware = new Set(["lemmy", "piefed"]);
    const isSupportedInstance = (i: { software?: string }) =>
      !i.software ||
      supportedSoftware.has(i.software.toLowerCase());

    const base = (
      listingType === "Linked"
        ? knownInstances.linked
        : (knownInstances.allowed ?? [])
    ).filter(isSupportedInstance);

    const filtered = search
      ? base.filter((i) =>
          i.domain.toLowerCase().includes(search.toLowerCase()),
        )
      : base;

    const sorted = [...filtered].sort((a, b) => {
      if (sort === "NameAsc") return a.domain.localeCompare(b.domain);
      if (!a.published) return 1;
      if (!b.published) return -1;
      return new Date(a.published).getTime() - new Date(b.published).getTime();
    });

    return { instances: sorted, linkedSet };
  }, [knownInstances, listingType, sort, search]);

  return (
    <AppPage>
      <AppHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton
              text="Search"
              defaultHref={buildGeneralBrowseLink("")}
            />
          </IonButtons>

          <ExploreModePicker mode="instances">
            <IonButtons slot="end">
              <InstanceListingTypeFilter
                listingType={listingType}
                setListingType={setListingType}
              />
              <InstanceSort sort={sort} setSort={setSort} />
            </IonButtons>
          </ExploreModePicker>
        </IonToolbar>
      </AppHeader>
      <IonContent>
        {!result ? (
          <CenteredSpinner />
        ) : (
          result.instances.map((instance) => (
            <InstanceSummary
              key={instance.domain}
              instance={instance}
              linked={result.linkedSet.has(instance.domain)}
            />
          ))
        )}
        <ExploreModeDropdown mode="instances" />
      </IonContent>
    </AppPage>
  );
}

export default function InstancesExplorePage() {
  return (
    <ExploreModeProvider>
      <InstancesExploreContent />
    </ExploreModeProvider>
  );
}
