import { IonBackButton, IonButtons, IonTitle, IonToolbar } from "@ionic/react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "react-router";
import { CommunityView, ListingType, ThreadiverseMode } from "threadiverse";

import CommunityFeed from "#/features/feed/CommunityFeed";
import { AbortLoadError, FetchFn } from "#/features/feed/Feed";
import ListingTypeFilter from "#/features/feed/ListingType";
import useFeedSort, {
  getFeedSortParamsForMode,
} from "#/features/feed/sort/useFeedSort";
import AppHeader from "#/features/shared/AppHeader";
import { AppPage } from "#/helpers/AppPage";
import FeedContent from "#/routes/pages/shared/FeedContent";
import { getClient } from "#/services/client";
import { LIMIT } from "#/services/lemmy";

import { CommunitySort } from "./results/CommunitySort";

interface InstanceCommunitiesParams {
  instance: string;
}

export default function InstanceCommunitiesPage() {
  const { instance } = useParams<InstanceCommunitiesParams>();
  const [sort, setSort] = useFeedSort("communities", {
    internal: "InstanceCommunities",
  });
  const [listingType, setListingType] = useState<ListingType>("Local");
  const [instanceMode, setInstanceMode] = useState<
    ThreadiverseMode | null | undefined
  >(undefined);

  const instanceClient = useMemo(() => getClient(instance), [instance]);

  useEffect(() => {
    instanceClient
      .getMode()
      .then(setInstanceMode)
      .catch(() => setInstanceMode(null));
  }, [instanceClient]);

  const fetchFn: FetchFn<CommunityView> = useCallback(
    async (page_cursor, options) => {
      // Compute sortParams inside callback so object reference instability
      // doesn't cause fetchFn to change identity on every render
      const sortParams = getFeedSortParamsForMode(
        "communities",
        sort,
        instanceMode,
      );
      if (sortParams === undefined) throw new AbortLoadError();

      const result = await instanceClient.listCommunities(
        {
          limit: LIMIT,
          type_: listingType,
          page_cursor,
          ...sortParams,
        },
        options,
      );

      // Communities returned by a remote instance have `local: true` from that
      // server's perspective, but they're all remote from the user's home server.
      // Override `local: false` so getHandle() returns the full name@instance
      // handle, which the home server needs to look up the community.
      return {
        ...result,
        data: result.data.map((cv) => ({
          ...cv,
          community: { ...cv.community, local: false },
        })),
      };
    },
    [instanceClient, listingType, sort, instanceMode],
  );

  return (
    <AppPage>
      <AppHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton
              text="Instances"
              defaultHref="/search/explore/instances"
            />
          </IonButtons>

          <IonTitle>{instance}</IonTitle>

          <IonButtons slot="end">
            <ListingTypeFilter
              listingType={listingType}
              setListingType={setListingType}
            />
            <CommunitySort sort={sort} setSort={setSort} />
          </IonButtons>
        </IonToolbar>
      </AppHeader>
      <FeedContent>
        <CommunityFeed fetchFn={fetchFn} key={`${instance}-${listingType}`} />
      </FeedContent>
    </AppPage>
  );
}
