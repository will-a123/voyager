import { IonBackButton, IonButtons, IonToolbar } from "@ionic/react";
import { useState } from "react";
import { CommunityView, ListingType } from "threadiverse";

import { ExploreModeProvider } from "#/features/explore/ExploreModeContext";
import ExploreModeDropdown from "#/features/explore/ExploreModeDropdown";
import ExploreModePicker from "#/features/explore/ExploreModePicker";
import CommunityFeed from "#/features/feed/CommunityFeed";
import { AbortLoadError, FetchFn } from "#/features/feed/Feed";
import ListingTypeFilter from "#/features/feed/ListingType";
import useFeedSort, {
  useFeedSortParams,
} from "#/features/feed/sort/useFeedSort";
import AppHeader from "#/features/shared/AppHeader";
import { AppPage } from "#/helpers/AppPage";
import { useBuildGeneralBrowseLink } from "#/helpers/routes";
import useClient from "#/helpers/useClient";
import FeedContent from "#/routes/pages/shared/FeedContent";
import { LIMIT } from "#/services/lemmy";

import { CommunitySort } from "./results/CommunitySort";

function CommunitiesExploreContent() {
  const buildGeneralBrowseLink = useBuildGeneralBrowseLink();
  const client = useClient();
  const [sort, setSort] = useFeedSort("communities", {
    internal: "CommunitiesExplore",
  });
  const sortParams = useFeedSortParams("communities", sort);
  const [listingType, setListingType] = useState<ListingType>("All");

  const fetchFn: FetchFn<CommunityView> = async (page_cursor, ...rest) => {
    if (sortParams === undefined) throw new AbortLoadError();

    return client.listCommunities(
      {
        limit: LIMIT,
        type_: listingType,
        page_cursor,
        ...sortParams,
      },
      ...rest,
    );
  };

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

          <ExploreModePicker mode="communities">
            <IonButtons slot="end">
              <ListingTypeFilter
                listingType={listingType}
                setListingType={setListingType}
              />
              <CommunitySort sort={sort} setSort={setSort} />
            </IonButtons>
          </ExploreModePicker>
        </IonToolbar>
      </AppHeader>
      <FeedContent>
        <CommunityFeed fetchFn={fetchFn} />
        <ExploreModeDropdown mode="communities" />
      </FeedContent>
    </AppPage>
  );
}

export default function CommunitiesExplorePage() {
  return (
    <ExploreModeProvider>
      <CommunitiesExploreContent />
    </ExploreModeProvider>
  );
}
